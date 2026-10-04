'use client';

import { cn } from '@/shared/utils/cn';
import type { SPPPayment } from '../types/spp.types';
import { getMonthName, formatRupiah } from '../types/spp.types';

interface PaymentTableProps {
  payments: SPPPayment[];
  loading?: boolean;
  onDelete?: (id: string) => void;
  onReceipt?: (payment: SPPPayment) => void;
  onStudentClick?: (payment: SPPPayment) => void;
}

const statusBadge: Record<string, { class: string; label: string }> = {
  paid: { class: 'bg-green-100 text-green-700 border-green-200', label: 'Lunas' },
  partial: { class: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Angsuran' },
  unpaid: { class: 'bg-red-100 text-red-700 border-red-200', label: 'Belum Bayar' },
};

export function PaymentTable({ payments, loading, onDelete, onReceipt, onStudentClick }: PaymentTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 text-center text-sm text-gray-400">Memuat data...</div>
      </div>
    );
  }

  if (!payments.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 text-center text-sm text-gray-400">
          Belum ada data pembayaran siswa.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left font-medium text-gray-500 px-4 py-3 whitespace-nowrap">Siswa</th>
              <th className="text-left font-medium text-gray-500 px-4 py-3 whitespace-nowrap">Kelas</th>
              <th className="text-left font-medium text-gray-500 px-4 py-3 whitespace-nowrap">Kategori</th>
              <th className="text-left font-medium text-gray-500 px-4 py-3 whitespace-nowrap">Bulan</th>
              <th className="text-left font-medium text-gray-500 px-4 py-3 whitespace-nowrap">Tahun</th>
              <th className="text-right font-medium text-gray-500 px-4 py-3 whitespace-nowrap">Nominal</th>
              <th className="text-right font-medium text-gray-500 px-4 py-3 whitespace-nowrap">Dibayar</th>
              <th className="text-center font-medium text-gray-500 px-4 py-3 whitespace-nowrap">Status</th>
              <th className="text-left font-medium text-gray-500 px-4 py-3 whitespace-nowrap">Tanggal</th>
              {(onDelete || onReceipt) && (
                <th className="text-center font-medium text-gray-500 px-4 py-3 whitespace-nowrap">Aksi</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {payments.map((payment) => {
              const badge = statusBadge[payment.status] || statusBadge.unpaid;
              return (
                <tr
                  key={payment.id}
                  className={cn(
                    'hover:bg-gray-50/50 transition-colors',
                    onStudentClick && 'cursor-pointer'
                  )}
                  onClick={onStudentClick ? () => onStudentClick(payment) : undefined}
                  title={onStudentClick ? 'Lihat kartu keuangan siswa' : undefined}
                >
                  <td className="px-4 py-3">
                    <div>
                      {onStudentClick ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onStudentClick(payment);
                          }}
                          className="font-medium text-gray-900 hover:text-indigo-600 hover:underline underline-offset-2 transition-colors"
                          title="Lihat kartu keuangan siswa"
                        >
                          {payment.student_name || payment.student_id}
                        </button>
                      ) : (
                        <span className="font-medium text-gray-900">{payment.student_name || payment.student_id}</span>
                      )}
                      {payment.student_nis && (
                        <span className="text-xs text-gray-400 ml-1.5">NIS: {payment.student_nis}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{payment.student_class || '-'}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {payment.category_name || 'SPP'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {payment.month ? getMonthName(payment.month) : '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{payment.year ?? '-'}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {formatRupiah(payment.amount)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {formatRupiah(payment.paid_amount)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
                        badge.class
                      )}
                    >
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {payment.payment_date || '-'}
                  </td>
                  {(onDelete || onReceipt) && (
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {onReceipt && (payment.status === 'paid' || payment.status === 'partial') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onReceipt(payment);
                            }}
                            className="px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                            title="Lihat / bagikan kuitansi"
                          >
                            Kuitansi
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(payment.id);
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
