'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useToast } from '@/shared/components/ui/toast';
import { toUserMessage } from '@/shared/lib/safe-error';
import type { SPPFormInput, SPPPayment, SPPStatus } from '../types/spp.types';
import { getMonthName } from '../types/spp.types';

interface StudentOption {
  id: string;
  name: string;
  nis: string;
  class: string;
}

interface CategoryOption {
  id: string;
  name: string;
}

interface PaymentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: SPPFormInput) => Promise<void>;
  students?: StudentOption[];
  categories?: CategoryOption[];
  defaultMonth?: number;
  defaultYear?: number;
  initialData?: SPPPayment | null;
}

const METHODS = ['tunai', 'transfer', 'qris', 'lainnya'] as const;

export function PaymentForm({
  open,
  onClose,
  onSubmit,
  students = [],
  categories = [],
  defaultMonth,
  defaultYear,
  initialData,
}: PaymentFormProps) {
  const now = new Date();
  const isEditing = !!initialData;
  const [studentId, setStudentId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [month, setMonth] = useState<number | null>(defaultMonth ?? now.getMonth() + 1);
  const [year, setYear] = useState<number | null>(defaultYear ?? now.getFullYear());
  const [noPeriod, setNoPeriod] = useState(false);
  const [amount, setAmount] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [status, setStatus] = useState<SPPStatus>('paid');
  const [method, setMethod] = useState('tunai');
  const [paymentDate, setPaymentDate] = useState(now.toISOString().split('T')[0]);
  const [receiptNumber, setReceiptNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const defaultCategoryId =
    categories.find((c) => c.name === 'SPP')?.id ?? categories[0]?.id ?? '';

  // Reset/sync form fields whenever the modal opens (create or edit)
  useEffect(() => {
    if (!open) return;
    const fallback = new Date();
    const hasPeriod = initialData ? initialData.month != null || initialData.year != null : true;
    setStudentId(initialData?.student_id ?? '');
    setCategoryId(initialData?.category_id ?? defaultCategoryId);
    setNoPeriod(!hasPeriod);
    setMonth(
      initialData
        ? (initialData.month ?? null)
        : (defaultMonth ?? fallback.getMonth() + 1)
    );
    setYear(
      initialData
        ? (initialData.year ?? null)
        : (defaultYear ?? fallback.getFullYear())
    );
    setAmount(initialData ? String(initialData.amount) : '');
    setPaidAmount(initialData ? String(initialData.paid_amount) : '');
    setStatus(initialData?.status ?? 'paid');
    setMethod(initialData?.method ?? 'tunai');
    setPaymentDate(initialData?.payment_date ?? fallback.toISOString().split('T')[0]);
    setReceiptNumber(initialData?.receipt_number ?? '');
    setError('');
  }, [open, initialData, defaultMonth, defaultYear, defaultCategoryId]);

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
    if (!categoryId) {
      setError('Pilih kategori pembayaran terlebih dahulu');
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
      category_id: categoryId,
      month: noPeriod ? null : month,
      year: noPeriod ? null : year,
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
      toast({
        title: isEditing ? 'Pembayaran siswa diperbarui' : 'Pembayaran siswa dicatat',
        variant: 'success',
      });
      // Reset form
      setStudentId('');
      setAmount('');
      setPaidAmount('');
      setStatus('paid');
      setMethod('tunai');
      setReceiptNumber('');
      setNoPeriod(false);
      onClose();
    } catch (err) {
      setError(toUserMessage(err, 'Gagal menyimpan pembayaran'));
    } finally {
      setSubmitting(false);
    }
  };

  const currentYear = now.getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* modal */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-200">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Pembayaran Siswa' : 'Tambah Pembayaran Siswa'}
          </h3>
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

          {/* Kategori */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              required
            >
              <option value="">-- Pilih Kategori --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-400">
              Pembayaran dengan kategori ini langsung tercatat di Kas sekolah.
            </p>
          </div>

          {/* Periode — opsional untuk pembayaran sekali jadi */}
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={noPeriod}
                onChange={(e) => {
                  const next = e.target.checked;
                  setNoPeriod(next);
                  if (next) {
                    setMonth(null);
                    setYear(null);
                  } else {
                    const now2 = new Date();
                    setMonth(defaultMonth ?? now2.getMonth() + 1);
                    setYear(defaultYear ?? now2.getFullYear());
                  }
                }}
                className="rounded border-gray-300 text-primary focus:ring-primary/20"
              />
              Tanpa bulan/tahun (pembayaran sekali jadi)
            </label>
            <p className="mt-0.5 text-xs text-gray-400">
              Untuk seragam, pendaftaran, jemputan, dan sejenisnya.
            </p>
          </div>

          {/* Month / Year row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bulan *</label>
              <select
                value={noPeriod ? '' : month ?? ''}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                disabled={noPeriod}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">-</option>
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
                value={noPeriod ? '' : year ?? ''}
                onChange={(e) => setYear(parseInt(e.target.value))}
                disabled={noPeriod}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">-</option>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isEditing ? 'Total Dibayar (semua cicilan) (Rp)' : 'Dibayar (Rp)'}
              </label>
              <input
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                placeholder="350000"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                min={0}
                disabled={status === 'paid'}
              />
              {isEditing && (
                <p className="mt-1 text-xs text-gray-400">
                  Isi total seluruh cicilan yang sudah diterima. Untuk menerima uang baru,
                  pakai tombol &quot;+ Cicilan&quot; di kartu keuangan siswa.
                </p>
              )}
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
              {submitting ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
