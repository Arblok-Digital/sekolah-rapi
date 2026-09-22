'use client';

import { Fragment, useState } from 'react';
import { cn } from '@/shared/utils/cn';
import type { SPPPayment } from '../types/spp.types';
import { getMonthName, formatRupiah } from '../types/spp.types';
import { ChevronDown, Users, Wallet } from 'lucide-react';

interface TunggakanTableProps {
  payments: SPPPayment[];
  loading?: boolean;
}

type TunggakanRow = {
  student_id: string;
  name: string;
  nis?: string;
  class?: string;
  bills: SPPPayment[];
  remaining: number;
};

function sisaBayar(p: SPPPayment): number {
  if (p.status === 'partial') return (p.amount || 0) - (p.paid_amount || 0);
  if (p.status === 'unpaid') return p.amount || 0;
  return 0;
}

const statusBadge: Record<string, { class: string; label: string }> = {
  partial: { class: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Angsuran' },
  unpaid: { class: 'bg-red-100 text-red-700 border-red-200', label: 'Belum Bayar' },
};

export function TunggakanTable({ payments, loading }: TunggakanTableProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 text-center text-sm text-gray-400">Memuat data tunggakan...</div>
      </div>
    );
  }

  const grouped = new Map<string, TunggakanRow>();
  payments.forEach((p) => {
    const key = p.student_id;
    if (!grouped.has(key)) {
      grouped.set(key, {
        student_id: key,
        name: p.student_name || p.student_id,
        nis: p.student_nis,
        class: p.student_class,
        bills: [],
        remaining: 0,
      });
    }
    const row = grouped.get(key)!;
    row.bills.push(p);
    row.remaining += sisaBayar(p);
  });

  const rows: TunggakanRow[] = [];
  grouped.forEach((row) => rows.push(row));
  rows.sort((a, b) => b.remaining - a.remaining);
  const totalRemaining = rows.reduce((sum, r) => sum + r.remaining, 0);
  const realBills = payments.filter((p) => !p.no_bill).length;

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!rows.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-10 text-center">
          <p className="text-sm font-medium text-gray-600">Tidak ada siswa yang menunggak 🎉</p>
          <p className="text-xs text-gray-400 mt-1">
            Semua siswa sudah membayar SPP bulan ini.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="min-w-0 bg-white rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-red-500" />
            <p className="text-xs text-gray-500">Siswa Menunggak</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{rows.length}</p>
        </div>
        <div className="min-w-0 bg-white rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-red-500" />
            <p className="text-xs text-gray-500">Total Sisa Tunggakan</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-red-600 mt-1 leading-tight break-words">{formatRupiah(totalRemaining)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="w-8" />
                <th className="text-left font-medium text-gray-500 px-4 py-3 whitespace-nowrap">Siswa</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3 whitespace-nowrap">Kelas</th>
                <th className="text-center font-medium text-gray-500 px-4 py-3 whitespace-nowrap">Bulan Menunggak</th>
                <th className="text-right font-medium text-gray-500 px-4 py-3 whitespace-nowrap">Total Sisa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((row) => {
                const isOpen = expanded.has(row.student_id);
                return (
                  <Fragment key={row.student_id}>
                    <tr
                      key={row.student_id}
                      className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                      onClick={() => toggle(row.student_id)}
                    >
                      <td className="px-4 py-3">
                        <ChevronDown
                          className={cn(
                            'w-4 h-4 text-gray-400 transition-transform',
                            isOpen ? 'rotate-180' : '-rotate-90'
                          )}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <span className="font-medium text-gray-900">{row.name}</span>
                          {row.nis && (
                            <span className="text-xs text-gray-400 ml-1.5">NIS: {row.nis}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{row.class || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        {row.bills.length > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                            {row.bills.length} bulan
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                            Belum Bayar
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-red-600">
                        {formatRupiah(row.remaining)}
                      </td>
                    </tr>
                    {isOpen && (
                      <tr key={`${row.student_id}-detail`}>
                        <td colSpan={5} className="px-4 pb-4 bg-gray-50/30">
                          {row.bills.length > 0 ? (
                          <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                            <table className="w-full text-sm">
                              <tbody className="divide-y divide-gray-50">
                                {row.bills.map((bill) => {
                                  const badge = statusBadge[bill.status] || statusBadge.unpaid;
                                  return (
                                    <tr key={bill.id}>
                                      <td className="px-4 py-2.5 text-gray-700">
                                        {getMonthName(bill.month)} {bill.year}
                                      </td>
                                      <td className="px-4 py-2.5 text-right text-gray-600">
                                        {formatRupiah(bill.amount)}
                                      </td>
                                      <td className="px-4 py-2.5 text-right text-gray-600">
                                        dibayar {formatRupiah(bill.paid_amount)}
                                      </td>
                                      <td className="px-4 py-2.5 text-right font-medium text-red-600">
                                        sisa {formatRupiah(sisaBayar(bill))}
                                      </td>
                                      <td className="px-4 py-2.5 text-center">
                                        <span
                                          className={cn(
                                            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
                                            badge.class
                                          )}
                                        >
                                          {badge.label}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                          ) : (
                            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden px-4 py-3 text-sm text-gray-400">
                              Belum ada tagihan untuk bulan ini.
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="border-t border-gray-100 px-4 py-2.5 text-xs text-gray-400">
          {rows.length} siswa belum bayar bulan ini{
            realBills > 0 ? ` (${realBills} tagihan belum lunas)` : ''
          }. Klik baris untuk melihat rincian.
        </div>
      </div>
    </div>
  );
}