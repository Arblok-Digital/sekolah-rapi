import { createSupabaseClient } from '@/shared/services/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { SPPPayment, SPPFilter, SPPFormInput, SPSSummary } from '../types/spp.types';

const TABLE = 'spp_payments';

/**
 * Fetch SPP payments with optional filters and student join.
 */
export async function getSPPPayments(
  schoolId: string,
  filter?: SPPFilter
): Promise<SPPPayment[]> {
  const supabase = createSupabaseClient();

  let query = supabase
    .from(TABLE)
    .select(
      `
      *,
      students!inner(name, nis, class),
      category:categories(name)
    `
    )
    .eq('school_id', schoolId)
    .order('year', { ascending: false, nullsFirst: false })
    .order('month', { ascending: false, nullsFirst: false });

  if (filter?.month) {
    query = query.eq('month', filter.month);
  }
  if (filter?.year) {
    // Pembayaran tanpa periode (year NULL — seragam, pendaftaran, dst) tetap
    // ikut tampil agar tidak hilang dari daftar.
    query = query.or(`year.eq.${filter.year},year.is.null`);
  }
  if (filter?.status) {
    query = query.eq('status', filter.status);
  }
  if (filter?.student_id) {
    query = query.eq('student_id', filter.student_id);
  }
  if (filter?.class) {
    query = query.eq('students.class', filter.class);
  }
  if (filter?.category) {
    query = query.eq('category_id', filter.category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[SPP Service] getSPPPayments error:', error);
    throw new Error(error.message);
  }

  return (data ?? []).map(mapPayment);
}

/**
 * Get SPP payments for a specific student.
 */
export async function getStudentSPPPayments(
  schoolId: string,
  studentId: string
): Promise<SPPPayment[]> {
  return getSPPPayments(schoolId, { student_id: studentId });
}

/**
 * Create a new SPP payment record.
 */
export async function createSPPPayment(
  schoolId: string,
  userId: string,
  input: SPPFormInput
): Promise<SPPPayment> {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      school_id: schoolId,
      student_id: input.student_id,
      category_id: input.category_id ?? null,
      month: input.month ?? null,
      year: input.year ?? null,
      amount: input.amount,
      paid_amount: input.paid_amount,
      status: input.status,
      payment_date: input.payment_date || new Date().toISOString().split('T')[0],
      method: input.method || null,
      receipt_number: input.receipt_number || null,
      recorded_by: userId,
    })
    .select()
    .single();

  if (error) {
    console.error('[SPP Service] createSPPPayment error:', error);
    throw new Error(error.message);
  }

  // Auto-create transaction when the payment is paid
  if (input.status === 'paid' && input.paid_amount && input.paid_amount > 0) {
    await createSPPIncomeTransaction(supabase, {
      schoolId,
      userId,
      sourceId: data.id,
      month: input.month,
      year: input.year,
      amount: input.paid_amount,
      referenceDate: input.payment_date,
      categoryId: input.category_id,
    });
  }

  return data as SPPPayment;
}

/**
 * Get outstanding (unpaid / partial) SPP payments.
 */
export async function getOutstanding(
  schoolId: string,
  month?: number,
  year?: number
): Promise<SPPPayment[]> {
  const supabase = createSupabaseClient();

  const now = new Date();
  const filterMonth = month || now.getMonth() + 1;
  const filterYear = year || now.getFullYear();

  const { data, error } = await supabase
    .from(TABLE)
    .select(
      `
      *,
      students!inner(name, nis, class)
    `
    )
    .eq('school_id', schoolId)
    .eq('month', filterMonth)
    .eq('year', filterYear)
    .not('status', 'eq', 'paid')
    .order('student_id');

  if (error) {
    console.error('[SPP Service] getOutstanding error:', error);
    throw new Error(error.message);
  }

  return (data ?? []).map(mapPayment);
}

/**
 * Bulk-generate unpaid SPP bills for all active students of a month/year.
 * Skips students who already have a bill for that period.
 */
