import { createSupabaseClient } from '@/shared/services/supabase/client';
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
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('school_id', schoolId)
      .eq('name', 'SPP')
      .single();

    if (cat?.id) {
      await supabase.from('transactions').insert({
        school_id: schoolId,
        type: 'income',
        category_id: cat.id,
        amount: input.paid_amount,
        description: `SPP Bulan ${input.month}/${input.year}`,
        reference_date: input.payment_date || new Date().toISOString().split('T')[0],
        recorded_by: userId,
      });
    }
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
  const outstanding = payments?.filter((p) => p.status !== 'paid').length ?? 0;
  const totalSiswaActive = totalSiswa ?? 0;
  const collectionRate = totalSiswaActive > 0
    ? Math.round(((totalSiswaActive - outstanding) / totalSiswaActive) * 100)
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

  return data as SPPPayment;
}

/**
 * Delete an SPP payment record.
 */
export async function deleteSPPPayment(id: string): Promise<void> {
  const supabase = createSupabaseClient();

  const { error } = await supabase.from(TABLE).delete().eq('id', id);

  if (error) {
    console.error('[SPP Service] deleteSPPPayment error:', error);
    throw new Error(error.message);
  }
}

// ── Internal helpers ──

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
