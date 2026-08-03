'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/shared/providers/AuthProvider';
import { createSupabaseClient } from '@/shared/services/supabase/client';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Receipt,
  Users,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { TransactionHistory } from '@/modules/transactions/components/TransactionHistory';

function formatRp(n: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

interface DashboardData {
  saldo: number;
  incomeBulanIni: number;
  expenseBulanIni: number;
  totalSiswa: number;
  outstandingSiswa: number;
  collectionRate: number;
  alerts: Array<{
    id: string;
    severity: 'warning' | 'info' | 'success';
    title: string;
    detail: string;
  }>;
}

export default function OverviewPage() {
  const { schoolId, canUse, isDev } = useAuth();
  const [hideSaldo, setHideSaldo] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [liveCount, setLiveCount] = useState(0);

  useEffect(() => {
    if (!schoolId) return;
    const supabase = createSupabaseClient();

    async function fetchDashboard() {
      setLoading(true);

      // 1. Fetch transactions for current month
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

      const { data: txData } = await supabase
        .from('transactions')
        .select('id, description, amount, type, reference_date')
        .eq('school_id', schoolId!)
        .gte('reference_date', monthStart)
        .lte('reference_date', monthEnd)
        .order('reference_date', { ascending: false });

      // 2. Fetch all transactions for balance
      const { data: allTx } = await supabase
        .from('transactions')
        .select('amount, type')
        .eq('school_id', schoolId!);

      // 3. Fetch student count + SPP outstanding
      const { data: students } = await supabase
        .from('students')
        .select('id, status')
        .eq('school_id', schoolId!);

      const { data: sppThisMonth } = await supabase
        .from('spp_payments')
        .select('student_id, status')
        .eq('school_id', schoolId!)
        .eq('year', now.getFullYear())
        .eq('month', now.getMonth() + 1);

      // Calculate
      const totalIncome = allTx?.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0) || 0;
      const totalExpense = allTx?.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0) || 0;
      const saldo = totalIncome - totalExpense;

      const incomeBulanIni = txData?.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0) || 0;
      const expenseBulanIni = txData?.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0) || 0;

      const totalSiswa = students?.filter(s => s.status === 'active').length || 0;
      const paidCount = sppThisMonth?.filter(s => s.status === 'paid' || s.status === 'partial').length || 0;
      const outstandingSiswa = totalSiswa - paidCount;
      const collectionRate = totalSiswa > 0 ? Math.round((paidCount / totalSiswa) * 100) : 0;

      // Recent transactions (last 7) — now handled by TransactionHistory component

      // Alerts
      const alerts: DashboardData['alerts'] = [];
      if (outstandingSiswa > 0) {
        alerts.push({ id: '1', severity: 'warning', title: `${outstandingSiswa} siswa menunggak SPP`, detail: `Bulan ${now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}` });
      }
      if (collectionRate >= 90) {
        alerts.push({ id: '2', severity: 'success', title: 'Koleksi SPP Excellent', detail: `${collectionRate}% tepat waktu` });
      } else if (collectionRate >= 70) {
        alerts.push({ id: '2', severity: 'info', title: 'Koleksi SPP cukup', detail: `${collectionRate}% tepat waktu` });
      } else if (totalSiswa > 0) {
        alerts.push({ id: '2', severity: 'warning', title: 'Koleksi SPP rendah', detail: `Hanya ${collectionRate}% tepat waktu` });
      }
      if (totalSiswa === 0) {
        alerts.push({ id: '3', severity: 'info', title: 'Belum ada siswa', detail: 'Gunakan Dev Panel untuk seed data test' });
      }

      setData({ saldo, incomeBulanIni, expenseBulanIni, totalSiswa, outstandingSiswa, collectionRate, alerts });
      setLoading(false);
    }

    fetchDashboard();

    if (!isDev && !canUse('realtime_dashboard')) return;

    // Realtime is a Pro entitlement; lower plans still load an on-demand snapshot.
    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `school_id=eq.${schoolId}` }, () => {
        setLiveCount(c => c + 1);
        fetchDashboard();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students', filter: `school_id=eq.${schoolId}` }, () => {
        setLiveCount(c => c + 1);
        fetchDashboard();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'spp_payments', filter: `school_id=eq.${schoolId}` }, () => {
        setLiveCount(c => c + 1);
        fetchDashboard();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'enrollment_requests', filter: `school_id=eq.${schoolId}` }, () => {
        setLiveCount(c => c + 1);
        fetchDashboard();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [schoolId, canUse, isDev]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 border-2 border-white/15 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-black tracking-tight text-white">Ringkasan sekolah</h2>
          {(isDev || canUse('realtime_dashboard')) && (
            <div className="flex items-center gap-1.5 rounded-full border border-[#b8d44b]/20 bg-[#b8d44b]/10 px-2 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-black text-[#dfe99a]">LIVE</span>
            </div>
          )}
          {liveCount > 0 && (
            <span className="text-[10px] text-white/70">#{liveCount} updates</span>
          )}
        </div>
        <p className="mt-1 text-sm text-white/60">
          Ringkasan keuangan dan operasional sekolah{isDev || canUse('realtime_dashboard') ? ', diperbarui secara real-time.' : '.'}
        </p>
      </div>

      {/* Kas Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-premium relative overflow-hidden border-white/10 bg-[#173f35] p-5 shadow-[0_20px_50px_rgba(0,0,0,.18)]">
          <div className="absolute right-0 top-0 h-32 w-32 -translate-y-1/2 translate-x-1/2 rounded-full bg-gradient-to-bl from-[#b8d44b]/20 to-transparent" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-[#dfe99a]">Saldo Kas</span>
              <button onClick={() => setHideSaldo(!hideSaldo)} className="text-white/70 hover:text-white/70 transition-colors">
                {hideSaldo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="mb-1 text-2xl font-black text-white">
              {hideSaldo ? '••••••••' : formatRp(data.saldo)}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-white/60">Saldo per hari ini</span>
              <span className="rounded-md border border-[#b8d44b]/20 bg-[#b8d44b]/10 px-1.5 py-0.5 text-[10px] font-black text-[#dfe99a]">Aktif</span>
            </div>
          </div>
        </div>

        <div className="card-premium border-white/10 bg-white/[.07] p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-white/60">Pemasukan</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-400/15 bg-emerald-400/10">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="mb-1 text-2xl font-black text-emerald-300">{formatRp(data.incomeBulanIni)}</div>
          <div className="text-xs text-white/50">Bulan ini</div>
        </div>

        <div className="card-premium border-white/10 bg-white/[.07] p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-white/60">Pengeluaran</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-400/15 bg-red-400/10">
              <TrendingDown className="w-5 h-5 text-red-400" />
            </div>
          </div>
          <div className="mb-1 text-2xl font-black text-red-300">{formatRp(data.expenseBulanIni)}</div>
          <div className="text-xs text-white/50">Bulan ini</div>
        </div>
      </div>

      {/* SPP Health + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card-premium border-white/10 bg-white/[.07] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-white">Kesehatan SPP</h3>
            <Receipt className="w-5 h-5 text-white/70" />
          </div>

          <div className="mb-4">
            <div className="flex items-end justify-between mb-2">
              <span className="text-xs text-white/70">Tingkat Koleksi</span>
              <span className="text-sm font-bold text-white">{data.collectionRate}%</span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  data.collectionRate >= 90
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                    : data.collectionRate >= 70
                    ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                    : 'bg-gradient-to-r from-red-500 to-red-400'
                )}
                style={{ width: `${data.collectionRate}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-white/70" />
              <span className="text-white/70">{data.totalSiswa} Siswa</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-white/70">{data.outstandingSiswa} Menunggak</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5">
            <a href="/spp" className="flex items-center gap-1 text-xs font-black text-[#dfe99a] transition-colors hover:text-white">
              Kelola SPP <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="lg:col-span-2">
          <TransactionHistory schoolId={schoolId!} limit={8} />
        </div>
      </div>

      {/* Alerts */}
      <div className="card-premium border-white/10 bg-white/[.07] p-5">
        <h3 className="mb-3 text-sm font-black text-white">Perhatian</h3>
        {data.alerts.length === 0 ? (
          <p className="text-sm text-white/70 py-2">Tidak ada peringatan.</p>
        ) : (
          <div className="space-y-2">
            {data.alerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-xl border',
                  alert.severity === 'warning' && 'border-amber-500/10 bg-amber-500/[0.04]',
                  alert.severity === 'info' && 'border-blue-500/10 bg-blue-500/[0.04]',
                  alert.severity === 'success' && 'border-emerald-500/10 bg-emerald-500/[0.04]'
                )}
              >
                {alert.severity === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
                {alert.severity === 'info' && <Clock className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />}
                {alert.severity === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
                <div>
                  <p className="text-sm font-medium text-white/80">{alert.title}</p>
                  <p className="text-xs text-white/70 mt-0.5">{alert.detail}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
