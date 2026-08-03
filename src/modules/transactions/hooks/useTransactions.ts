'use client';

import { useState, useEffect, useCallback } from 'react';
import { createSupabaseClient } from '@/shared/services/supabase/client';
import { getSession } from '@/shared/services/supabase/auth';
import type { Transaction, TransactionFormData } from '../types/transaction.types';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../services/transaction.service';
import { getCategories } from '../services/category.service';

const supabase = createSupabaseClient();

interface UseTransactionsOptions {
  schoolId: string;
  typeFilter?: 'income' | 'expense';
}

export function useTransactions({ schoolId, typeFilter }: UseTransactionsOptions) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; type: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTransactions(schoolId, { type: typeFilter });
      setTransactions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat transaksi');
    } finally {
      setLoading(false);
    }
  }, [schoolId, typeFilter]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getCategories(schoolId, typeFilter);
      setCategories(data);
    } catch {
      // Silently fail - categories are non-critical for display
    }
  }, [schoolId, typeFilter]);

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, [fetchTransactions, fetchCategories]);

  const addTransaction = async (formData: TransactionFormData) => {
    const { session } = await getSession();
    const userId = session?.user?.id;
    if (!userId) throw new Error('Not authenticated');

    const created = await createTransaction({
      ...formData,
      school_id: schoolId,
      recorded_by: userId,
    });

    await fetchTransactions();
    return created;
  };

  const editTransaction = async (id: string, formData: TransactionFormData) => {
    const updated = await updateTransaction(id, formData);
    await fetchTransactions();
    return updated;
  };

  const removeTransaction = async (id: string) => {
    await deleteTransaction(id);
    await fetchTransactions();
  };

  return {
    transactions,
    categories,
    loading,
    error,
    addTransaction,
    editTransaction,
    removeTransaction,
    refresh: fetchTransactions,
  };
}