export async function bulkCreateSPPPayments(
  schoolId: string,
  userId: string,
  params: { month: number; year: number; amount: number }
): Promise<{ created: number; existing: number; students: number }> {
  const supabase = createSupabaseClient();

  // Bulk tagihan selalu khusus kategori SPP — kategori lain diinput per baris
  // lewat form (perluannya: tagihan non-bulanan tidak digenerasi massal).
  const sppCategory = await ensureSPPCategory(supabase, schoolId);

  const { data: students, error: studentError } = await supabase
    .from('students')
    .select('id')
    .eq('school_id', schoolId)
    .eq('status', 'active');
  if (studentError) throw new Error(studentError.message);

  const { data: existing, error: existingError } = await supabase
    .from(TABLE)
    .select('student_id')
    .eq('school_id', schoolId)
    .eq('category_id', sppCategory.id)
    .eq('month', params.month)
    .eq('year', params.year);
  if (existingError) throw new Error(existingError.message);

  const billedIds = new Set(existing?.map((e) => e.student_id));
  const newStudents = (students ?? []).filter((s) => !billedIds.has(s.id));

  if (newStudents.length > 0) {
    const rows = newStudents.map((s) => ({
      school_id: schoolId,
      student_id: s.id,
      category_id: sppCategory.id,
      month: params.month,
      year: params.year,
      amount: params.amount,
      paid_amount: 0,
      status: 'unpaid',
      recorded_by: userId,
    }));

    const { error } = await supabase.from(TABLE).insert(rows);
    if (error) throw new Error(error.message);
  }

  return {
    created: newStudents.length,
    existing: billedIds.size,
    students: students?.length ?? 0,
  };
}

/**
 * Ambil daftar siswa yang BELUM bayar untuk suatu periode — konsisten dengan
 * Overview (total siswa aktif − siswa yang sudah bayar/angsuran). Berlaku per
 * kategori: siswa yang masih punya tagihan lunas SEBAGIAN (mis. SPP lunas tapi
 * seragam belum) tetap tampil. Siswa aktif yang belum punya tagihan sama sekali
 * ikut tampil (no_bill) supaya tidak 'hilang' dari pantauan tunggakan.
 */
export async function getUnpaidPayments(
  schoolId: string,
  options?: { month?: number; year?: number; classFilter?: string; category?: string }
): Promise<SPPPayment[]> {
  const supabase = createSupabaseClient();

  const now = new Date();
  const filterMonth = options?.month ?? now.getMonth() + 1;
  const filterYear = options?.year ?? now.getFullYear();

  let studentQuery = supabase
    .from('students')
    .select('id, name, nis, class')
    .eq('school_id', schoolId)
    .eq('status', 'active');
  if (options?.classFilter) {
    studentQuery = studentQuery.eq('class', options.classFilter);
  }
  const { data: students, error: studentError } = await studentQuery.order('name');
  if (studentError) throw new Error(studentError.message);

  let billQuery = supabase
    .from(TABLE)
    .select(
      `
      *,
      students!inner(name, nis, class),
      category:categories(name)
    `
    )
    .eq('school_id', schoolId)
    .eq('month', filterMonth)
    .eq('year', filterYear);
  if (options?.classFilter) {
    billQuery = billQuery.eq('students.class', options.classFilter);
  }
  if (options?.category) {
    billQuery = billQuery.eq('category_id', options.category);
  }
  const { data: bills, error: billError } = await billQuery;
  if (billError) throw new Error(billError.message);

  const result: SPPPayment[] = [];
  (students ?? []).forEach((student) => {
    const ownBills = (bills ?? []).filter((b) => b.student_id === student.id);
    const openBills = ownBills.filter((b) => b.status !== 'paid');

    if (openBills.length > 0) {
      openBills.forEach((bill) => result.push(mapPayment(bill)));
      return;
    }
    if (ownBills.length > 0) return; // semua tagihannya lunas

    // Siswa belum punya tagihan periode ini — tetap tampil sebagai belum bayar.
    result.push({
      id: `nobill-${student.id}`,
      school_id: schoolId,
      student_id: student.id,
      month: filterMonth,
      year: filterYear,
      category_id: options?.category ?? null,
      category_name: undefined,
      amount: 0,
      paid_amount: 0,
      status: 'unpaid',
      recorded_by: '',
      no_bill: true,
      student_name: student.name,
      student_nis: student.nis,
      student_class: student.class,
    });
  });

  return result;
}

