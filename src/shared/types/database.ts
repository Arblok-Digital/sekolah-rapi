import type {
  Profile,
  School,
  Student,
  SPPPayment,
  Transaction,
  Category,
  FinancialSummary,
  SyncQueueItem,
} from './index';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at'>;
        Update: Partial<Omit<Profile, 'id'>>;
      };
      schools: {
        Row: School;
        Insert: Omit<School, 'created_at'>;
        Update: Partial<Omit<School, 'id' | 'owner_id'>>;
      };
      students: {
        Row: Student;
        Insert: Omit<Student, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Student, 'id'>>;
      };
      spp_payments: {
        Row: SPPPayment;
        Insert: Omit<SPPPayment, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<SPPPayment, 'id'>>;
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Transaction, 'id'>>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, 'created_at'>;
        Update: Partial<Omit<Category, 'id'>>;
      };
      financial_summaries: {
        Row: FinancialSummary;
        Insert: Omit<FinancialSummary, 'updated_at'>;
        Update: Partial<Omit<FinancialSummary, 'school_id' | 'month' | 'year'>>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
