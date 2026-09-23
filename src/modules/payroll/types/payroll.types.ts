export interface Employee {
  id: string;
  school_id: string;
  name: string;
  position: string;
  phone?: string;
  base_salary: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface PayrollRecord {
  id: string;
  school_id: string;
  employee_id: string;
  month: number;
  year: number;
  base_salary: number;
  bonus: number;
  deduction: number;
  total: number;
  paid: boolean;
  paid_date?: string;
  notes?: string;
  created_at: string;
  // Joined
  employee?: Employee;
  // Rincian tunjangan/potongan (diisi getPayroll)
  items?: PayrollItem[];
}

export type EmployeeFormInput = Omit<Employee, 'id' | 'school_id' | 'created_at' | 'updated_at'>;
export type PayrollFormInput = Omit<PayrollRecord, 'id' | 'school_id' | 'created_at' | 'employee' | 'items'>;

export const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

// ── Rincian gaji (payroll_items) ──
export type PayrollItemKind = 'allowance' | 'deduction';

export interface PayrollItem {
  id: string;
  school_id: string;
  payroll_record_id: string;
  kind: PayrollItemKind;
  category: string;
  description?: string;
  amount: number;
  created_at: string;
}

export interface PayrollItemInput {
  kind: PayrollItemKind;
  category: string;
  description?: string;
  amount: number;
}

export const PAYROLL_ALLOWANCE_CATEGORIES = [
  'Bonus',
  'Insentif',
  'Tunjangan',
  'THR',
  'Lembur',
  'Transport',
  'Makan',
  'Lainnya',
] as const;

export const PAYROLL_DEDUCTION_CATEGORIES = [
  'BPJS',
  'Kasbon',
  'Pajak',
  'Koperasi',
  'Potongan',
  'Lainnya',
] as const;

/** Jumlah tunjangan & potongan dari items (fallback ke kolom lama bila items kosong). */
export function payrollSums(r: PayrollRecord): { allowance: number; deduction: number } {
  if (r.items && r.items.length > 0) {
    return {
      allowance: r.items.filter((i) => i.kind === 'allowance').reduce((s, i) => s + i.amount, 0),
      deduction: r.items.filter((i) => i.kind === 'deduction').reduce((s, i) => s + i.amount, 0),
    };
  }
  return { allowance: r.bonus || 0, deduction: r.deduction || 0 };
}