/**
 * Get SPP summary (collection rate, counts).
 * `category` opsional — bila diisi, ringkasan dihitung hanya utk kategori itu.
 */
export async function getSPPSummary(
  schoolId: string,
  month?: number,
  year?: number,
  category?: string
): Promise<SPSSummary> {
  const supabase = createSupabaseClient();

  const now = new Date();
  const filterMonth = month || now.getMonth() + 1;
  const filterYear = year || now.getFullYear();

  // Total active students
  const { count: totalSiswa, error: countError } = await supabase
    .from('students')
    .select('id', { count: 'exact', head: true })
    .eq('school_id', schoolId)
    .eq('status', 'active');

  if (countError) {
    throw new Error(countError.message);
  }

  // Pembayaran periode ini (semua kategori, atau satu kategori bila difilter)
  let paymentQuery = supabase
    .from(TABLE)
    .select('status, paid_amount, amount, student_id')
    .eq('school_id', schoolId)
    .eq('month', filterMonth)
    .eq('year', filterYear);
  if (category) {
    paymentQuery = paymentQuery.eq('category_id', category);
  }
  const { data: payments, error: sppError } = await paymentQuery;

  if (sppError) {
    throw new Error(sppError.message);
  }

  const totalBulanIni = payments?.length ?? 0;
  const terkumpul = payments?.reduce((sum, p) => sum + (p.paid_amount || 0), 0) ?? 0;
  const totalSiswaActive = totalSiswa ?? 0;

  // Konsisten dengan dashboard Overview: outstanding = total siswa aktif −
  // siswa UNIK yang sudah bayar/angsuran (1 siswa boleh punya >1 tagihan/kategori).
  const paidStudents = new Set(
    (payments ?? [])
      .filter((p) => p.status === 'paid' || p.status === 'partial')
      .map((p) => p.student_id)
  );
  const outstanding = Math.max(0, totalSiswaActive - paidStudents.size);
  const collectionRate = totalSiswaActive > 0
    ? Math.round((paidStudents.size / totalSiswaActive) * 100)
    : 0;

  return {
    total_siswa: totalSiswaActive,
    total_bulan_ini: totalBulanIni,
    terkumpul,
    outstanding,
    collection_rate: collectionRate,
  };
}

/**
 * Update an existing SPP payment.
 */
export async function updateSPPPayment(
  id: string,
  updates: Partial<SPPFormInput>
): Promise<SPPPayment> {
  const supabase = createSupabaseClient();

  // Ambil status sebelumnya — transaksi Kas hanya dibuat saat TRANSISI ke lunas,
  // bukan setiap kali record yang sudah lunas diedit.
  const { data: previous, error: prevError } = await supabase
    .from(TABLE)
    .select('status')
    .eq('id', id)
    .single();
  if (prevError) {
    console.error('[SPP Service] updateSPPPayment prev-status error:', prevError);
    throw new Error(prevError.message);
  }
  const wasPaid = previous?.status === 'paid';

  const { data, error } = await supabase
    .from(TABLE)
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[SPP Service] updateSPPPayment error:', error);
    throw new Error(error.message);
  }

  const payment = data as SPPPayment;
  const status = updates.status ?? payment.status;
  const paidAmount = updates.paid_amount ?? payment.paid_amount;

  // Auto-create transaction saat pembayaran BERUBAH menjadi lunas.
  if (status === 'paid' && !wasPaid) {
    const amount = paidAmount > 0 ? paidAmount : payment.amount;
    if (amount > 0) {
      const referenceDate =
        updates.payment_date || payment.payment_date || new Date().toISOString().split('T')[0];
      const description = await paymentDescription(
        supabase,
        payment.school_id,
        payment.category_id,
        payment.month,
        payment.year
      );

      if (!(await hasSPPIncomeTransaction(supabase, payment.school_id, id, description, amount, referenceDate))) {
        const userId = await getCurrentUserId(supabase);
        await createSPPIncomeTransaction(supabase, {
          schoolId: payment.school_id,
          userId,
          sourceId: id,
          month: payment.month,
          year: payment.year,
          amount,
          referenceDate,
          categoryId: payment.category_id,
        });
      }
    }
  }

  return data as SPPPayment;
}

