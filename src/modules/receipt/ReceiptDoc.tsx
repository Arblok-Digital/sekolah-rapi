'use client';

import { forwardRef } from 'react';
import type { ReceiptData, ReceiptSchool } from './types';
import { schoolInitials } from './types';
import { terbilang } from './terbilang';

interface ReceiptDocProps {
  data: ReceiptData;
  school: ReceiptSchool;
}

function formatRp(n: number): string {
  const sign = n < 0 ? '- ' : '';
  return `${sign}Rp ${Math.abs(Math.round(n)).toLocaleString('id-ID')}`;
}

function formatDateLong(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * Template kuitansi digital — lebar tetap 640px, warna solid (aman untuk
 * html2canvas). Di-render di dalam modal, lalu di-capture jadi PNG.
 */
export const ReceiptDoc = forwardRef<HTMLDivElement, ReceiptDocProps>(function ReceiptDoc(
  { data, school },
  ref
) {
  const received = data.direction === 'in';

  return (
    <div
      ref={ref}
      style={{ width: 640 }}
      className="bg-white text-gray-900 rounded-lg overflow-hidden"
    >
      <div className="p-8">
        {/* Kop */}
        <div className="flex items-start gap-4 pb-5 border-b-2 border-gray-900">
          <div
            className="flex items-center justify-center w-14 h-14 rounded-xl bg-indigo-700 text-white text-xl font-bold shrink-0"
          >
            {schoolInitials(school.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold leading-tight">{school.name}</p>
            {school.address && <p className="text-xs text-gray-500 mt-0.5">{school.address}</p>}
            {school.phone && <p className="text-xs text-gray-500">Telp: {school.phone}</p>}
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold tracking-wide">KUITANSI</p>
            <p className="text-xs text-gray-500 mt-1">No. {data.number}</p>
          </div>
        </div>

        {/* Judul + tanggal */}
        <div className="flex items-center justify-between mt-5">
          <p className="text-sm font-bold uppercase tracking-wide">{data.title}</p>
          <p className="text-sm text-gray-600">{formatDateLong(data.date)}</p>
        </div>

        {/* Pihak */}
        <div className="mt-4 rounded-lg border border-gray-200 px-4 py-3">
          <p className="text-xs text-gray-500">{data.counterpartyLabel ?? (received ? 'Telah terima dari' : 'Dibayarkan kepada')}</p>
          <p className="text-base font-bold mt-0.5">{data.counterparty}</p>
        </div>

        {/* Rincian */}
        <table className="w-full mt-4 text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 pr-2 font-medium text-gray-500 w-8">No</th>
              <th className="text-left py-2 pr-2 font-medium text-gray-500">Uraian</th>
              <th className="text-right py-2 font-medium text-gray-500 w-36">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {data.lines.map((line, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-2 pr-2 text-gray-500 align-top">{i + 1}</td>
                <td className="py-2 pr-2 align-top">
                  <p className="font-medium">{line.label}</p>
                  {line.detail && <p className="text-xs text-gray-500 mt-0.5">{line.detail}</p>}
                </td>
                <td className="py-2 text-right whitespace-nowrap align-top">{formatRp(line.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total */}
        <div className="flex items-center justify-between mt-3 rounded-lg bg-gray-900 text-white px-4 py-3">
          <span className="text-sm font-medium">TOTAL</span>
          <span className="text-xl font-bold">{formatRp(data.total)}</span>
        </div>

        {/* Terbilang */}
        <div className="mt-3 rounded-lg bg-gray-50 border border-gray-200 px-4 py-2.5">
          <p className="text-xs text-gray-500">Terbilang</p>
          <p className="text-sm italic font-medium capitalize mt-0.5"># {terbilang(data.total)} #</p>
        </div>

        {data.method && (
          <p className="text-xs text-gray-500 mt-3">
            Metode pembayaran: <span className="font-medium text-gray-700">{data.method}</span>
          </p>
        )}

        {/* Tanda tangan */}
        <div className="flex justify-between mt-8 text-center text-sm">
          <div className="w-56">
            <p className="text-gray-500">{received ? 'Yang membayar' : 'Penerima'}</p>
            <div className="h-16" />
            <p className="font-medium border-t border-gray-300 pt-1 px-4">
              {data.counterparty}
            </p>
          </div>
          <div className="w-56">
            <p className="text-gray-500">Bendahara</p>
            <div className="h-16" />
            <p className="font-medium border-t border-gray-300 pt-1 px-4">
              {data.cashierName || '( Nama Terang )'}
            </p>
          </div>
        </div>

        <p className="text-center text-[11px] text-gray-400 mt-8">
          Dokumen digital {school.name} • Dicetak {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>
    </div>
  );
});
