'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import type { Transaction } from '../types/transaction.types';
import { collectReversedSourceIds } from '../utils/reversal';

interface TransactionTableProps {
  transactions: Transaction[];
  categories?: { id: string; name: string; type: string }[];
  loading?: boolean;
  onSort?: (field: string) => void;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
  onReceipt?: (transaction: Transaction) => void;
  deletingId?: string | null;
}

export function TransactionTable({
  transactions,
  categories = [],
  loading,
  onEdit,
  onDelete,
  onReceipt,
  deletingId,
}: TransactionTableProps) {
  const categoryName = (id: string | null | undefined) =>
    categories.find((c) => c.id === id)?.name ?? (id ? `${id.substring(0, 8)}…` : '-');

  const reversedIds = useMemo(() => collectReversedSourceIds(transactions), [transactions]);

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">Memuat data...</div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Belum ada transaksi. Klik &quot;Tambah Transaksi&quot; untuk memulai.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipe
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Kategori
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Jumlah
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tanggal
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Keterangan
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((tx) => {
            const isReversal = tx.source_type === 'reversal';
            const isReversedOriginal = reversedIds.has(tx.id);
            return (
            <tr
              key={tx.id}
              className={`hover:bg-gray-50 ${isReversal ? 'bg-red-50/40' : ''} ${isReversedOriginal ? 'opacity-60' : ''}`}
            >
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      tx.type === 'income'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                  </span>
                  {isReversal && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700">
                      Koreksi
                    </span>
                  )}
                  {isReversedOriginal && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700">
                      Diganti
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                {categoryName(tx.category_id)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium">
                <span
                  className={tx.type === 'income' ? 'text-green-600' : 'text-red-600'}
                >
                  Rp {tx.amount.toLocaleString('id-ID')}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                {tx.reference_date
                  ? format(new Date(tx.reference_date), 'dd MMM yyyy', { locale: id })
                  : '-'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                {tx.description || '-'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                <div className="flex justify-end gap-2">
                  {onReceipt && (
                    <button
                      onClick={() => onReceipt(tx)}
                      title="Lihat / bagikan kuitansi"
                      className="px-3 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-md hover:bg-emerald-100"
                    >
                      Kuitansi
                    </button>
                  )}
                  <button
                    onClick={() => onEdit?.(tx)}
                    className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Hapus transaksi ini?')) {
                        onDelete?.(tx);
                      }
                    }}
                    disabled={deletingId === tx.id}
                    className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 disabled:opacity-50"
                  >
                    {deletingId === tx.id ? 'Menghapus...' : 'Hapus'}
                  </button>
                </div>
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
