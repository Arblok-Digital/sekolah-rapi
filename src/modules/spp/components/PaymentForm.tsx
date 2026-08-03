'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useToast } from '@/shared/components/ui/toast';
import type { SPPFormInput, SPPStatus } from '../types/spp.types';
import { getMonthName } from '../types/spp.types';

interface StudentOption {
  id: string;
  name: string;
  nis: string;
  class: string;
}

interface PaymentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: SPPFormInput) => Promise<void>;
  students?: StudentOption[];
  defaultMonth?: number;
  defaultYear?: number;
}

const METHODS = ['tunai', 'transfer', 'qris', 'lainnya'] as const;

export function PaymentForm({
  open,
  onClose,
  onSubmit,
  students = [],
  defaultMonth,
  defaultYear,
}: PaymentFormProps) {
  const now = new Date();
  const [studentId, setStudentId] = useState('');
  const [month, setMonth] = useState(defaultMonth ?? now.getMonth() + 1);
  const [year, setYear] = useState(defaultYear ?? now.getFullYear());
  const [amount, setAmount] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [status, setStatus] = useState<SPPStatus>('paid');
  const [method, setMethod] = useState('tunai');
  const [paymentDate, setPaymentDate] = useState(now.toISOString().split('T')[0]);
  const [receiptNumber, setReceiptNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  // Sync paid amount with amount when status changes to 'paid'
  useEffect(() => {
    if (status === 'paid' && amount) {
      setPaidAmount(amount);
    }
  }, [status, amount]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!studentId) {
      setError('Pilih siswa terlebih dahulu');
      return;
    }
    if (!amount || parseInt(amount) <= 0) {
      setError('Nominal wajib diisi');
      return;
    }

    const paid = parseInt(paidAmount || '0');
    if (paid < 0) {
      setError('Jumlah dibayar tidak valid');
      return;
    }

    const input: SPPFormInput = {
      student_id: studentId,
      month,
      year,
      amount: parseInt(amount),
      paid_amount: paid,
      status,
      payment_date: paymentDate,
      method,
      receipt_number: receiptNumber || undefined,
    };

    setSubmitting(true);
    try {
      await onSubmit(input);
      toast({ title: 'Pembayaran SPP dicatat', variant: 'success' });
      // Reset form
      setStudentId('');
      setAmount('');
      setPaidAmount('');
      setStatus('paid');
      setMethod('tunai');
      setReceiptNumber('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan pembayaran');
    } finally {
      setSubmitting(false);
    }
  };

  const currentYear = now.getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* modal */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-200">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Tambah Pembayaran SPP</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* body */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          {/* Siswa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Siswa *</label>
            {students.length > 0 ? (
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                required
              >
                <option value="">-- Pilih Siswa --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.nis} - {s.class})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="ID Siswa"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                required
              />
            )}
          </div>

          {/* Month / Year row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bulan *</label>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {getMonthName(m)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tahun *</label>
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount / Paid row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nominal (Rp) *</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (status === 'paid') setPaidAmount(e.target.value);
                }}
                placeholder="350000"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                min={0}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dibayar (Rp)</label>
              <input
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                placeholder="350000"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                min={0}
                disabled={status === 'paid'}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as SPPStatus)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            >
              <option value="paid">Lunas</option>
              <option value="partial">Angsuran</option>
              <option value="unpaid">Belum Bayar</option>
            </select>
          </div>

          {/* Method + Date row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Metode</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              >
                {METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Bayar</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
          </div>

          {/* Receipt Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">No. Kwitansi</label>
            <input
              type="text"
              value={receiptNumber}
              onChange={(e) => setReceiptNumber(e.target.value)}
              placeholder="Opsional"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
