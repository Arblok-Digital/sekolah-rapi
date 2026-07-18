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
}

export type EmployeeFormInput = Omit<Employee, 'id' | 'school_id' | 'created_at' | 'updated_at'>;
export type PayrollFormInput = Omit<PayrollRecord, 'id' | 'school_id' | 'created_at' | 'employee'>;

export const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
