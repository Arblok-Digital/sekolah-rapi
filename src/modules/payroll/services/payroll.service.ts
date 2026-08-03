import { createSupabaseClient } from '@/shared/services/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Employee, PayrollRecord, EmployeeFormInput, PayrollFormInput } from '../types/payroll.types';
import { assertSchoolFeature } from '@/shared/services/plan-guard';

async function getCurrentUserId(supabase: SupabaseClient): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) {
    console.error('[Payroll Service] getCurrentUser error:', error);
    throw new Error(error.message);
  }
  if (!user) {
    throw new Error('Not authenticated');
  }
  return user.id;
}

// ── Employees ──
export async function getEmployees(schoolId: string) {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.from('employees').select('*').eq('school_id', schoolId).order('name');
  if (error) throw error;
  return data as Employee[];
}

export async function createEmployee(schoolId: string, input: EmployeeFormInput) {
  await assertSchoolFeature(schoolId, 'payroll');
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.from('employees').insert({ ...input, school_id: schoolId }).select().single();
  if (error) throw error;
  return data as Employee;
}

export async function updateEmployee(id: string, input: Partial<EmployeeFormInput>) {
  const supabase = createSupabaseClient();
  const { data: current } = await supabase.from('employees').select('school_id').eq('id', id).single();
  if (current?.school_id) await assertSchoolFeature(current.school_id, 'payroll');
  const { data, error } = await supabase.from('employees').update({ ...input, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) throw error;
  return data as Employee;
}

export async function deleteEmployee(id: string) {
  const supabase = createSupabaseClient();
  const { data: current } = await supabase.from('employees').select('school_id').eq('id', id).single();
  if (current?.school_id) await assertSchoolFeature(current.school_id, 'payroll');
  const { error } = await supabase.from('employees').delete().eq('id', id);
  if (error) throw error;
}

// ── Payroll ──
export async function getPayroll(schoolId: string, month?: number, year?: number) {
  const supabase = createSupabaseClient();
  let q = supabase.from('payroll_records').select('*, employee:employees(*)').eq('school_id', schoolId);
  if (month) q = q.eq('month', month);
  if (year) q = q.eq('year', year);
  q = q.order('year', { ascending: false }).order('month', { ascending: false });
  const { data, error } = await q;
  if (error) throw error;
  return data as PayrollRecord[];
}

export async function createPayroll(schoolId: string, input: PayrollFormInput) {
  await assertSchoolFeature(schoolId, 'payroll');
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.from('payroll_records').insert({ ...input, school_id: schoolId }).select('*, employee:employees(*)').single();
  if (error) throw error;

  // Auto-create transaction if paid
  if (input.paid) {
    const userId = await getCurrentUserId(supabase);
    const empName = (data as any)?.employee?.name || 'Guru';
    let { data: cats } = await supabase.from('categories').select('id').eq('school_id', schoolId).eq('name', 'Gaji Guru').limit(1);
    let cat: { id: string } | undefined = cats?.[0];
    if (!cat) {
      const { data: newCat } = await supabase.from('categories').insert({ name: 'Gaji Guru', type: 'expense', school_id: schoolId }).select('id').single();
      cat = newCat ?? undefined;
    }
    const { error: txError } = await supabase.from('transactions').insert({
      school_id: schoolId,
      type: 'expense',
      category_id: cat!.id,
      amount: input.total || 0,
      description: `Gaji ${empName} - Bulan ${input.month}/${input.year}`,
      reference_date: new Date().toISOString().split('T')[0],
      recorded_by: userId,
      source_type: 'payroll',
      source_id: data.id,
    });
    if (txError) {
      console.error('[Payroll Service] createPayroll transaction error:', txError);
      throw new Error(txError.message);
    }
  }

  return data as PayrollRecord;
}

export async function updatePayroll(id: string, input: Partial<PayrollFormInput>) {
  const supabase = createSupabaseClient();
  const { data: current } = await supabase.from('payroll_records').select('school_id').eq('id', id).single();
  if (current?.school_id) await assertSchoolFeature(current.school_id, 'payroll');
  const { data, error } = await supabase.from('payroll_records').update(input).eq('id', id).select('*, employee:employees(*)').single();
  if (error) throw error;

  // Auto-create transaction when status changes to paid
  if (input.paid === true && data) {
    const userId = await getCurrentUserId(supabase);
    const empName = (data as any)?.employee?.name || 'Guru';
    // Check if transaction already exists for this payroll
    const { data: existingTx } = await supabase
      .from('transactions')
      .select('id')
      .eq('source_type', 'payroll')
      .eq('source_id', id)
      .limit(1);
    if (!existingTx || existingTx.length === 0) {
      let { data: cats } = await supabase.from('categories').select('id').eq('school_id', data.school_id).eq('name', 'Gaji Guru').limit(1);
      let cat: { id: string } | undefined = cats?.[0];
      if (!cat) {
        const { data: newCat } = await supabase.from('categories').insert({ name: 'Gaji Guru', type: 'expense', school_id: data.school_id }).select('id').single();
        cat = newCat ?? undefined;
      }
      const { error: txError } = await supabase.from('transactions').insert({
        school_id: data.school_id,
        type: 'expense',
        category_id: cat!.id,
        amount: data.total,
        description: `Gaji ${empName} - Bulan ${data.month}/${data.year}`,
        reference_date: new Date().toISOString().split('T')[0],
        recorded_by: userId,
        source_type: 'payroll',
        source_id: id,
      });
      if (txError) {
        console.error('[Payroll Service] updatePayroll transaction error:', txError);
        throw new Error(txError.message);
      }
    }
  }

  return data as PayrollRecord;
}

export async function deletePayroll(id: string) {
  const supabase = createSupabaseClient();
  const { data: current } = await supabase.from('payroll_records').select('school_id').eq('id', id).single();
  if (current?.school_id) await assertSchoolFeature(current.school_id, 'payroll');

  // Kalau slip sudah dibayar (punya transaksi expense), buat transaksi KOREKSI
  // (income) agar saldo kas kembali benar tanpa menghapus jejak aslinya.
  const { data: linked } = await supabase
    .from('transactions')
    .select('id, school_id, category_id, amount, description')
    .eq('source_type', 'payroll')
    .eq('source_id', id)
    .limit(1);

  const linkedTx = linked?.[0] as unknown as {
    id: string;
    school_id: string;
    category_id: string;
    amount: number;
    description: string;
  } | undefined;

  if (linkedTx) {
    const userId = await getCurrentUserId(supabase);
    const { error: revError } = await supabase.from('transactions').insert({
      school_id: linkedTx.school_id,
      type: 'income',
      category_id: linkedTx.category_id,
      amount: linkedTx.amount,
      description: `Koreksi: ${linkedTx.description}`,
      reference_date: new Date().toISOString().split('T')[0],
      recorded_by: userId,
      source_type: 'reversal',
      source_id: linkedTx.id,
    });
    if (revError) {
      console.error('[Payroll Service] deletePayroll reversal error:', revError);
      throw new Error(revError.message);
    }
  }

  const { error } = await supabase.from('payroll_records').delete().eq('id', id);
  if (error) throw error;
}

// ── Batch generate payroll for all active employees ──
export async function generatePayroll(schoolId: string, month: number, year: number) {
  await assertSchoolFeature(schoolId, 'payroll');
  const supabase = createSupabaseClient();
  const employees = await getEmployees(schoolId);
  const active = employees.filter(e => e.status === 'active');

  // Check which already exist
  const { data: existing } = await supabase.from('payroll_records').select('employee_id').eq('school_id', schoolId).eq('month', month).eq('year', year);
  const existingIds = new Set((existing || []).map((r: any) => r.employee_id));
  const toCreate = active.filter(e => !existingIds.has(e.id));

  if (toCreate.length === 0) return { created: 0 };

  const records = toCreate.map(e => ({
    school_id: schoolId,
    employee_id: e.id,
    month,
    year,
    base_salary: e.base_salary,
    bonus: 0,
    deduction: 0,
    total: e.base_salary,
    paid: false,
  }));

  const { error } = await supabase.from('payroll_records').insert(records);
  if (error) throw error;
  return { created: records.length };
}
