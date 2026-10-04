'use client';

import { X, Pencil } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import type { SPPPayment } from '../types/spp.types';
import { formatPeriodLabel, formatRupiah } from '../types/spp.types';

interface StudentFinanceCardProps {
  student: { id: string; name?: string; nis?: string; class?: string } | null;
  payments?: SPPPayment[];
  loading?: boolean;
  onClose: () => void;
  onEdit?: (payment: SPPPayment) => void;
}

const statusBadge: Record<string, { class: string; label: string }> = {
  paid: { class: 'bg-green-100 text-green-700 border-green-200', label: 'Lunas' },
  partial: { class: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Angsuran' },
  unpaid: { class: 'bg-red-100 text-red-700 border-red-200', label: 'Belum Bayar' },
};

function sisaBayar(p: SPPPayment): number {
  if (p.status === 'partial') return Math.max((p.amount || 0) - (p.paid_amount || 0), 0);
  if (p.status === 'unpaid') return p.amount || 0;
  return 0;
}

export function StudentFinanceCard({ student, payments, loading, onClose, onEdit }: StudentFinanceCardProps) {
  if (!student) return null;

  const rows = payments ?? [];
  const totalTagihan = rows.reduce((s, p) => s + (p.amount || 0), 0);
  const totalDibayar = rows.reduce((s, p) => s + (p.paid_amount || 0), 0);
  const totalSisa = rows.reduce((s, p) => s + sisaBayar(p), 0);

  const groups = new Map<string, SPPPayment[]>();
  rows.forEach((p) => {
    const key = p.category_name || 'SPP';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  });
  const groupNames = Array.from(groups.keys()).sort((a, b) => {
    if (a === 'SPP') return -1;
    if (b === 'SPP') return 1;
    return a.localeCompare(b);
  });

  const name = rows[0]?.student_name || student.name || 'Siswa';
  const nis = rows[0]?.student_nis || student.nis;
  const kelas = rows[0]?.student_class || student.class;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} aria-hidden />

      <aside className="relative w-full max-w-md bg-white shadow-xl border-l border-gray-200 h-full overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-gray-900 truncate">{name}</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {nis ? `NIS: ${nis}` : ''}
                {nis && kelas ? ' • ' : ''}
                {kelas ? `Kelas: ${kelas}` : ''}
                {!nis && !kelas ? 'Kartu keuangan siswa' : ''}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
              aria-label="Tutup kartu keuangan"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Rekap */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
              <p className="text-[11px] text-gray-400">Kewajiban</p>
              <p className="text-sm font-bold text-gray-900 leading-snug">{formatRupiah(totalTagihan)}</p>
            </div>
            <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
              <p className="text-[11px] text-gray-400">Dibayar</p>
              <p className="text-sm font-bold text-emerald-600 leading-snug">{formatRupiah(totalDibayar)}</p>
            </div>
            <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
              <p className="text-[11px] text-gray-400">Sisa</p>
              <p className={cn('text-sm font-bold leading-snug', totalSisa > 0 ? 'text-red-600' : 'text-gray-900')}>
                {formatRupiah(totalSisa)}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-5">
          {loading && (
            <div className="text-center py-10">
              <div className="w-7 h-7 border-2 border-gray-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
              <p className="text-xs text-gray-400 mt-3">Memuat kartu keuangan...</p>
            </div>
          )}

          {!loading && rows.length === 0 && (
            <div className="text-center py-10">
              <p className="text-sm font-medium text-gray-600">Belum ada tagihan atau pembayaran</p>
              <p className="text-xs text-gray-400 mt-1">
                Catat pembayaran pertama lewat tombol &quot;Catat Pembayaran&quot;.
              </p>
            </div>
          )}

          {!loading &&
            groupNames.map((groupName) => {
              const items = groups.get(groupName)!;
              const groupTotal = items.reduce((s, p) => s + (p.amount || 0), 0);
              const groupPaid = items.reduce((s, p) => s + (p.paid_amount || 0), 0);
              return (
                <section key={groupName}>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {groupName}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {formatRupiah(groupPaid)} / {formatRupiah(groupTotal)}
                    </span>
                  </div>
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="divide-y divide-gray-50">
                      {items.map((p) => {
                        const badge = statusBadge[p.status] || statusBadge.unpaid;
                        const sisa = sisaBayar(p);
                        return (
                          <div key={p.id} className="flex items-center gap-3 px-3 py-2.5">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {formatPeriodLabel(p.month, p.year)}
                              </p>
                              <p className="text-[11px] text-gray-400">
                                {p.payment_date ? `dibayar ${p.payment_date}` : 'belum ada tanggal bayar'}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-medium text-gray-900">{formatRupiah(p.paid_amount)}</p>
                              {sisa > 0 && <p className="text-[11px] text-red-600">sisa {formatRupiah(sisa)}</p>}
                            </div>
                            <span
                              className={cn(
                                'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border shrink-0',
                                badge.class
                              )}
                            >
                              {badge.label}
                            </span>
                            {onEdit && (
                              <button
                                onClick={() => onEdit(p)}
                                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors shrink-0"
                                title="Edit pembayaran ini"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>
              );
            })}
        </div>
      </aside>
    </div>
  );
}
