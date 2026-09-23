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
      students!inner(name, nis, class)
    `
    )
    .eq('school_id', schoolId)
    .order('year', { ascending: false })
    .order('month', { ascending: false });

  if (filter?.month) {
    query = query.eq('month', filter.month);
  }
  if (filter?.year) {
    query = query.eq('year', filter.year);
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
      month: input.month,
      year: input.year,
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

  // Auto-create transaction when SPP is paid
  if (input.status === 'paid' && input.paid_amount && input.paid_amount > 0) {
    await createSPPIncomeTransaction(supabase, {
      schoolId,
      userId,
      sourceId: data.id,
      month: input.month,
      year: input.year,
      amount: input.paid_amount,
      referenceDate: input.payment_date,
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
    .eq('month', params.month)
    .eq('year', params.year);
  if (existingError) throw new Error(existingError.message);

  const billedIds = new Set(existing?.map((e) => e.student_id));
  const newStudents = (students ?? []).filter((s) => !billedIds.has(s.id));

  if (newStudents.length > 0) {
    const rows = newStudents.map((s) => ({
      school_id: schoolId,
      student_id: s.id,
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
 * Ambil daftar siswa yang BELUM bayar untuk suatu bulan — konsisten dengan
 * Overview (total siswa aktif − siswa yang sudah bayar/angsuran). Siswa aktif
 * yang belum punya tagihan sama sekali ikut tampil (no_bill) supaya tidak
 * 'hilang' dari pantauan tunggakan.
 */
export async function getUnpaidPayments(
  schoolId: string,
  options?: { month?: number; year?: number; classFilter?: string }
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
      students!inner(name, nis, class)
    `
    )
    .eq('school_id', schoolId)
    .eq('month', filterMonth)
    .eq('year', filterYear);
  if (options?.classFilter) {
    billQuery = billQuery.eq('students.class', options.classFilter);
  }
  const { data: bills, error: billError } = await billQuery;
  if (billError) throw new Error(billError.message);

  const paidIds = new Set(
    (bills ?? [])
      .filter((b) => b.status === 'paid' || b.status === 'partial')
      .map((b) => b.student_id)
  );

  const result: SPPPayment[] = [];
  (students ?? []).forEach((student) => {
    if (paidIds.has(student.id)) return;
    const bill = (bills ?? []).find((b) => b.student_id === student.id);
    if (bill) {
      result.push(mapPayment(bill));
    } else {
      // Siswa belum punya tagihan bulan ini — tetap tampil sebagai belum bayar.
      result.push({
        id: `nobill-${student.id}`,
        school_id: schoolId,
        student_id: student.id,
        month: filterMonth,
        year: filterYear,
        amount: 0,
        paid_amount: 0,
        status: 'unpaid',
        recorded_by: '',
        no_bill: true,
        student_name: student.name,
        student_nis: student.nis,
        student_class: student.class,
      });
    }
  });

  return result;
}

/**
 * Get SPP summary (collection rate, counts).
 */
export async function getSPPSummary(
  schoolId: string,
  month?: number,
  year?: number
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

  // SPP payments for this month/year
  const { data: payments, error: sppError } = await supabase
    .from(TABLE)
    .select('status, paid_amount, amount')
    .eq('school_id', schoolId)
    .eq('month', filterMonth)
    .eq('year', filterYear);

  if (sppError) {
    throw new Error(sppError.message);
  }

  const totalBulanIni = payments?.length ?? 0;
  const terkumpul = payments?.reduce((sum, p) => sum + (p.paid_amount || 0), 0) ?? 0;
  const totalSiswaActive = totalSiswa ?? 0;

  // Konsisten dengan dashboard Overview: outstanding = total siswa aktif −
  // siswa yang sudah bayar/angsuran bulan ini (tagihan unik per siswa+bulan).
  const paidCount = payments?.filter((p) => p.status === 'paid' || p.status === 'partial').length ?? 0;
  const outstanding = Math.max(0, totalSiswaActive - paidCount);
  const collectionRate = totalSiswaActive > 0
    ? Math.round((paidCount / totalSiswaActive) * 100)
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
      const description = `SPP Bulan ${payment.month}/${payment.year}`;

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
  const { data: rows, error } = await supabase
    .from(TABLE)
    .select('id, status, amount, paid_amount')
    .eq('school_id', schoolId)
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
    const description = `SPP Bulan ${params.month}/${params.year}`;
    if (!(await hasSPPIncomeTransaction(supabase, schoolId, r.id, description, amount, today))) {
      await createSPPIncomeTransaction(supabase, {
        schoolId,
        userId,
        sourceId: r.id,
        month: params.month,
        year: params.year,
        amount,
        referenceDate: today,
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
    .select('id, month, year, amount, paid_amount, payment_date')
    .eq('school_id', schoolId)
    .eq('status', 'paid');
  if (error) throw new Error(error.message);

  const withMoney = (paid ?? []).filter((p) => (p.paid_amount ?? 0) > 0 || (p.amount ?? 0) > 0);
  let created = 0;

  for (const p of withMoney) {
    const amount = (p.paid_amount ?? 0) > 0 ? p.paid_amount : p.amount;
    const description = `SPP Bulan ${p.month}/${p.year}`;
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

/**
 * Auto-create the income transaction for a paid SPP record.
 * Finds the school's 'SPP' category, then inserts the ledger entry.
 */
async function createSPPIncomeTransaction(
  supabase: SupabaseClient,
  params: {
    schoolId: string;
    userId: string;
    sourceId: string;
    month: number;
    year: number;
    amount: number;
    referenceDate?: string;
  }
): Promise<void> {
  // Prefer the first matching SPP category; duplicate rows must not break the
  // lookup (a .single() call errors when more than one row matches).
  let { data: cats } = await supabase
    .from('categories')
    .select('id')
    .eq('school_id', params.schoolId)
    .eq('name', 'SPP')
    .limit(1);
  let cat = cats?.[0];

  // Auto-create the SPP category when missing so income is never silently skipped.
  if (!cat) {
    const { data: newCat, error: catError } = await supabase
      .from('categories')
      .insert({ name: 'SPP', type: 'income', school_id: params.schoolId })
      .select('id')
      .maybeSingle();
    if (catError || !newCat?.id) {
      console.error('[SPP Service] create SPP category error:', catError);
      throw new Error(catError?.message || 'Kategori SPP tidak ditemukan');
    }
    cat = newCat;
  }

  const { error } = await supabase.from('transactions').insert({
    school_id: params.schoolId,
    type: 'income',
    category_id: cat.id,
    amount: params.amount,
    description: `SPP Bulan ${params.month}/${params.year}`,
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
  return {
    ...item,
    student_name: students?.name,
    student_nis: students?.nis,
    student_class: students?.class,
    students: undefined,
  };
}
