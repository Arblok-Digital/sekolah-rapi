'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/shared/providers/AuthProvider';
import { CLASS_OPTIONS } from '@/shared/constants';
import { Plus, RefreshCw, Search, X, ChevronDown } from 'lucide-react';
import { getStudents } from '@/modules/students/services/student.service';
import { PaymentTable } from '@/modules/spp/components/PaymentTable';
import { PaymentForm } from '@/modules/spp/components/PaymentForm';
import { TunggakanTable } from '@/modules/spp/components/TunggakanTable';
import { StudentFinanceCard } from '@/modules/spp/components/StudentFinanceCard';
import type { SPPFormInput, SPPFilter, SPPPayment, SPPStatus } from '@/modules/spp/types/spp.types';
import { getMonthName } from '@/modules/spp/types/spp.types';
import { useCategories } from '@/modules/transactions/hooks/useCategories';
import {
  useSPPPayments,
  useCreateSPPPayment,
  useSPPSummary,
  useUpdateSPPPayment,
  useDeleteSPPPayment,
  useUnpaidSPP,
  useBulkCreateSPPPayments,
  useBulkMarkPaidSPP,
  useBackfillSPPTransactions,
  useStudentFinance,
} from '@/modules/spp/hooks/useSPP';
import { cn } from '@/shared/utils/cn';
import { toUserMessage } from '@/shared/lib/safe-error';
import { useSchoolRealtime } from '@/shared/hooks/useSchoolRealtime';
import { ReceiptModal, sppReceipt, type ReceiptData } from '@/modules/receipt';

type ViewMode = 'all' | 'tunggakan';

