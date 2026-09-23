import { createSupabaseClient } from '@/shared/services/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Employee, PayrollRecord, EmployeeFormInput, PayrollFormInput, PayrollItem, PayrollItemInput } from '../types/payroll.types';
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
  const records = (data || []) as PayrollRecord[];

  // Lampirkan rincian items (tahan banting bila migrasi payroll_items belum jalan)
  try {
    const ids = records.map((r) => r.id);
    if (ids.length > 0) {
      const { data: items, error: itemsError } = await supabase
        .from('payroll_items')
        .select('*')
        .in('payroll_record_id', ids)
        .order('created_at')
        .order('id');
      if (itemsError) throw itemsError;
      const byRecord = new Map<string, PayrollItem[]>();
      ((items || []) as PayrollItem[]).forEach((it) => {
        const list = byRecord.get(it.payroll_record_id) || [];
        list.push(it);
        byRecord.set(it.payroll_record_id, list);
      });
      records.forEach((r) => {
        r.items = byRecord.get(r.id) || [];
      });
    }
  } catch (err) {
    console.warn('[Payroll Service] payroll_items belum tersedia, pakai kolom bonus/deduction:', err);
  }

  return records;
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

  const userId = await getCurrentUserId(supabase);
  const empName = (data as any)?.employee?.name || 'Guru';

  // Bayar: buat expense bila belum ada yang aktif (belum di-reverse).
  // Bayar-ulang setelah Batal tetap bikin expense baru karena yg lama sudah di-reverse.
  if (input.paid === true && data) {
    const active = await getUnreversedPayrollTx(supabase, id);
    if (active.length === 0) {
      await createPayrollExpenseTx(supabase, data.school_id, userId, {
        id,
        month: data.month,
        year: data.year,
        total: data.total,
        empName,
      });
    }
  }

  // Batal bayar: reverse semua expense aktif agar Kas/Overview/Riwayat kembali benar.
  if (input.paid === false) {
    const active = await getUnreversedPayrollTx(supabase, id);
    for (const tx of active) {
      await createReversalTx(supabase, userId, tx);
    }
  }

  return data as PayrollRecord;
}

// ── Helper sinkron Kas ──
interface LinkedPayrollTx {
  id: string;
  school_id: string;
  category_id: string;
  amount: number;
  description: string;
}

/** Expense payroll yang belum di-reverse = beban aktif di Kas. */
async function getUnreversedPayrollTx(supabase: SupabaseClient, recordId: string): Promise<LinkedPayrollTx[]> {
  const { data: expenses } = await supabase
    .from('transactions')
    .select('id, school_id, category_id, amount, description')
    .eq('source_type', 'payroll')
    .eq('source_id', recordId);
  if (!expenses || expenses.length === 0) return [];
  const { data: reversals } = await supabase
    .from('transactions')
    .select('source_id')
    .eq('source_type', 'reversal')
    .in('source_id', expenses.map((e) => e.id));
  const reversed = new Set(((reversals || []) as { source_id: string }[]).map((r) => r.source_id));
  return (expenses as LinkedPayrollTx[]).filter((e) => !reversed.has(e.id));
}

async function getGajiCategory(supabase: SupabaseClient, schoolId: string): Promise<string> {
  const { data: cats } = await supabase.from('categories').select('id').eq('school_id', schoolId).eq('name', 'Gaji Guru').limit(1);
  if (cats?.[0]) return cats[0].id as string;
  const { data: newCat, error } = await supabase.from('categories').insert({ name: 'Gaji Guru', type: 'expense', school_id: schoolId }).select('id').single();
  if (error || !newCat) throw new Error(error?.message || 'Gagal membuat kategori Gaji Guru');
  return (newCat as { id: string }).id;
}

async function createPayrollExpenseTx(
  supabase: SupabaseClient,
  schoolId: string,
  userId: string,
  record: { id: string; month: number; year: number; total: number; empName: string }
): Promise<void> {
  const categoryId = await getGajiCategory(supabase, schoolId);
  const { error: txError } = await supabase.from('transactions').insert({
    school_id: schoolId,
    type: 'expense',
    category_id: categoryId,
    amount: record.total,
    description: `Gaji ${record.empName} - Bulan ${record.month}/${record.year}`,
    reference_date: new Date().toISOString().split('T')[0],
    recorded_by: userId,
    source_type: 'payroll',
    source_id: record.id,
  });
  if (txError) {
    console.error('[Payroll Service] createPayroll transaction error:', txError);
    throw new Error(txError.message);
  }
}

