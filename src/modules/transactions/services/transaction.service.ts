import { createSupabaseClient } from '@/shared/services/supabase/client';
import { db } from '@/modules/offline/db';
import type { Transaction, TransactionFormData } from '../types/transaction.types';
import { isOfflineError } from '@/modules/offline/services/network';
import { withOfflineFallback } from '@/modules/offline/services/read';
import { mirrorFull } from '@/modules/offline/services/mirror';
import { getDeviceId } from '@/modules/offline/services/device';

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
  return withOfflineFallback(
    async () => {
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
      const rows = data ?? [];
      await mirrorFull('transactions', rows);
      return rows;
    },
    async () => {
      let rows = await db.transactions.where('school_id').equals(schoolId).toArray();
      if (options?.type) rows = rows.filter((r) => r.type === options.type);
      if (options?.categoryId) rows = rows.filter((r) => r.category_id === options.categoryId);
      if (options?.startDate) rows = rows.filter((r) => r.reference_date >= options.startDate!);
      if (options?.endDate) rows = rows.filter((r) => r.reference_date <= options.endDate!);
      rows.sort((a, b) => b.reference_date.localeCompare(a.reference_date));
      return rows;
    }
  );
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
      device_id: getDeviceId(),
    })
    .select()
    .single();

  if (error) {
    // Only fall back to offline queueing on genuine network errors. RLS denials
    // and validation errors must be thrown to the caller instead.
    if (!isOfflineError(error)) throw error;

    const localId = crypto.randomUUID();
    const nowIso = new Date().toISOString();
    const localTransaction: Transaction = {
      id: localId,
      school_id: transaction.school_id,
      type: transaction.type,
      category_id: transaction.category_id,
      amount: transaction.amount,
      description: transaction.description,
      reference_date: transaction.reference_date,
      recorded_by: transaction.recorded_by,
      created_at: nowIso,
      updated_at: nowIso,
      device_id: getDeviceId(),
    };
    await db.transactions.put(localTransaction);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id ?? transaction.recorded_by;
    if (!userId) throw error;

    await db.sync_queue.add({
      school_id: transaction.school_id,
      user_id: userId,
      entity: 'transaction',
      entity_id: localId,
      action: 'INSERT',
      payload: {
        id: localId,
        school_id: transaction.school_id,
        type: transaction.type,
        category_id: transaction.category_id,
        amount: transaction.amount,
        description: transaction.description || null,
        reference_date: transaction.reference_date,
        recorded_by: transaction.recorded_by,
        device_id: getDeviceId(),
      },
      attempts: 0,
      status: 'pending',
      created_at: new Date(),
    });

    return localTransaction;
  }

  // Mirror write-through: baris server langsung tersedia untuk baca offline.
  await db.transactions.put(data);
  return data;
}

export async function updateTransaction(
  id: string,
  updates: TransactionFormData
): Promise<Transaction> {
  // Try Supabase first
  const payload = {
    type: updates.type,
    category_id: updates.category_id,
    amount: updates.amount,
    description: updates.description || null,
    reference_date: updates.reference_date,
    device_id: getDeviceId(),
  };

  const { data, error } = await supabase
    .from('transactions')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    // Only fall back to offline queueing on genuine network errors. RLS denials
    // and validation errors must be thrown to the caller instead.
    if (!isOfflineError(error)) throw error;

    const existing = await db.transactions.get(id);
    if (!existing) throw error;

    const localTransaction: Transaction = {
      ...existing,
      ...payload,
      description: updates.description,
      updated_at: new Date().toISOString(),
    };
    await db.transactions.put(localTransaction);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id ?? existing.recorded_by;
    if (!userId) throw error;

    await db.sync_queue.add({
      school_id: existing.school_id,
      user_id: userId,
      entity: 'transaction',
      entity_id: id,
      action: 'UPDATE',
      payload: {
        ...payload,
        id,
        school_id: existing.school_id,
        recorded_by: existing.recorded_by,
      },
      attempts: 0,
      status: 'pending',
      created_at: new Date(),
    });

    return localTransaction;
  }

  await db.transactions.put(data);
  return data;
}

export async function deleteTransaction(id: string): Promise<void> {
  // Try Supabase first
  const { error } = await supabase.from('transactions').delete().eq('id', id);

  if (error) {
    // Only fall back to offline queueing on genuine network errors. RLS denials
    // and validation errors must be thrown to the caller instead.
    if (!isOfflineError(error)) throw error;

    const existing = await db.transactions.get(id);
    if (!existing) throw error;

    await db.transactions.delete(id);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id ?? existing.recorded_by;
    if (!userId) throw error;

    await db.sync_queue.add({
      school_id: existing.school_id,
      user_id: userId,
      entity: 'transaction',
      entity_id: id,
      action: 'DELETE',
      payload: { id },
      attempts: 0,
      status: 'pending',
      created_at: new Date(),
    });
    return;
  }

  // Hapus dari mirror lokal supaya tidak jadi zombie sampai pull berikutnya.
  await db.transactions.delete(id);
}

export async function getCategories(
  schoolId: string,
  type?: 'income' | 'expense'
): Promise<{ id: string; name: string; type: string }[]> {
  return withOfflineFallback(
    async () => {
      let query = supabase
        .from('categories')
        .select('id, name, type')
        .eq('school_id', schoolId);

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;
      if (error) throw error;
      const rows = data ?? [];
      // Select parsial → merge, jangan membuat baris utuh dari potongan kolom.
      const { mirrorPatch } = await import('@/modules/offline/services/mirror');
      await mirrorPatch('categories', rows);
      return rows;
    },
    async () => {
      let rows = await db.categories.where('school_id').equals(schoolId).toArray();
      if (type) rows = rows.filter((r) => r.type === type);
      rows.sort((a, b) => a.name.localeCompare(b.name));
      return rows.map((r) => ({ id: r.id, name: r.name, type: r.type }));
    }
  );
}
