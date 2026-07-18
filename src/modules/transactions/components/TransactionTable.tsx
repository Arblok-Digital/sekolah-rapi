'use client';

import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import type { Transaction } from '../types/transaction.types';

interface TransactionTableProps {
  transactions: Transaction[];
  loading?: boolean;
  onSort?: (field: string) => void;
}

export function TransactionTable({
  transactions,
  loading,
}: TransactionTableProps) {
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
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((tx) => (
            <tr key={tx.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 whitespace-nowrap">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    tx.type === 'income'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                {tx.category_id?.substring(0, 8)}...
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