/**
 * Cek apakah pembayaran SPP sudah tercatat sebagai pemasukan di Kas.
 * Kunci utama: source_id (= spp_payments.id). Fallback: baris legacy/manual
 * tanpa source_id yang deskripsi+nominal+tanggalnya sama. Baris yang sudah
 * ter-link ke pembayaran LAIN tidak dihitung (siswa berbeda, bulan sama).
 */
async function hasSPPIncomeTransaction(
  supabase: SupabaseClient,
  schoolId: string,
  paymentId: string,
  description: string,
  amount: number,
  referenceDate: string
): Promise<boolean> {
  const { data: bySource } = await supabase
    .from('transactions')
    .select('id')
    .eq('source_type', 'spp')
    .eq('source_id', paymentId)
    .limit(1);
  if (bySource && bySource.length > 0) return true;

  const { data: sameDesc } = await supabase
    .from('transactions')
    .select('id, source_id')
    .eq('school_id', schoolId)
    .eq('type', 'income')
    .eq('description', description)
    .eq('amount', amount)
    .eq('reference_date', referenceDate);
  return (sameDesc ?? []).some((t) => !t.source_id || t.source_id === paymentId);
}

/**
 * Tandai SEMUA tagihan unpaid/partial di 1 bulan jadi lunas sekaligus.
 * Dipakai setelah "Buat Tagihan Agustus" → 1 klik lunasi, lalu edit manual
 * yang masih nunggak. Sekalian bikin transaksi Kas per siswa.
 */
export async function bulkMarkPaidSPP(
  schoolId: string,
  userId: string,
  params: { month: number; year: number }
): Promise<{ updated: number; total: number }> {
  const supabase = createSupabaseClient();

  // Hanya tagihan kategori SPP — tagihan kategori lain tidak boleh ikut
  // ditandai lunas oleh tombol massal ini.
  const sppCategory = await ensureSPPCategory(supabase, schoolId);
  const categoryNames = await loadCategoryNames(supabase, schoolId);

  const { data: rows, error } = await supabase
    .from(TABLE)
    .select('id, status, amount, paid_amount, month, year, category_id')
    .eq('school_id', schoolId)
    .eq('category_id', sppCategory.id)
    .eq('month', params.month)
    .eq('year', params.year)
    .neq('status', 'paid');
  if (error) throw new Error(error.message);
  const targets = rows ?? [];
  let updated = 0;
  const today = new Date().toISOString().split('T')[0];
  for (const r of targets) {
    const amount = r.amount || 0;
    if (amount <= 0) continue;
    const { error: updError } = await supabase
      .from(TABLE)
      .update({ status: 'paid', paid_amount: amount, payment_date: today } as never)
      .eq('id', r.id);
    if (updError) throw new Error(updError.message);
    const description = buildPaymentDescription(
      categoryNames[r.category_id] ?? sppCategory.name,
      r.month,
      r.year
    );
    if (!(await hasSPPIncomeTransaction(supabase, schoolId, r.id, description, amount, today))) {
      await createSPPIncomeTransaction(supabase, {
        schoolId,
        userId,
        sourceId: r.id,
        month: r.month,
        year: r.year,
        amount,
        referenceDate: today,
        categoryId: r.category_id,
        categoryName: categoryNames[r.category_id] ?? sppCategory.name,
      });
    }
    updated++;
  }
  return { updated, total: targets.length };
}

/**
 * Perbaikan data: buatkan transaksi pemasukan untuk SEMUA pembayaran SPP
 * berstatus lunas yang belum tercatat di Kas (mis. lolos karena bug dedup
 * lama). Aman dijalankan ulang — baris yang sudah tercatat akan dilewati.
 */