async function createReversalTx(supabase: SupabaseClient, userId: string, tx: LinkedPayrollTx): Promise<void> {
  const { error: revError } = await supabase.from('transactions').insert({
    school_id: tx.school_id,
    type: 'income',
    category_id: tx.category_id,
    amount: tx.amount,
    description: `Koreksi: ${tx.description}`,
    reference_date: new Date().toISOString().split('T')[0],
    recorded_by: userId,
    source_type: 'reversal',
    source_id: tx.id,
  });
  if (revError) {
    console.error('[Payroll Service] reversal error:', revError);
    throw new Error(revError.message);
  }
}

export async function deletePayroll(id: string) {
  const supabase = createSupabaseClient();
  const { data: current } = await supabase.from('payroll_records').select('school_id').eq('id', id).single();
  if (current?.school_id) await assertSchoolFeature(current.school_id, 'payroll');

  // Kalau slip sudah dibayar (punya expense aktif), buat transaksi KOREKSI
  // (income) untuk tiap expense yang belum di-reverse agar saldo kas kembali
  // benar tanpa menghapus jejak aslinya.
  const unreversed = await getUnreversedPayrollTx(supabase, id);

  if (unreversed.length > 0) {
    const userId = await getCurrentUserId(supabase);
    for (const tx of unreversed) {
      await createReversalTx(supabase, userId, tx);
    }
  }

  const { error } = await supabase.from('payroll_records').delete().eq('id', id);
  if (error) throw error;
}

// ── Rincian gaji (payroll_items) ──
function calcPayrollTotal(baseSalary: number, items: PayrollItemInput[]): { allowance: number; deduction: number; total: number } {
  const allowance = items.filter((i) => i.kind === 'allowance').reduce((s, i) => s + (i.amount || 0), 0);
  const deduction = items.filter((i) => i.kind === 'deduction').reduce((s, i) => s + (i.amount || 0), 0);
  return { allowance, deduction, total: baseSalary + allowance - deduction };
}

/**
 * Simpan ulang rincian slip: hapus items lama, insert baru, hitung ulang
 * total, sinkronkan kolom bonus/deduction, dan sesuaikan transaksi Kas
 * yang ter-link bila slip sudah dibayar (prinsip: semua sinkron).
 */
export async function savePayrollItems(
  schoolId: string,
  recordId: string,
  baseSalary: number,
  items: PayrollItemInput[]
): Promise<PayrollRecord> {
  const clean = items
    .filter((i) => i.category.trim() !== '' && (i.amount || 0) > 0)
    .map((i) => ({
      school_id: schoolId,
      payroll_record_id: recordId,
      kind: i.kind,
      category: i.category.trim(),
      description: i.description?.trim() || null,
      amount: i.amount,
    }));

  await assertSchoolFeature(schoolId, 'payroll');
  const supabase = createSupabaseClient();

  const { error: delError } = await supabase.from('payroll_items').delete().eq('payroll_record_id', recordId);
  if (delError) throw delError;

  if (clean.length > 0) {
    const { error: insError } = await supabase.from('payroll_items').insert(clean);
    if (insError) throw insError;
  }

  const { allowance, deduction, total } = calcPayrollTotal(baseSalary, items);
  const { data, error } = await supabase
    .from('payroll_records')
    .update({ bonus: allowance, deduction, total })
    .eq('id', recordId)
    .select('*, employee:employees(*)')
    .single();
  if (error) throw error;

  // Sesuaikan transaksi Kas ter-link agar saldo tetap sinkron
  const { data: linked } = await supabase
    .from('transactions')
    .select('id')
    .eq('source_type', 'payroll')
    .eq('source_id', recordId)
    .limit(1);
  if (linked && linked.length > 0) {
    const { error: txError } = await supabase
      .from('transactions')
      .update({ amount: total })
      .eq('id', linked[0].id);
    if (txError) {
      console.error('[Payroll Service] savePayrollItems sync transaction error:', txError);
      throw new Error(txError.message);
    }
  }

  return { ...(data as PayrollRecord), items: (await getPayrollItemList(supabase, [recordId]))[recordId] || [] };
}

async function getPayrollItemList(
  supabase: SupabaseClient,
  recordIds: string[]
): Promise<Record<string, PayrollItem[]>> {
  if (recordIds.length === 0) return {};
  const { data, error } = await supabase
    .from('payroll_items')
    .select('*')
    .in('payroll_record_id', recordIds)
    .order('created_at');
  if (error) throw error;
  const map: Record<string, PayrollItem[]> = {};
  ((data || []) as PayrollItem[]).forEach((it) => {
    (map[it.payroll_record_id] = map[it.payroll_record_id] || []).push(it);
  });
  return map;
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
