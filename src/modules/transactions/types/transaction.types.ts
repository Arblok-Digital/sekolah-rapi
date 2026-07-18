import type {
  Transaction as SharedTransaction,
  Category as SharedCategory,
} from '@/shared/types';

// Re-export shared types for module-level access
export type Transaction = SharedTransaction;
export type Category = SharedCategory;
export type TransactionType = 'income' | 'expense';

// Form-specific types
export interface TransactionFormData {
  type: TransactionType;
  category_id: string;
  amount: number;
  description?: string;
  reference_date: string;
  proof?: FileList;
}