export async function backfillMissingSPPTransactions(
  schoolId: string,
  userId: string
): Promise<{ created: number; checked: number }> {
  const supabase = createSupabaseClient();

  const { data: paid, error } = await supabase
    .from(TABLE)
    .select('id, month, year, amount, paid_amount, payment_date, category_id')
    .eq('school_id', schoolId)
    .eq('status', 'paid');
  if (error) throw new Error(error.message);

  const categoryNames = await loadCategoryNames(supabase, schoolId);
  const withMoney = (paid ?? []).filter((p) => (p.paid_amount ?? 0) > 0 || (p.amount ?? 0) > 0);
  let created = 0;

  for (const p of withMoney) {
    const amount = (p.paid_amount ?? 0) > 0 ? p.paid_amount : p.amount;
    const categoryName = categoryNames[p.category_id] ?? 'SPP';
    const description = buildPaymentDescription(categoryName, p.month, p.year);
    const referenceDate = p.payment_date || new Date().toISOString().split('T')[0];

    if (await hasSPPIncomeTransaction(supabase, schoolId, p.id, description, amount, referenceDate)) {
      continue;
    }
    await createSPPIncomeTransaction(supabase, {
      schoolId,
      userId,
      sourceId: p.id,
      month: p.month,
      year: p.year,
      amount,
      referenceDate,
      categoryId: p.category_id,
      categoryName,
    });
    created++;
  }

  return { created, checked: withMoney.length };
}

/**
 * Delete an SPP payment record.
 *
 * Jika pembayaran pernah melunasi SPP (punya transaksi income), hapus record
 * TIDAK menghapus transaksi aslinya (audit trail tetap utuh), melainkan
 * membuat transaksi KOREKSI (reversal) sebesar nominal yang sama agar saldo
 * kas kembali benar tanpa menghilangkan jejak.
 */
export async function deleteSPPPayment(id: string): Promise<void> {
  const supabase = createSupabaseClient();

  // Ambil record dulu untuk cek transaksi terkait
  const { data: payment, error: fetchError } = await supabase
    .from(TABLE)
    .select('school_id, status, paid_amount, amount, month, year')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error('[SPP Service] deleteSPPPayment fetch error:', fetchError);
    throw new Error(fetchError.message);
  }

  const wasPaid = payment.status === 'paid' || payment.status === 'partial';
  const paidAmount = (payment.paid_amount ?? 0) > 0 ? payment.paid_amount : payment.amount;

  if (wasPaid && paidAmount > 0) {
    // Cari transaksi income asli dari record SPP ini
    const { data: linked } = await supabase
      .from('transactions')
      .select('*')
      .eq('source_type', 'spp')
      .eq('source_id', id)
      .maybeSingle();

    const linkedTx = linked as unknown as {
      id: string;
      school_id: string;
      category_id: string;
      amount: number;
      description: string;
    } | null;

    if (linkedTx) {
      const userId = await getCurrentUserId(supabase);
      const { error: revError } = await supabase.from('transactions').insert({
        school_id: linkedTx.school_id,
        type: 'expense',
        category_id: linkedTx.category_id,
        amount: linkedTx.amount,
        description: `Koreksi: ${linkedTx.description}`,
        reference_date: new Date().toISOString().split('T')[0],
        recorded_by: userId,
        source_type: 'reversal',
        source_id: linkedTx.id,
      });
      if (revError) {
        console.error('[SPP Service] deleteSPPPayment reversal error:', revError);
        throw new Error(revError.message);
      }
    }
  }

  const { error } = await supabase.from(TABLE).delete().eq('id', id);

  if (error) {
    console.error('[SPP Service] deleteSPPPayment error:', error);
    throw new Error(error.message);
  }
}

// ── Internal helpers ──

async function getCurrentUserId(supabase: SupabaseClient): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) {
    console.error('[SPP Service] getCurrentUser error:', error);
    throw new Error(error.message);
  }
  if (!user) {
    throw new Error('Not authenticated');
  }
  return user.id;
}

/** Nama kategori per id — satu query, dipakai loop bulk/backfill. */
async function loadCategoryNames(
  supabase: SupabaseClient,
  schoolId: string
): Promise<Record<string, string>> {
  const { data } = await supabase
    .from('categories')
    .select('id, name')
    .eq('school_id', schoolId);

  const map: Record<string, string> = {};
  (data ?? []).forEach((c) => {
    map[c.id] = c.name;
  });
  return map;
}

