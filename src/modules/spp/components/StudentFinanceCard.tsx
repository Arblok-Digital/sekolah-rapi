'use client';

import { useState, useEffect } from 'react';
import { X, Pencil, Plus } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { useToast } from '@/shared/components/ui/toast';
import { toUserMessage } from '@/shared/lib/safe-error';
import { useCategories, useCreateCategory } from '@/modules/transactions/hooks/useCategories';
import { useCreateSPPPayment } from '../hooks/useSPP';
import type { SPPFormInput, SPPPayment, SPPStatus } from '../types/spp.types';
import { formatPeriodLabel, formatRupiah, getMonthName } from '../types/spp.types';

interface StudentFinanceCardProps {
  student: { id: string; name?: string; nis?: string; class?: string } | null;
  payments?: SPPPayment[];
  loading?: boolean;
  schoolId?: string;
  userId?: string;
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

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none disabled:bg-gray-50 disabled:text-gray-400';

export function StudentFinanceCard({
  student,
  payments,
  loading,
  schoolId = '',
  userId = '',
  onClose,
  onEdit,
}: StudentFinanceCardProps) {
  const { toast } = useToast();
  const { data: categories = [] } = useCategories(schoolId, 'income');
  const createCategory = useCreateCategory(schoolId);
  const createPayment = useCreateSPPPayment(schoolId, userId);

  const [formOpen, setFormOpen] = useState(false);
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [status, setStatus] = useState<SPPStatus>('paid');
  const [amount, setAmount] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [noPeriod, setNoPeriod] = useState(true);
  const [month, setMonth] = useState<number | null>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number | null>(new Date().getFullYear());
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (status === 'paid' && amount) setPaidAmount(amount);
  }, [status, amount]);

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

  const openForm = () => {
    setCategoryId(categories.find((c) => c.name === 'SPP')?.id ?? categories[0]?.id ?? '');
    setFormError('');
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setFormError('');
    setAmount('');
    setPaidAmount('');
    setStatus('paid');
    setIsNewCategory(false);
    setNewCategoryName('');
    setNoPeriod(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const nominal = parseInt(amount || '0');
    if (isNewCategory) {
      if (!newCategoryName.trim()) {
        setFormError('Nama kategori baru wajib diisi');
        return;
      }
    } else if (!categoryId) {
      setFormError('Pilih kategori terlebih dahulu');
      return;
    }
    if (!(nominal > 0)) {
      setFormError('Nominal wajib diisi');
      return;
    }

    const paid =
      status === 'paid' ? nominal : status === 'unpaid' ? 0 : parseInt(paidAmount || '0');
    if (status === 'partial' && !(paid > 0)) {
      setFormError('Jumlah dibayar wajib diisi untuk angsuran');
      return;
    }
    if (paid > nominal) {
      setFormError('Jumlah dibayar tidak boleh melebihi tagihan');
      return;
    }

    setSubmitting(true);
    try {
      let catId = categoryId;
      if (isNewCategory) {
        const created = await createCategory.mutateAsync({
          name: newCategoryName.trim(),
          type: 'income',
        });
        catId = created.id;
      }

      const input: SPPFormInput = {
        student_id: student.id,
        category_id: catId,
        month: noPeriod ? null : month,
        year: noPeriod ? null : year,
        amount: nominal,
        paid_amount: paid,
        status,
        payment_date: paymentDate,
      };
      await createPayment.mutateAsync(input);
      toast({ title: 'Entri keuangan siswa dicatat', variant: 'success' });
      closeForm();
    } catch (err) {
      setFormError(toUserMessage(err, 'Gagal menyimpan entri'));
    } finally {
      setSubmitting(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - 2 + i);

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
          {/* Aksi: tambah entri manual */}
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Tagihan &amp; Pembayaran
            </h4>
            {!formOpen ? (
              <button
                type="button"
                onClick={openForm}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Entri
              </button>
            ) : (
              <button
                type="button"
                onClick={closeForm}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Tutup
              </button>
            )}
          </div>

          {/* Form entri manual */}
          {formOpen && (
            <form onSubmit={handleSubmit} className="rounded-lg border border-indigo-100 bg-indigo-50/40 px-3.5 py-3.5 space-y-3">
              {formError && (
                <div className="p-2.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
                  {formError}
                </div>
              )}

              {/* Kategori */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Kategori *</label>
                {isNewCategory ? (
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nama kategori baru (mis. Jemputan)"
                    className={inputClass}
                    autoFocus
                  />
                ) : (
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className={inputClass}
                    required
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsNewCategory((v) => !v);
                    setFormError('');
                  }}
                  className="mt-1 text-[11px] text-indigo-600 hover:underline underline-offset-2"
                >
                  {isNewCategory ? 'Pilih dari kategori yang sudah ada' : '+ Kategori baru (berlaku untuk semua siswa)'}
                </button>
              </div>

              {/* Periode */}
              <div>
                <label className="flex items-center gap-2 text-xs text-gray-600">
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
                        const d = new Date();
                        setMonth(d.getMonth() + 1);
                        setYear(d.getFullYear());
                      }
                    }}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500/20"
                  />
                  Tanpa bulan/tahun (sekali jadi)
                </label>
                {!noPeriod && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <select
                      value={month || ''}
                      onChange={(e) => setMonth(parseInt(e.target.value))}
                      className={inputClass}
                    >
                      <option value="">-</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m}>
                          {getMonthName(m)}
                        </option>
                      ))}
                    </select>
                    <select
                      value={year || ''}
                      onChange={(e) => setYear(parseInt(e.target.value))}
                      className={inputClass}
                    >
                      <option value="">-</option>
                      {years.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Nominal + Dibayar */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tagihan (Rp) *</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      if (status === 'paid') setPaidAmount(e.target.value);
                    }}
                    placeholder="1000000"
                    className={inputClass}
                    min={0}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Dibayar (Rp)</label>
                  <input
                    type="number"
                    value={status === 'paid' ? amount : paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    placeholder="1000000"
                    className={inputClass}
                    min={0}
                    disabled={status === 'paid' || status === 'unpaid'}
                  />
                </div>
              </div>

              {/* Status + Tanggal */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as SPPStatus)}
                    className={inputClass}
                  >
                    <option value="paid">Lunas</option>
                    <option value="partial">Angsuran</option>
                    <option value="unpaid">Belum Bayar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className={inputClass}
                    disabled={status === 'unpaid'}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-3 py-2 text-xs font-medium text-gray-600 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-3 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Entri'}
                </button>
              </div>
            </form>
          )}

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
                Catat entri pertama lewat tombol &quot;Tambah Entri&quot;.
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
