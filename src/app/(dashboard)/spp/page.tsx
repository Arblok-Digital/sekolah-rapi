'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/shared/providers/AuthProvider';
import { createSupabaseClient } from '@/shared/services/supabase/client';
import { Plus, Filter, Download } from 'lucide-react';
import { PaymentTable } from '@/modules/spp/components/PaymentTable';
import { PaymentForm } from '@/modules/spp/components/PaymentForm';
import type { SPPFormInput, SPPFilter } from '@/modules/spp/types/spp.types';
import { useSPPPayments, useCreateSPPPayment, useSPPSummary } from '@/modules/spp/hooks/useSPP';
import { cn } from '@/shared/utils/cn';

export default function SPPPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterMonth, setFilterMonth] = useState<number | undefined>(undefined);
  const { schoolId, session } = useAuth();

  const filter: SPPFilter = {
    year: filterYear,
    ...(filterMonth ? { month: filterMonth } : {}),
  };

  const { data: payments, isLoading, error } = useSPPPayments(schoolId || '', filter);
  const { data: summary } = useSPPSummary(schoolId || '', filterMonth, filterYear);
  const createMutation = useCreateSPPPayment(schoolId || '', session?.user?.id || '');

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

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  if (!schoolId) {
    return (
      <div className="text-center py-12">
        <p className="text-white/60">Memuat data sekolah...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Pembayaran SPP</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Kelola pembayaran SPP siswa per bulan
          </p>
        </div>
        <button
          onClick={() => setFormOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Catat Pembayaran
        </button>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Total Siswa Aktif</p>
            <p className="text-2xl font-bold text-gray-900">{summary.total_siswa}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Terkumpul</p>
            <p className="text-2xl font-bold text-emerald-600">
              Rp {summary.terkumpul.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Belum Bayar</p>
            <p className="text-2xl font-bold text-red-600">{summary.outstanding}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Collection Rate</p>
            <p className="text-2xl font-bold text-indigo-600">{summary.collection_rate}%</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <select
          value={filterMonth || ''}
          onChange={(e) => setFilterMonth(e.target.value ? Number(e.target.value) : undefined)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          Error: {error.message}
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500 mt-3">Memuat data SPP...</p>
        </div>
      ) : (
        <PaymentTable payments={payments || []} />
      )}

      {/* Create Form Modal */}
      <PaymentForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
        students={studentList}
      />
    </div>
  );
}
