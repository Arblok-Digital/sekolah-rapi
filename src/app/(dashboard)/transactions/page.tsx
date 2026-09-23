'use client';

import { useState } from 'react';
import { useAuth } from '@/shared/providers/AuthProvider';
import { TransactionTable } from '@/modules/transactions/components/TransactionTable';
import { TransactionForm } from '@/modules/transactions/components/TransactionForm';
import { useTransactions } from '@/modules/transactions/hooks/useTransactions';
import { useSchoolRealtime } from '@/shared/hooks/useSchoolRealtime';
import type {
  Transaction,
  TransactionFormData,
} from '@/modules/transactions/types/transaction.types';
import { ReceiptModal, kasReceipt, type ReceiptData } from '@/modules/receipt';

export default function TransactionsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const { schoolId, canUse, school, profile } = useAuth();

  const {
    transactions,
    categories,
    loading,
    error,
    addTransaction,
    editTransaction,
    removeTransaction,
    refresh,
  } = useTransactions({
    schoolId: schoolId || '',
    typeFilter: typeFilter === 'all' ? undefined : typeFilter,
  });

  useSchoolRealtime(schoolId, { tables: ['transactions'], enabled: canUse('realtime_dashboard'), onEvent: refresh });

  const handleAddTransaction = async (data: TransactionFormData) => {
    await addTransaction(data);
    setShowForm(false);
    setMessage('Transaksi berhasil ditambahkan');
  };

  const handleUpdateTransaction = async (data: TransactionFormData) => {
    if (!editingTransaction) return;
    await editTransaction(editingTransaction.id, data);
    setShowForm(false);
    setEditingTransaction(null);
    setMessage('Transaksi berhasil diperbarui');
  };

  const handleDeleteTransaction = async (transaction: Transaction) => {
    setDeletingId(transaction.id);
    try {
      await removeTransaction(transaction.id);
      setMessage('Transaksi berhasil dihapus');
    } finally {
      setDeletingId(null);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  const openReceipt = (tx: Transaction) => {
    const categoryName = categories?.find((c) => c.id === tx.category_id)?.name;
    setReceipt(
      kasReceipt({
        id: tx.id,
        type: tx.type,
        amount: tx.amount,
        date: tx.reference_date?.slice(0, 10) || new Date().toISOString().slice(0, 10),
        description: tx.description ?? undefined,
        categoryName,
        cashierName: profile?.name,
      })
    );
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
          <h2 className="text-2xl font-bold text-white">Kas Masuk/Keluar</h2>
          <p className="text-sm text-gray-500 mt-1">Kelola pemasukan dan pengeluaran sekolah</p>
        </div>
        <button
          onClick={() => {
            setEditingTransaction(null);
            setShowForm(true);
          }}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          + Tambah Transaksi
        </button>
      </div>

      {message && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
          {message}
        </div>
      )}

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
        <TransactionTable
          transactions={transactions || []}
          categories={categories}
          onEdit={(transaction) => {
            setEditingTransaction(transaction);
            setShowForm(true);
          }}
          onDelete={handleDeleteTransaction}
          onReceipt={openReceipt}
          deletingId={deletingId}
        />
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-auto w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">
              {editingTransaction ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}
            </h3>
            <TransactionForm
              key={editingTransaction?.id ?? 'create'}
              initialData={editingTransaction}
              onSubmit={editingTransaction ? handleUpdateTransaction : handleAddTransaction}
              onCancel={closeForm}
              schoolId={schoolId}
            />
          </div>
        </div>
      )}

      {/* Receipt Preview Modal */}
      {receipt && school && (
        <ReceiptModal
          data={receipt}
          school={{ name: school.name }}
          onClose={() => setReceipt(null)}
        />
      )}
    </div>
  );
}
