'use client';

import { useState } from 'react';
import { useAuth } from '@/shared/providers/AuthProvider';
import { TransactionTable } from '@/modules/transactions/components/TransactionTable';
import { TransactionForm } from '@/modules/transactions/components/TransactionForm';
import { useTransactions } from '@/modules/transactions/hooks/useTransactions';
import type { TransactionFormData } from '@/modules/transactions/types/transaction.types';

export default function TransactionsPage() {
  const [showForm, setShowForm] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const { schoolId } = useAuth();

  const { transactions, loading, error, addTransaction } = useTransactions({
    schoolId: schoolId || '',
    typeFilter: typeFilter === 'all' ? undefined : typeFilter,
  });

  const handleAddTransaction = async (data: TransactionFormData) => {
    await addTransaction(data);
    setShowForm(false);
  };

  if (!schoolId) {
    return (
      <div className="text-center py-12">
        <p className="text-white/70">Memuat data sekolah...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kas Masuk/Keluar</h2>
          <p className="text-sm text-gray-500 mt-1">Kelola pemasukan dan pengeluaran sekolah</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          + Tambah Transaksi
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Filter */}
      <div className="mb-4 flex gap-2">
        {(['all', 'income', 'expense'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setTypeFilter(f)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              typeFilter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? 'Semua' : f === 'income' ? 'Pemasukan' : 'Pengeluaran'}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500 mt-3">Memuat data transaksi...</p>
        </div>
      ) : (
        <TransactionTable transactions={transactions || []} />
      )}

      {/* Add Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Tambah Transaksi Baru</h3>
            <TransactionForm
              onSubmit={handleAddTransaction}
              onCancel={() => setShowForm(false)}
              schoolId={schoolId}
            />
          </div>
        </div>
      )}
    </div>
  );
}