/** Kategori 'SPP' milik sekolah — dibuat otomatis bila belum ada. */
async function ensureSPPCategory(
  supabase: SupabaseClient,
  schoolId: string
): Promise<{ id: string; name: string }> {
  // Prefer the first matching SPP category; duplicate rows must not break the
  // lookup (a .single() call errors when more than one row matches).
  const { data: cats } = await supabase
    .from('categories')
    .select('id, name')
    .eq('school_id', schoolId)
    .eq('name', 'SPP')
    .limit(1);
  if (cats?.[0]) return cats[0];

  const { data: newCat, error: catError } = await supabase
    .from('categories')
    .insert({ name: 'SPP', type: 'income', school_id: schoolId })
    .select('id, name')
    .maybeSingle();
  if (catError || !newCat?.id) {
    console.error('[SPP Service] create SPP category error:', catError);
    throw new Error(catError?.message || 'Kategori SPP tidak ditemukan');
  }
  return newCat;
}

/**
 * Deskripsi transaksi Kas per pembayaran. Format lama dipertahankan persis
 * ("SPP Bulan 10/2026") supaya dedup & data historis tetap cocok; kategori lain
 * memakai format yang sama dengan namanya ("Seragam Bulan 10/2026").
 */
function buildPaymentDescription(
  categoryName: string,
  month?: number | null,
  year?: number | null
): string {
  if (month && year) return `${categoryName} Bulan ${month}/${year}`;
  if (year) return `${categoryName} ${year}`;
  return categoryName;
}

/** Deskripsi untuk satu tagihan (kategori null = tagihan lama, dianggap SPP). */
async function paymentDescription(
  supabase: SupabaseClient,
  schoolId: string,
  categoryId: string | null | undefined,
  month?: number | null,
  year?: number | null
): Promise<string> {
  if (!categoryId) {
    const spp = await ensureSPPCategory(supabase, schoolId);
    return buildPaymentDescription(spp.name, month, year);
  }
  const { data } = await supabase
    .from('categories')
    .select('name')
    .eq('id', categoryId)
    .maybeSingle();
  return buildPaymentDescription(data?.name || 'SPP', month, year);
}

/**
 * Auto-create the income transaction for a PAID student payment.
 * Resolves the Kas category (explicit categoryId, or the school's 'SPP'
 * category as fallback) then inserts the ledger entry.
 */
async function createSPPIncomeTransaction(
  supabase: SupabaseClient,
  params: {
    schoolId: string;
    userId: string;
    sourceId: string;
    month?: number | null;
    year?: number | null;
    amount: number;
    referenceDate?: string;
    categoryId?: string | null;
    categoryName?: string | null;
  }
): Promise<void> {
  let categoryId = params.categoryId ?? null;
  let categoryName = params.categoryName ?? null;

  if (!categoryId) {
    const sppCategory = await ensureSPPCategory(supabase, params.schoolId);
    categoryId = sppCategory.id;
    categoryName = sppCategory.name;
  } else if (!categoryName) {
    const { data } = await supabase
      .from('categories')
      .select('name')
      .eq('id', categoryId)
      .maybeSingle();
    categoryName = data?.name || 'SPP';
  }

  const resolvedCategoryName: string = categoryName || 'SPP';

  const { error } = await supabase.from('transactions').insert({
    school_id: params.schoolId,
    type: 'income',
    category_id: categoryId,
    amount: params.amount,
    description: buildPaymentDescription(resolvedCategoryName, params.month, params.year),
    reference_date: params.referenceDate || new Date().toISOString().split('T')[0],
    recorded_by: params.userId,
    source_type: 'spp',
    source_id: params.sourceId,
  });

  if (error) {
    console.error('[SPP Service] create transaction error:', error);
    throw new Error(error.message);
  }
}

function mapPayment(item: any): SPPPayment {
  const students = item.students as { name?: string; nis?: string; class?: string } | undefined;
  const category = item.category as { name?: string } | undefined;
  return {
    ...item,
    student_name: students?.name,
    student_nis: students?.nis,
    student_class: students?.class,
    category_name: category?.name,
    students: undefined,
    category: undefined,
  };
}
