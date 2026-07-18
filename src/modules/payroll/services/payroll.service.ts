import { createSupabaseClient } from '@/shared/services/supabase/client';
import type { Employee, PayrollRecord, EmployeeFormInput, PayrollFormInput } from '../types/payroll.types';

// ── Employees ──
export async function getEmployees(schoolId: string) {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.from('employees').select('*').eq('school_id', schoolId).order('name');
  if (error) throw error;
  return data as Employee[];
}

export async function createEmployee(schoolId: string, input: EmployeeFormInput) {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.from('employees').insert({ ...input, school_id: schoolId }).select().single();
  if (error) throw error;
  return data as Employee;
}

export async function updateEmployee(id: string, input: Partial<EmployeeFormInput>) {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.from('employees').update({ ...input, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) throw error;
  return data as Employee;
}

export async function deleteEmployee(id: string) {
  const supabase = createSupabaseClient();
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
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.from('payroll_records').insert({ ...input, school_id: schoolId }).select('*, employee:employees(*)').single();
  if (error) throw error;

  // Auto-create transaction if paid
  if (input.paid) {
    const empName = (data as any)?.employee?.name || 'Guru';
    let { data: cat } = await supabase.from('categories').select('id').eq('school_id', schoolId).eq('name', 'Gaji Guru').single();
    if (!cat) {
      const { data: newCat } = await supabase.from('categories').insert({ name: 'Gaji Guru', type: 'expense', school_id: schoolId }).select('id').single();
      cat = newCat;
    }
    await supabase.from('transactions').insert({
      school_id: schoolId,
      type: 'expense',
      category_id: cat!.id,
      amount: input.total || 0,
      description: `Gaji ${empName} - Bulan ${input.month}/${input.year}`,
      reference_date: new Date().toISOString().split('T')[0],
      recorded_by: null,
    });
  }

  return data as PayrollRecord;
}

export async function updatePayroll(id: string, input: Partial<PayrollFormInput>) {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.from('payroll_records').update(input).eq('id', id).select('*, employee:employees(*)').single();
  if (error) throw error;

  // Auto-create transaction when status changes to paid
  if (input.paid === true && data) {
    const empName = (data as any)?.employee?.name || 'Guru';
    // Check if transaction already exists for this payroll
    const { data: existingTx } = await supabase
      .from('transactions')
      .select('id')
      .eq('school_id', data.school_id)
      .eq('description', `Gaji ${empName} - Bulan ${data.month}/${data.year}`)
      .limit(1);
    if (!existingTx || existingTx.length === 0) {
      let { data: cat } = await supabase.from('categories').select('id').eq('school_id', data.school_id).eq('name', 'Gaji Guru').single();
      if (!cat) {
        const { data: newCat } = await supabase.from('categories').insert({ name: 'Gaji Guru', type: 'expense', school_id: data.school_id }).select('id').single();
        cat = newCat;
      }
      await supabase.from('transactions').insert({
        school_id: data.school_id,
        type: 'expense',
        category_id: cat!.id,
        amount: data.total,
        description: `Gaji ${empName} - Bulan ${data.month}/${data.year}`,
        reference_date: new Date().toISOString().split('T')[0],
        recorded_by: null,
      });
    }
  }

  return data as PayrollRecord;
}

export async function deletePayroll(id: string) {
  const supabase = createSupabaseClient();
  const { error } = await supabase.from('payroll_records').delete().eq('id', id);
  if (error) throw error;
}

// ── Batch generate payroll for all active employees ──
export async function generatePayroll(schoolId: string, month: number, year: number) {
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
