export interface Profile {
  id: string;
  school_id?: string;
  role: 'super_admin' | 'owner' | 'principal' | 'treasurer' | 'staff';
  name: string;
  phone?: string;
  email?: string;
  created_at?: string;
}

export interface School {
  id: string;
  name: string;
  npsn?: string;
  address?: string;
  phone?: string;
  email?: string;
  owner_id: string;
  plan: 'free' | 'basic' | 'pro' | 'lifetime';
  settings?: Record<string, any>;
  sync_enabled?: boolean;
  last_sync_at?: string;
  created_at?: string;
}

export interface Student {
  id: string;
  school_id: string;
  nis: string;
  name: string;
  class: string;
  gender?: string;
  address?: string;
  parent_name?: string;
  parent_phone?: string;
  status: 'active' | 'graduated' | 'transferred';
  created_at?: string;
  updated_at?: string;
}

export interface SPPPayment {
  id: string;
  school_id: string;
  student_id: string;
  month: number;
  year: number;
  amount: number;
  paid_amount: number;
  status: 'paid' | 'partial' | 'unpaid';
  payment_date?: string;
  method?: string;
  receipt_number?: string;
  recorded_by: string;
  created_at?: string;
  updated_at?: string;
}

export interface Transaction {
  id: string;
  school_id: string;
  type: 'income' | 'expense';
  category_id: string;
  amount: number;
  description?: string;
  reference_date: string;
  proof_url?: string;
  recorded_by: string;
  approved_by?: string;
  source_type?: 'spp' | 'payroll' | 'inventory' | 'reversal' | null;
  source_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  school_id: string;
  type: 'income' | 'expense';
  name: string;
  description?: string;
  is_default: boolean;
  created_at?: string;
}

export interface FinancialSummary {
  school_id: string;
  month: number;
  year: number;
  total_income: number;
  total_expense: number;
  balance: number;
  spp_collected: number;
  spp_outstanding: number;
  updated_at?: string;
}

export interface SyncQueueItem {
  id?: number;
  school_id: string;
  user_id: string;
  entity: 'spp_payment' | 'transaction' | 'student';
  entity_id: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  payload: any;
  attempts: number;
  last_error?: string;
  status: 'pending' | 'synced' | 'failed';
  created_at?: Date;
  synced_at?: Date;
}

export type { Database } from './database';
