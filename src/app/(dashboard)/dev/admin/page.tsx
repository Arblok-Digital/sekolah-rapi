'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/shared/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/shared/services/supabase/client';
import {
  Shield, Trash2, Database, RefreshCw, CheckCircle, AlertTriangle,
  School, Users, FileText, ChevronDown, ChevronUp, Loader2, Zap
} from 'lucide-react';

interface SchoolData {
  id: string;
  name: string;
  status: string;
  plan: string;
  owner_id: string;
  created_at: string;
  student_count?: number;
  spp_count?: number;
  transaction_count?: number;
}

export default function DevAdminPage() {
  const { isDev, profile } = useAuth();
  const router = useRouter();
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSchool, setExpandedSchool] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Redirect if not dev
  useEffect(() => {
    if (!loading && !isDev) {
      router.replace('/overview');
    }
  }, [isDev, loading, router]);

  const fetchSchools = useCallback(async () => {
    const supabase = createSupabaseClient();

    // Fetch all schools (dev bypasses RLS via is_dev())
    const { data: schoolList, error } = await supabase
      .from('schools')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !schoolList) {
      console.error('Failed to fetch schools:', error);
      setSchools([]);
      return;
    }

    // Get counts for each school
    const schoolsWithCounts = await Promise.all(
      schoolList.map(async (school) => {
        const [students, spp, transactions] = await Promise.all([
          supabase.from('students').select('id', { count: 'exact', head: true }).eq('school_id', school.id),
          supabase.from('spp_payments').select('id', { count: 'exact', head: true }).eq('school_id', school.id),
          supabase.from('transactions').select('id', { count: 'exact', head: true }).eq('school_id', school.id),
        ]);
        return {
          ...school,
          student_count: students.count || 0,
          spp_count: spp.count || 0,
          transaction_count: transactions.count || 0,
        };
      })
    );

    setSchools(schoolsWithCounts);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isDev) fetchSchools();
  }, [isDev, fetchSchools]);

  const handleAction = async (action: string, schoolId: string, label: string) => {
    if (!confirm(`Yakin mau ${label}?`)) return;

    setActionLoading(schoolId + action);
    setMessage(null);

    const supabase = createSupabaseClient();

    try {
      if (action === 'seed') {
        const { error } = await supabase.rpc('dev_seed_test_data', { target_school_id: schoolId });
        if (error) throw error;
        setMessage({ type: 'success', text: `Test data berhasil di-seed untuk ${label}` });
      } else if (action === 'delete') {
        const { error } = await supabase.rpc('dev_delete_school_data', { target_school_id: schoolId });
        if (error) throw error;
        setMessage({ type: 'success', text: `Data ${label} berhasil dihapus (school tetap ada)` });
      } else if (action === 'nuclear') {
        const { error } = await supabase.rpc('dev_nuclear_delete');
        if (error) throw error;
        setMessage({ type: 'success', text: 'SEMUA data berhasil dihapus!' });
      } else if (action === 'activate') {
        const { error } = await supabase.rpc('dev_set_school_status', { target_school_id: schoolId, new_status: 'active' });
        if (error) throw error;
        setMessage({ type: 'success', text: `${label} diaktifkan` });
      } else if (action === 'pending') {
        const { error } = await supabase.rpc('dev_set_school_status', { target_school_id: schoolId, new_status: 'pending' });
        if (error) throw error;
        setMessage({ type: 'success', text: `${label} dipending` });
      }

      await fetchSchools();
    } catch (err: any) {
      setMessage({ type: 'error', text: `Error: ${err.message}` });
    } finally {
      setActionLoading(null);
    }
  };

  if (!isDev) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-white/60">Akses ditolak. Hanya untuk Dev.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Shield className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl font-bold text-white">Dev Admin Panel</h1>
          </div>
          <p className="text-sm text-white/40">
            Logged in as: {profile?.name} ({profile?.role}) • ID: {profile?.id?.slice(0, 8)}...
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchSchools}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg text-sm transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => handleAction('nuclear', '', 'HAPUS SEMUA DATA')}
            className="flex items-center gap-2 px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg text-sm transition-colors"
          >
            <Zap className="w-4 h-4" />
            Nuclear Delete
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-2 ${
          message.type === 'success'
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/5 rounded-xl border border-white/10 p-4">
          <p className="text-sm text-white/40 mb-1">Total Schools</p>
          <p className="text-3xl font-bold text-white">{schools.length}</p>
        </div>
        <div className="bg-white/5 rounded-xl border border-white/10 p-4">
          <p className="text-sm text-white/40 mb-1">Active</p>
          <p className="text-3xl font-bold text-emerald-400">{schools.filter(s => s.status === 'active').length}</p>
        </div>
        <div className="bg-white/5 rounded-xl border border-white/10 p-4">
          <p className="text-sm text-white/40 mb-1">Pending</p>
          <p className="text-3xl font-bold text-amber-400">{schools.filter(s => s.status === 'pending').length}</p>
        </div>
      </div>

      {/* Schools List */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-white/40 animate-spin mx-auto" />
          <p className="text-sm text-white/40 mt-3">Memuat schools...</p>
        </div>
      ) : schools.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
          <School className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/40">Belum ada school. Register dulu lewat /register</p>
        </div>
      ) : (
        <div className="space-y-3">
          {schools.map((school) => (
            <div key={school.id} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              {/* School Header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/[0.03] transition-colors"
                onClick={() => setExpandedSchool(expandedSchool === school.id ? null : school.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    {school.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{school.name}</h3>
                    <p className="text-xs text-white/40">
                      {school.id.slice(0, 8)}... • Plan: {school.plan} • Created: {new Date(school.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-4 text-xs text-white/40">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {school.student_count}</span>
                    <span className="flex items-center gap-1"><Database className="w-3 h-3" /> {school.spp_count}</span>
                    <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {school.transaction_count}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    school.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                    school.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {school.status}
                  </span>
                  {expandedSchool === school.id ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
                </div>
              </div>

              {/* Expanded Actions */}
              {expandedSchool === school.id && (
                <div className="border-t border-white/5 p-4 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {/* Seed test data */}
                    <button
                      onClick={() => handleAction('seed', school.id, school.name)}
                      disabled={actionLoading === school.id + 'seed'}
                      className="flex items-center gap-2 px-3 py-2 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
                    >
                      {actionLoading === school.id + 'seed' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                      Seed Test Data (3 siswa + SPP + transaksi)
                    </button>

                    {/* Delete school data */}
                    <button
                      onClick={() => handleAction('delete', school.id, school.name)}
                      disabled={actionLoading === school.id + 'delete'}
                      className="flex items-center gap-2 px-3 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
                    >
                      {actionLoading === school.id + 'delete' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      Hapus Data (keep school)
                    </button>

                    {/* Toggle status */}
                    {school.status === 'active' ? (
                      <button
                        onClick={() => handleAction('pending', school.id, school.name)}
                        disabled={actionLoading === school.id + 'pending'}
                        className="flex items-center gap-2 px-3 py-2 bg-amber-600/80 hover:bg-amber-600 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        Set Pending
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAction('activate', school.id, school.name)}
                        disabled={actionLoading === school.id + 'activate'}
                        className="flex items-center gap-2 px-3 py-2 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Activate
                      </button>
                    )}
                  </div>

                  <div className="text-xs text-white/30 font-mono">
                    School ID: {school.id}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
