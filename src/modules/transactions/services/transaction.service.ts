import { createSupabaseClient } from '@/shared/services/supabase/client';
import { db } from '@/modules/offline/db';
import type { Transaction, TransactionFormData } from '../types/transaction.types';

const supabase = createSupabaseClient();

export async function getTransactions(
  schoolId: string,
  options?: {
    type?: 'income' | 'expense';
    startDate?: string;
    endDate?: string;
    categoryId?: string;
  }
): Promise<Transaction[]> {
  let query = supabase
    .from('transactions')
    .select('*')
    .eq('school_id', schoolId)
    .order('reference_date', { ascending: false });

  if (options?.type) {
    query = query.eq('type', options.type);
  }
  if (options?.categoryId) {
    query = query.eq('category_id', options.categoryId);
  }
  if (options?.startDate) {
    query = query.gte('reference_date', options.startDate);
  }
  if (options?.endDate) {
    query = query.lte('reference_date', options.endDate);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function createTransaction(
  transaction: TransactionFormData & { school_id: string; recorded_by: string }
): Promise<Transaction> {
  // Try Supabase first
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      school_id: transaction.school_id,
      type: transaction.type,
      category_id: transaction.category_id,
      amount: transaction.amount,
      description: transaction.description || null,
      reference_date: transaction.reference_date,
      recorded_by: transaction.recorded_by,
    })
    .select()
    .single();

  if (error) {
    // If offline, queue for sync
    const localId = crypto.randomUUID();
    await db.transactions.add({
      id: localId,
      school_id: transaction.school_id,
      type: transaction.type,
      category_id: transaction.category_id,
      amount: transaction.amount,
      description: transaction.description,
      reference_date: transaction.reference_date,
      recorded_by: transaction.recorded_by,
      created_at: new Date().toISOString(),
    });

    await db.sync_queue.add({
      school_id: transaction.school_id,
      user_id: transaction.recorded_by,
      entity: 'transaction',
      entity_id: localId,
      action: 'INSERT',
      payload: transaction,
      attempts: 0,
      status: 'pending',
      created_at: new Date(),
    });

    return db.transactions.get(localId) as Promise<Transaction>;
  }

  return data;
}

export async function getCategories(
  schoolId: string,
  type?: 'income' | 'expense'
): Promise<{ id: string; name: string; type: string }[]> {
  let query = supabase
    .from('categories')
    .select('id, name, type')
    .eq('school_id', schoolId);

  if (type) {
    query = query.eq('type', type);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}
