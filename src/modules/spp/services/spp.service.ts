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

  // Catat ke Kas untuk SEMUA uang yang diterima — lunas MAUPUN angsuran.
  // Baris baru belum punya catatan sebelumnya, jadi delta = paid_amount.
  if (input.paid_amount && input.paid_amount > 0) {
    await syncSPPIncomeToKas(supabase, {
      schoolId,
      userId,
      paymentId: data.id,
      month: input.month,
      year: input.year,
      categoryId: input.category_id,
      targetPaid: input.paid_amount,
      referenceDate: input.payment_date || new Date().toISOString().split('T')[0],
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

  // Sinkron Kas berbasis SELISIH: total dibayar − yang sudah pernah tercatat.
  // Angsuran berikutnya / pelunasan hanya menambah kurangannya — tidak pernah
  // double, dan uang yang diterima tidak bisa disembunyikan dari Kas owner.
  const status = payment.status;
  const targetPaid =
    (payment.paid_amount ?? 0) > 0 ? payment.paid_amount : status === 'paid' ? payment.amount : 0;
  const referenceDate = payment.payment_date || new Date().toISOString().split('T')[0];
  await syncSPPIncomeToKas(supabase, {
    schoolId: payment.school_id,
    paymentId: id,
    month: payment.month,
    year: payment.year,
    categoryId: payment.category_id,
    targetPaid,
    referenceDate,
  });

  return data as SPPPayment;
}

/**
 * Total pemasukan yang SUDAH tercatat di Kas untuk satu pembayaran.
 * Utama: jumlah semua transaksi income dengan source_id = pembayaran ini
 * (bisa lebih dari 1 baris — fitur angsuran nyicil). Fallback legacy: baris
 * manual tanpa source_id dengan deskripsi + nominal + tanggal sama (era
 * sebelum fitur sinkron-kas).
 */
async function getRecordedSPPIncomeAmount(
  supabase: SupabaseClient,
  schoolId: string,
  paymentId: string,
  description: string,
  referenceDate: string,
  targetPaid: number
): Promise<number> {
  const { data: linked } = await supabase
    .from('transactions')
    .select('id, amount, source_id')
    .eq('school_id', schoolId)
    .eq('type', 'income')
    .eq('source_type', 'spp')
    .eq('source_id', paymentId);
  const linkedSum = (linked ?? []).reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  if (linkedSum > 0) return linkedSum;

  const { data: legacy } = await supabase
    .from('transactions')
    .select('id, amount, source_id')
    .eq('school_id', schoolId)
    .eq('type', 'income')
    .eq('description', description)
    .eq('amount', targetPaid)
    .eq('reference_date', referenceDate)
    .limit(1);
  const match = (legacy ?? []).find((t) => !t.source_id || t.source_id === paymentId);
  return match ? Number(match.amount) || 0 : 0;
}

/**
 * Sinkronkan Kas dengan keadaan TERKINI baris pembayaran.
 *
 * - Baris baru / belum ada catatan → buat pemasukan sejumlah yang diterima.
 * - Cicilan berikutnya / pelunasan → tambah SELISIHNYA saja (anti dobel).
 * - EDIT yang mengubah kategori/periode/nominal/tanggal pada baris yang
 *   sudah tercatat → KOREKSI (reversal) semua transaksi lamanya lalu bikin
 *   ulang sesuai kondisi terkini — Kas tidak pernah menyimpang dari data
 *   siswa, dan jejak audit lama tetap utuh.
 *
 * Dipakai create, update, lunasi massal, dan backfill.
 * @returns nominal pemasukan yang dibuat (0 = tidak ada perubahan/koreksi)
 */
async function syncSPPIncomeToKas(
  supabase: SupabaseClient,
  params: {
    schoolId: string;
    userId?: string;
    paymentId: string;
    month?: number | null;
    year?: number | null;
    categoryId?: string | null;
    categoryName?: string | null;
    targetPaid: number;
    referenceDate: string;
  }
): Promise<number> {
  let categoryId = params.categoryId ?? null;
  let categoryName = params.categoryName ?? null;
  if (!categoryId) {
    const spp = await ensureSPPCategory(supabase, params.schoolId);
    categoryId = spp.id;
    categoryName = spp.name;
  } else if (!categoryName) {
    const { data } = await supabase
      .from('categories')
      .select('name')
      .eq('id', categoryId)
      .maybeSingle();
    categoryName = data?.name || 'SPP';
  }

  const description = buildPaymentDescription(categoryName || 'SPP', params.month, params.year);
  const today = new Date().toISOString().split('T')[0];

  // Transaksi yang pernah dibuat dari baris ini (bisa >1 untuk cicilan).
  const { data: linkedRows } = await supabase
    .from('transactions')
    .select('id, amount, description, reference_date, category_id')
    .eq('school_id', params.schoolId)
    .eq('type', 'income')
    .eq('source_type', 'spp')
    .eq('source_id', params.paymentId);
  const linked = (linkedRows ?? []) as Array<{
    id: string;
    amount: number;
    description: string;
    reference_date: string;
    category_id: string;
  }>;

  if (linked.length > 0) {
    const linkedSum = linked.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const metadataCoherent = linked.every(
      (t) => t.description === description && t.reference_date === params.referenceDate
    );

    // Masih konsisten (deskripsi & tanggal sama) → tinggal cocokkan nominal.
    if (metadataCoherent && linkedSum === params.targetPaid) return 0;

    // Cicilan BERTAMBAH → tambah selisihnya saja, tanpa koreksi (riwayat bersih).
    if (metadataCoherent && linkedSum < params.targetPaid) {
      const delta = params.targetPaid - linkedSum;
      const userId = params.userId ?? (await getCurrentUserId(supabase));
      await createSPPIncomeTransaction(supabase, {
        schoolId: params.schoolId,
        userId,
        sourceId: params.paymentId,
        month: params.month,
        year: params.year,
        amount: delta,
        referenceDate: params.referenceDate,
        categoryId,
        categoryName,
      });
      return delta;
    }

    // Tidak koheren (kategori/periode/tanggal berubah), NAIK-NURUN, atau jadi
    // belum-bayar → bongkar semua transaksi lamanya dengan KOREKSI, lalu
    // bikin ulang sesuai kondisi terkini.
    const userId = params.userId ?? (await getCurrentUserId(supabase));
    for (const tx of linked) {
      const { error: revErr } = await supabase.from('transactions').insert({
        school_id: params.schoolId,
        type: 'expense',
        category_id: tx.category_id,
        amount: tx.amount,
        description: `Koreksi: ${tx.description}`,
        reference_date: today,
        recorded_by: userId,
        source_type: 'reversal',
        source_id: tx.id,
      });
      if (revErr) {
        console.error('[SPP Service] sync rebuild reversal error:', revErr);
        throw new Error(revErr.message);
      }
    }
    if (params.targetPaid > 0) {
      await createSPPIncomeTransaction(supabase, {
        schoolId: params.schoolId,
        userId,
        sourceId: params.paymentId,
        month: params.month,
        year: params.year,
        amount: params.targetPaid,
        referenceDate: params.referenceDate,
        categoryId,
        categoryName,
      });
      return params.targetPaid;
    }
    return 0; // baris diubah jadi belum-bayar: tinggal koreksi, tanpa pemasukan baru
  }

  // Belum ada catatan — termasuk fallback baris legacy tanpa source_id.
  if (!(params.targetPaid > 0)) return 0;
  const recorded = await getRecordedSPPIncomeAmount(
    supabase,
    params.schoolId,
    params.paymentId,
    description,
    params.referenceDate,
    params.targetPaid
  );
  const delta = params.targetPaid - recorded;
  if (delta <= 0) return 0;

  const userId = params.userId ?? (await getCurrentUserId(supabase));
  await createSPPIncomeTransaction(supabase, {
    schoolId: params.schoolId,
    userId,
    sourceId: params.paymentId,
    month: params.month,
    year: params.year,
    amount: delta,
    referenceDate: params.referenceDate,
    categoryId,
    categoryName,
  });
  return delta;
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
    // Delta: unpaid = full amount; partial/anngsuran = sisa yang belum tercatat.
    await syncSPPIncomeToKas(supabase, {
      schoolId,
      userId,
      paymentId: r.id,
      month: r.month,
      year: r.year,
      categoryId: r.category_id,
      categoryName: categoryNames[r.category_id] ?? sppCategory.name,
      targetPaid: amount,
      referenceDate: today,
    });
    updated++;
  }
  return { updated, total: targets.length };
}

/**
 * Perbaikan data: catatkan ke Kas SEMUA pembayaran yang uangnya sudah
 * diterima tapi belum tercatat — lunas maupun angsuran (termasuk sisa
 * pelunasan dari cicilan). Aman dijalankan ulang — delta 0 berarti sudah
 * cocok.
 */
export async function backfillMissingSPPTransactions(
  schoolId: string,
  userId: string
): Promise<{ created: number; checked: number }> {
  const supabase = createSupabaseClient();

  const { data: rows, error } = await supabase
    .from(TABLE)
    .select('id, month, year, amount, paid_amount, status, payment_date, category_id')
    .eq('school_id', schoolId)
    .in('status', ['paid', 'partial']);
  if (error) throw new Error(error.message);

  const categoryNames = await loadCategoryNames(supabase, schoolId);
  let created = 0;
  let checked = 0;

  for (const p of rows ?? []) {
    const targetPaid =
      (p.paid_amount ?? 0) > 0 ? p.paid_amount : p.status === 'paid' ? p.amount : 0;
    if (targetPaid <= 0) continue;
    checked++;

    const categoryName = categoryNames[p.category_id] ?? 'SPP';
    const referenceDate = p.payment_date || new Date().toISOString().split('T')[0];
    const made = await syncSPPIncomeToKas(supabase, {
      schoolId,
      userId,
      paymentId: p.id,
      month: p.month,
      year: p.year,
      categoryId: p.category_id,
      categoryName,
      targetPaid,
      referenceDate,
    });
    if (made > 0) created++;
  }

  return { created, checked };
}

/**
 * Delete an SPP payment record.
 *
 * Jika pembayaran pernah menghasilkan transaksi pemasukan (lunas atau
 * angsuran — bisa lebih dari satu baris untuk cicilan bertahap), hapus record
 * TIDAK menghapus transaksi aslinya (audit trail tetap utuh), melainkan
 * membuat transaksi KOREKSI (reversal) per baris pemasukan agar saldo
 * kas kembali benar tanpa menghilangkan jejak.
 */
export async function deleteSPPPayment(id: string): Promise<void> {
  const supabase = createSupabaseClient();

  // Pastikan record ada
  const { error: fetchError } = await supabase
    .from(TABLE)
    .select('id')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error('[SPP Service] deleteSPPPayment fetch error:', fetchError);
    throw new Error(fetchError.message);
  }

  // Koreksi untuk SEMUA pemasukan yang pernah dibuat dari record ini —
  // cicilan bertahap bisa menghasilkan lebih dari satu baris pemasukan.
  const { data: linked } = await supabase
    .from('transactions')
    .select('*')
    .eq('source_type', 'spp')
    .eq('source_id', id);

  const incomeRows = ((linked ?? []) as unknown as Array<{
    id: string;
    school_id: string;
    category_id: string;
    amount: number;
    description: string;
    type: string;
  }>).filter((t) => t.type === 'income');

  if (incomeRows.length > 0) {
    const userId = await getCurrentUserId(supabase);
    for (const tx of incomeRows) {
      const { error: revError } = await supabase.from('transactions').insert({
        school_id: tx.school_id,
        type: 'expense',
        category_id: tx.category_id,
        amount: tx.amount,
        description: `Koreksi: ${tx.description}`,
        reference_date: new Date().toISOString().split('T')[0],
        recorded_by: userId,
        source_type: 'reversal',
        source_id: tx.id,
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

/**
 * Insert satu baris pemasukan Kas dari pembayaran siswa (nominal = delta
 * yang disinkronkan). Resolves the Kas category (explicit categoryId, or the
 * school's 'SPP' category as fallback) then inserts the ledger entry.
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
