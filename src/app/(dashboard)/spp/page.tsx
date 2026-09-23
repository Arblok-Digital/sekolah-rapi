'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/shared/providers/AuthProvider';
import { CLASS_OPTIONS } from '@/shared/constants';
import { createSupabaseClient } from '@/shared/services/supabase/client';
import { Plus, RefreshCw } from 'lucide-react';
import { PaymentTable } from '@/modules/spp/components/PaymentTable';
import { PaymentForm } from '@/modules/spp/components/PaymentForm';
import { TunggakanTable } from '@/modules/spp/components/TunggakanTable';
import type { SPPFormInput, SPPFilter, SPPPayment, SPPStatus } from '@/modules/spp/types/spp.types';
import { getMonthName } from '@/modules/spp/types/spp.types';
import {
  useSPPPayments,
  useCreateSPPPayment,
  useSPPSummary,
  useUpdateSPPPayment,
  useDeleteSPPPayment,
  useUnpaidSPP,
  useBulkCreateSPPPayments,
  useBackfillSPPTransactions,
} from '@/modules/spp/hooks/useSPP';
import { cn } from '@/shared/utils/cn';
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
  const [classFilterSPP, setClassFilterSPP] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [tunggakanClass, setTunggakanClass] = useState('');
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkMonth, setBulkMonth] = useState(new Date().getMonth() + 1);
  const [bulkYear, setBulkYear] = useState(new Date().getFullYear());
  const [bulkAmount, setBulkAmount] = useState(350000);
  const [bulkMessage, setBulkMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const { schoolId, session, canUse, school, profile } = useAuth();

  const filter: SPPFilter = {
    year: filterYear,
    ...(filterMonth ? { month: filterMonth } : {}),
    ...(filterStatus ? { status: filterStatus } : {}),
    ...(classFilterSPP ? { class: classFilterSPP } : {}),
  };

  const { data: payments, isLoading, error } = useSPPPayments(schoolId || '', filter);
  const { data: summary } = useSPPSummary(schoolId || '', filterMonth, filterYear);
  const { data: unpaid } = useUnpaidSPP(schoolId || '', { month: filterMonth, year: filterYear });
  const createMutation = useCreateSPPPayment(schoolId || '', session?.user?.id || '');
  const bulkCreateMutation = useBulkCreateSPPPayments();
  const backfillMutation = useBackfillSPPTransactions();
  const updateMutation = useUpdateSPPPayment();
  const deleteMutation = useDeleteSPPPayment();

  useSchoolRealtime(schoolId, { tables: ['spp_payments', 'students'], enabled: canUse('realtime_dashboard') });

  // Fetch students for the dropdown
  const [studentList, setStudentList] = useState<Array<{ id: string; name: string; nis: string; class: string }>>([]);
  useEffect(() => {
    if (!schoolId || !formOpen) return;
    const supabase = createSupabaseClient();
    supabase.from('students').select('id, name, nis, class').eq('school_id', schoolId).eq('status', 'active').order('name')
      .then(({ data }) => { if (data) setStudentList(data); });
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
      setBulkMessage({ type: 'error', text: `Gagal membuat tagihan: ${(err as Error).message}` });
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
      setSyncMessage({ type: 'error', text: `Gagal sinkronisasi ke Kas: ${(err as Error).message}` });
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

  const handleDelete = (id: string) => {
    if (!window.confirm('Yakin ingin menghapus pembayaran SPP ini?')) return;
    setActionMessage(null);
    setDeletingId(id);
    deleteMutation.mutate(id, {
      onSuccess: () =>
        setActionMessage({ type: 'success', text: 'Pembayaran SPP berhasil dihapus' }),
      onError: (err) =>
        setActionMessage({ type: 'error', text: `Gagal menghapus pembayaran: ${err.message}` }),
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
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

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
          <h2 className="text-xl font-bold text-white">Pembayaran SPP</h2>
          <p className="text-sm text-white/60 mt-0.5">
            Kelola pembayaran SPP siswa per bulan
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setBulkOpen(false); openCreateForm(); }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Catat Pembayaran
          </button>
          <button
            onClick={() => { setFormOpen(false); setBulkOpen((v) => !v); }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Buat Tagihan
          </button>
          <button
            onClick={handleSyncKas}
            disabled={backfillMutation.isPending}
            title="Catatkan semua pembayaran lunas yang belum masuk Kas"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-white/10 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn('w-4 h-4', backfillMutation.isPending && 'animate-spin')} />
            {backfillMutation.isPending ? 'Menyinkron...' : 'Sinkronkan ke Kas'}
          </button>
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
          <div className="bg-white rounded-xl border border-white/10 p-4">
            <p className="text-xs text-gray-500 mb-1">Total Siswa Aktif</p>
            <p className="text-2xl font-bold text-gray-900">{summary.total_siswa}</p>
          </div>
          <div className="bg-white rounded-xl border border-white/10 p-4">
            <p className="text-xs text-gray-500 mb-1">Terkumpul</p>
            <p className="text-2xl font-bold text-emerald-600">
              Rp {summary.terkumpul.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-white/10 p-4">
            <p className="text-xs text-gray-500 mb-1">Belum Bayar</p>
            <p className="text-2xl font-bold text-red-600">{summary.outstanding}</p>
          </div>
          <div className="bg-white rounded-xl border border-white/10 p-4">
            <p className="text-xs text-gray-500 mb-1">Collection Rate</p>
            <p className="text-2xl font-bold text-indigo-600">{summary.collection_rate}%</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="inline-flex p-1 bg-white/10 rounded-xl">
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
          <div className="flex items-center gap-3">
            <select
              value={filterStatus || ''}
              onChange={(e) => setFilterStatus((e.target.value || undefined) as SPPStatus | undefined)}
              className="px-3 py-2 border border-white/15 rounded-lg text-sm"
            >
              <option value="">Semua Status</option>
              <option value="unpaid">Belum Bayar</option>
              <option value="partial">Angsuran</option>
              <option value="paid">Lunas</option>
            </select>
            <select
              value={classFilterSPP}
              onChange={(e) => setClassFilterSPP(e.target.value)}
              className="px-3 py-2 border border-white/15 rounded-lg text-sm"
            >
              <option value="">Semua Kelas</option>
              {CLASS_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={filterMonth || ''}
              onChange={(e) => setFilterMonth(e.target.value ? Number(e.target.value) : undefined)}
              className="px-3 py-2 border border-white/15 rounded-lg text-sm"
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
              className="px-3 py-2 border border-white/15 rounded-lg text-sm"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-3">
          <select
            value={tunggakanClass}
            onChange={(e) => setTunggakanClass(e.target.value)}
            className="px-3 py-2 border border-white/15 rounded-lg text-sm"
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
          {deletingId ? 'Menghapus pembayaran SPP...' : actionMessage?.text}
        </div>
      )}

      {/* Table */}
      {viewMode === 'all' ? (
        isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-white/15 border-t-indigo-600 rounded-full animate-spin mx-auto" />
            <p className="text-sm text-white/60 mt-3">Memuat data SPP...</p>
          </div>
        ) : (
          <PaymentTable
            payments={payments || []}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onReceipt={openReceipt}
          />
        )
      ) : (
        <TunggakanTable payments={tunggakanFiltered} loading={!unpaid} />
      )}

      {/* Create/Edit Form Modal */}
      <PaymentForm
        open={formOpen}
        onClose={closeForm}
        onSubmit={editingPayment ? handleUpdate : handleCreate}
        students={studentList}
        initialData={editingPayment}
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