export default function SPPPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<SPPPayment | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterMonth, setFilterMonth] = useState<number | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<SPPStatus | undefined>(undefined);
  const [filterCategory, setFilterCategory] = useState('');
  const [classFilterSPP, setClassFilterSPP] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [tunggakanClass, setTunggakanClass] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkMonth, setBulkMonth] = useState(new Date().getMonth() + 1);
  const [bulkYear, setBulkYear] = useState(new Date().getFullYear());
  const [bulkAmount, setBulkAmount] = useState(350000);
  const [bulkMessage, setBulkMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [studentCard, setStudentCard] = useState<{ id: string; name?: string; nis?: string; class?: string } | null>(null);
  const { schoolId, session, canUse, school, profile } = useAuth();

  const filter: SPPFilter = {
    year: filterYear,
    ...(filterMonth ? { month: filterMonth } : {}),
    ...(filterStatus ? { status: filterStatus } : {}),
    ...(classFilterSPP ? { class: classFilterSPP } : {}),
    ...(filterCategory ? { category: filterCategory } : {}),
  };

  const { data: incomeCategories = [] } = useCategories(schoolId || '', 'income');
  const { data: payments, isLoading, error } = useSPPPayments(schoolId || '', filter);
  const { data: summary } = useSPPSummary(
    schoolId || '',
    filterMonth,
    filterYear,
    filterCategory || undefined
  );
  const { data: unpaid } = useUnpaidSPP(schoolId || '', {
    month: filterMonth,
    year: filterYear,
    category: filterCategory || undefined,
  });
  const createMutation = useCreateSPPPayment(schoolId || '', session?.user?.id || '');
  const { data: cardPayments, isLoading: cardLoading } = useStudentFinance(schoolId || '', studentCard?.id ?? null);
  const bulkCreateMutation = useBulkCreateSPPPayments();
  const bulkPaidMutation = useBulkMarkPaidSPP();
  const backfillMutation = useBackfillSPPTransactions();
  const updateMutation = useUpdateSPPPayment();
  const deleteMutation = useDeleteSPPPayment();

  useSchoolRealtime(schoolId, { tables: ['spp_payments', 'students'], enabled: canUse('realtime_dashboard') });

  // Fetch students for the dropdown — lewat service (fallback mirror saat offline)
  const [studentList, setStudentList] = useState<Array<{ id: string; name: string; nis: string; class: string }>>([]);
  useEffect(() => {
    if (!schoolId || !formOpen) return;
    let cancelled = false;
    getStudents(schoolId, { status: 'active' })
      .then((rows) => { if (!cancelled) setStudentList(rows); })
      .catch((err) => console.error('[spp] gagal memuat daftar siswa:', err));
    return () => { cancelled = true; };
  }, [schoolId, formOpen]);

  const handleCreate = async (input: SPPFormInput) => {
    await createMutation.mutateAsync(input);
    setFormOpen(false);
  };

  const handleBulkCreate = async () => {
    if (!schoolId || !session?.user?.id) return;
    setBulkMessage(null);
    if (!bulkAmount || bulkAmount <= 0) {
      setBulkMessage({ type: 'error', text: 'Nominal SPP harus lebih dari 0.' });
      return;
    }
    try {
      const res = await bulkCreateMutation.mutateAsync({
        schoolId,
        userId: session.user.id,
        params: { month: bulkMonth, year: bulkYear, amount: bulkAmount },
      });
      setBulkOpen(false);
      setBulkMessage({
        type: 'success',
        text: `${res.created} tagihan ${getMonthName(bulkMonth)} ${bulkYear} dibuat untuk ${res.students} siswa (${res.existing} siswa sudah punya tagihan).`,
      });
    } catch (err) {
      setBulkMessage({ type: 'error', text: toUserMessage(err, 'Gagal membuat tagihan. Silakan coba lagi.') });
    }
  };

  const handleUpdate = async (input: SPPFormInput) => {
    if (!editingPayment) return;
    await updateMutation.mutateAsync({ id: editingPayment.id, updates: input });
    setEditingPayment(null);
    setFormOpen(false);
  };

  const handleSyncKas = async () => {
    if (!schoolId || !session?.user?.id) return;
    setSyncMessage(null);
    try {
      const res = await backfillMutation.mutateAsync({ schoolId, userId: session.user.id });
      setSyncMessage({
        type: 'success',
        text: res.created > 0
          ? `${res.created} pembayaran lunas tercatat ke Kas dari ${res.checked} pembayaran. Cek Kas / Riwayat Kas / Overview.`
          : `Semua ${res.checked} pembayaran lunas sudah tercatat di Kas. Tidak ada yang perlu diperbaiki.`,
      });
    } catch (err) {
      setSyncMessage({ type: 'error', text: toUserMessage(err, 'Gagal sinkronisasi ke Kas. Silakan coba lagi.') });
    }
  };

  const handleBulkPaid = async () => {
    if (!schoolId || !session?.user?.id) return;
    const targetMonth = filterMonth ?? new Date().getMonth() + 1;
    const targetYear = filterYear;
    const label = `${getMonthName(targetMonth)} ${targetYear}`;
    if (!window.confirm(`Tandai LUNAS semua tagihan ${label} yang belum bayar/angsuran? Nanti edit manual yang masih nunggak.`)) return;
    setActionMessage(null);
    try {
      const res = await bulkPaidMutation.mutateAsync({ schoolId, userId: session.user.id, month: targetMonth, year: targetYear });
      setActionMessage({ type: 'success', text: `${res.updated} dari ${res.total} tagihan ${label} ditandai lunas + tercatat ke Kas. Edit manual siswa yang masih nunggak.` });
    } catch (err) {
      setActionMessage({ type: 'error', text: toUserMessage(err, 'Gagal melunasi massal. Silakan coba lagi.') });
    }
  };

  const openCreateForm = () => {
    setActionMessage(null);
    setEditingPayment(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingPayment(null);
  };

  const handleEdit = (payment: SPPPayment) => {
    setActionMessage(null);
    setEditingPayment(payment);
    setFormOpen(true);
  };

  const openStudentCard = (payment: SPPPayment) => {
    setStudentCard({
      id: payment.student_id,
      name: payment.student_name,
      nis: payment.student_nis,
      class: payment.student_class,
    });
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Yakin ingin menghapus pembayaran ini? Transaksi Kas terkait akan dikoreksi otomatis.')) return;
    setActionMessage(null);
    setDeletingId(id);
    deleteMutation.mutate(id, {
      onSuccess: () =>
        setActionMessage({ type: 'success', text: 'Pembayaran berhasil dihapus' }),
      onError: (err) =>
        setActionMessage({ type: 'error', text: toUserMessage(err, 'Gagal menghapus pembayaran. Silakan coba lagi.') }),
      onSettled: () => setDeletingId(null),
    });
  };

  const openReceipt = (payment: SPPPayment) => {
    if (payment.status !== 'paid' && payment.status !== 'partial') return;
    const detail = [payment.student_nis ? `NIS: ${payment.student_nis}` : undefined, payment.student_class ? `Kelas: ${payment.student_class}` : undefined].filter(Boolean).join(' • ');
    setReceipt(
      sppReceipt({
        id: payment.id,
        studentName: payment.student_name || 'Siswa',
        studentDetail: detail || undefined,
        categoryName: payment.category_name || 'SPP',
        month: payment.month,
        year: payment.year,
        amount: payment.amount,
        paidAmount: payment.paid_amount,
        status: payment.status,
        date: payment.payment_date || undefined,
        method: payment.method || undefined,
        existingNumber: payment.receipt_number || undefined,
        cashierName: profile?.name,
      })
    );
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - 2 + i);

  // Aksi sekunder — dirender inline di desktop dan di dalam menu "Aksi Lainnya" di mobile
  const secondaryActions = (
    <>
      <button
        onClick={() => { setMoreMenuOpen(false); setFormOpen(false); setBulkOpen((v) => !v); }}
        className="inline-flex w-full items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-white/10 rounded-lg hover:bg-white/20 transition-colors sm:w-auto sm:justify-start"
      >
        <Plus className="w-4 h-4" />
        Buat Tagihan
      </button>
      <button
        onClick={() => { setMoreMenuOpen(false); handleBulkPaid(); }}
        disabled={bulkPaidMutation.isPending || !filterMonth}
        title={filterMonth ? 'Tandai lunas semua yang belum bayar di bulan ini' : 'Pilih bulan dulu'}
        className="inline-flex w-full items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 sm:w-auto sm:justify-start"
      >
        <RefreshCw className={cn('w-4 h-4', bulkPaidMutation.isPending && 'animate-spin')} />
        {bulkPaidMutation.isPending ? 'Melunasi...' : 'Lunasi Semua'}
      </button>
      <button
        onClick={() => { setMoreMenuOpen(false); handleSyncKas(); }}
        disabled={backfillMutation.isPending}
        title="Catatkan semua pembayaran lunas yang belum masuk Kas"
        className="inline-flex w-full items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-white/10 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 sm:w-auto sm:justify-start"
      >
        <RefreshCw className={cn('w-4 h-4', backfillMutation.isPending && 'animate-spin')} />
        {backfillMutation.isPending ? 'Menyinkron...' : 'Sinkronkan ke Kas'}
      </button>
    </>
  );

  const tunggakanPayments = unpaid || [];
  const tunggakanStudentCount = new Set(tunggakanPayments.map((p) => p.student_id)).size;
  const tunggakanClassList: string[] = [];
  tunggakanPayments.forEach((p) => {
    if (p.student_class && !tunggakanClassList.includes(p.student_class)) {
      tunggakanClassList.push(p.student_class);
    }
  });
  tunggakanClassList.sort();
  const tunggakanFiltered = tunggakanClass
    ? tunggakanPayments.filter((p) => p.student_class === tunggakanClass)
    : tunggakanPayments;

  const q = searchQuery.trim().toLowerCase();
  const matchesSearch = (p: SPPPayment) =>
    !q ||
    (p.student_name || '').toLowerCase().includes(q) ||
    (p.student_nis || '').toLowerCase().includes(q) ||
    (p.student_class || '').toLowerCase().includes(q) ||
    (p.category_name || '').toLowerCase().includes(q);
  const filteredPayments = (payments || []).filter(matchesSearch);
  const tunggakanSearchFiltered = tunggakanFiltered.filter(matchesSearch);

  if (!schoolId) {
    return (
      <div className="text-center py-12">
        <p className="text-white/70">Memuat data sekolah...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Keuangan Siswa</h2>
          <p className="text-sm text-white/60 mt-0.5">
            Tagihan &amp; pembayaran siswa per kategori — otomatis tercatat di Kas sekolah. Klik nama / baris siswa untuk kartu keuangan (lunas, angsuran, belum bayar).
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
          <button
            onClick={() => { setBulkOpen(false); openCreateForm(); }}
            className="inline-flex w-full items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors sm:w-auto sm:justify-start"
          >
            <Plus className="w-4 h-4" />
            Catat Pembayaran
          </button>

          {/* Desktop: aksi sekunder tetap inline seperti sebelumnya */}
          <div className="hidden sm:flex sm:items-center sm:gap-2">{secondaryActions}</div>

          {/* Mobile: aksi sekunder masuk ke menu "Aksi Lainnya" */}
          <div className="relative sm:hidden">
            <button
              onClick={() => setMoreMenuOpen((v) => !v)}
              aria-expanded={moreMenuOpen}
              className="inline-flex w-full items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              Aksi Lainnya
              <ChevronDown className={cn('w-4 h-4 transition-transform', moreMenuOpen && 'rotate-180')} />
            </button>
            {moreMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMoreMenuOpen(false)}
                  aria-hidden
                />
                <div className="absolute left-0 right-0 top-full z-20 mt-2 space-y-2 rounded-xl border border-white/10 bg-[#173f35] p-2 shadow-2xl">
                  {secondaryActions}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Sync feedback */}
      {syncMessage && (
        <div
          className={cn(
            'p-3 rounded-xl text-sm border',
            syncMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-red-50 border-red-200 text-red-700'
          )}
        >
          {syncMessage.text}
        </div>
      )}

      {/* Bulk billing card */}
      {bulkOpen && (
        <div className="bg-white rounded-xl border border-white/10 p-5">
          <p className="text-sm font-semibold text-gray-900 mb-1">
            Buat Tagihan SPP Sekaligus (Semua Siswa Aktif)
          </p>
          <p className="text-xs text-gray-500 mb-4">
            Tagihan dibuat berstatus Belum Bayar untuk setiap siswa kelas 7-9. Siswa yang sudah punya tagihan di bulan ini akan dilewati.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <select
              value={bulkMonth}
              onChange={(e) => setBulkMonth(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{getMonthName(i + 1)}</option>
              ))}
            </select>
            <select
              value={bulkYear}
              onChange={(e) => setBulkYear(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <input
              type="number"
              value={bulkAmount || ''}
              onChange={(e) => setBulkAmount(Number(e.target.value))}
              placeholder="Nominal SPP"
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          {bulkMessage && (
            <div
              className={cn(
                'mt-3 p-3 rounded-lg text-sm border',
                bulkMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-red-50 border-red-200 text-red-700'
              )}
            >
              {bulkMessage.text}
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => { setBulkOpen(false); setBulkMessage(null); }}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              onClick={handleBulkCreate}
              disabled={bulkCreateMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {bulkCreateMutation.isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Membuat tagihan...
                </>
              ) : (
                'Buat Tagihan'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-white/10 p-3 sm:p-4">
            <p className="text-xs text-gray-400 mb-1 sm:text-gray-500">Total Siswa Aktif</p>
            <p className="text-lg font-bold text-gray-900 sm:text-2xl">{summary.total_siswa}</p>
          </div>
          <div className="bg-white rounded-xl border border-white/10 p-3 sm:p-4">
            <p className="text-xs text-gray-400 mb-1 sm:text-gray-500">Terkumpul</p>
            <p className="text-lg font-bold text-emerald-600 sm:text-2xl">
              Rp {summary.terkumpul.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-white/10 p-3 sm:p-4">
            <p className="text-xs text-gray-400 mb-1 sm:text-gray-500">Belum Bayar</p>
            <p className="text-lg font-bold text-red-600 sm:text-2xl">{summary.outstanding}</p>
          </div>
          <div className="bg-white rounded-xl border border-white/10 p-3 sm:p-4">
            <p className="text-xs text-gray-400 mb-1 sm:text-gray-500">Collection Rate</p>
            <p className="text-lg font-bold text-indigo-600 sm:text-2xl">{summary.collection_rate}%</p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama siswa, NIS, atau kelas..."
          className="w-full pl-9 pr-9 py-2.5 bg-white/10 border border-white/15 rounded-xl text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-white/40 hover:text-white"
            aria-label="Hapus pencarian"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {q && (
        <p className="text-xs text-white/60">
          {viewMode === 'all'
            ? `${filteredPayments.length} dari ${payments?.length || 0} pembayaran`
            : `${tunggakanSearchFiltered.length} dari ${tunggakanFiltered.length} tunggakan`}
          {` • kata kunci: "${searchQuery}"`}
        </p>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 overflow-x-auto whitespace-nowrap pb-1 scrollbar-hide sm:pb-0">
        <div className="inline-flex shrink-0 p-1 bg-white/10 rounded-xl">
          {(['all', 'tunggakan'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                viewMode === mode ? 'bg-white text-gray-900 shadow-sm' : 'text-white/70 hover:text-white'
              )}
            >
              {mode === 'all' ? 'Semua Pembayaran' : (
                <>
                  Tunggakan Siswa
                  {tunggakanStudentCount > 0 && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                      {tunggakanStudentCount}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'all' ? (
        <>
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide sm:gap-3">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 shrink-0 border border-white/15 rounded-lg text-sm"
            >
              <option value="">Semua Kategori</option>
              {incomeCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select
              value={filterStatus || ''}
              onChange={(e) => setFilterStatus((e.target.value || undefined) as SPPStatus | undefined)}
              className="px-3 py-2 shrink-0 border border-white/15 rounded-lg text-sm"
            >
              <option value="">Semua Status</option>
              <option value="unpaid">Belum Bayar</option>
              <option value="partial">Angsuran</option>
              <option value="paid">Lunas</option>
            </select>
            <select
              value={classFilterSPP}
              onChange={(e) => setClassFilterSPP(e.target.value)}
              className="px-3 py-2 shrink-0 border border-white/15 rounded-lg text-sm"
            >
              <option value="">Semua Kelas</option>
              {CLASS_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={filterMonth || ''}
              onChange={(e) => setFilterMonth(e.target.value ? Number(e.target.value) : undefined)}
              className="px-3 py-2 shrink-0 border border-white/15 rounded-lg text-sm"
            >
              <option value="">Semua Bulan</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString('id-ID', { month: 'long' })}
                </option>
              ))}
            </select>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(Number(e.target.value))}
              className="px-3 py-2 shrink-0 border border-white/15 rounded-lg text-sm"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide sm:gap-3">
          <select
            value={tunggakanClass}
            onChange={(e) => setTunggakanClass(e.target.value)}
            className="px-3 py-2 shrink-0 border border-white/15 rounded-lg text-sm"
          >
            <option value="">Semua Kelas</option>
            {tunggakanClassList.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          Error: {error.message}
        </div>
      )}

      {/* Inline action feedback */}
      {(actionMessage || deletingId) && (
        <div
          className={cn(
            'p-3 rounded-lg text-sm border',
            deletingId
              ? 'bg-gray-50 border-gray-200 text-gray-600'
              : actionMessage?.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-red-50 border-red-200 text-red-700'
          )}
        >
          {deletingId ? 'Menghapus pembayaran...' : actionMessage?.text}
        </div>
      )}

      {/* Table */}
      {viewMode === 'all' ? (
        isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-white/15 border-t-indigo-600 rounded-full animate-spin mx-auto" />
            <p className="text-sm text-white/60 mt-3">Memuat data keuangan siswa...</p>
          </div>
        ) : (
          <PaymentTable
            payments={filteredPayments}
            onDelete={handleDelete}
            onReceipt={openReceipt}
            onStudentClick={openStudentCard}
          />
        )
      ) : (
        <TunggakanTable
          payments={tunggakanSearchFiltered}
          loading={!unpaid}
          onStudentClick={openStudentCard}
        />
      )}

      {/* Create/Edit Form Modal */}
      <PaymentForm
        open={formOpen}
        onClose={closeForm}
        onSubmit={editingPayment ? handleUpdate : handleCreate}
        students={studentList}
        categories={incomeCategories}
        initialData={editingPayment}
      />

      {/* Kartu Keuangan Siswa — klik nama siswa di tabel */}
      <StudentFinanceCard
        student={studentCard}
        payments={cardPayments}
        loading={cardLoading}
        schoolId={schoolId || ''}
        userId={session?.user?.id || ''}
        onClose={() => setStudentCard(null)}
        onEdit={(p) => {
          setStudentCard(null);
          handleEdit(p);
        }}
      />

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
