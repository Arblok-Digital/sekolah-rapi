'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/shared/providers/AuthProvider';
import { createSupabaseClient } from '@/shared/services/supabase/client';
import {
  Wallet,
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

function formatRp(n: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function formatRpShort(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}rb`;
  return formatRp(n);
}

interface DashboardData {
  saldo: number;
  incomeBulanIni: number;
  expenseBulanIni: number;
  totalSiswa: number;
  outstandingSiswa: number;
  collectionRate: number;
  recentTransactions: Array<{
    id: string;
    desc: string;
    amount: number;
    type: 'income' | 'expense';
    date: string;
  }>;
  alerts: Array<{
    id: string;
    severity: 'warning' | 'info' | 'success';
    title: string;
    detail: string;
  }>;
}

export default function OverviewPage() {
  const { schoolId } = useAuth();
  const [showAllTx, setShowAllTx] = useState(false);
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

      // Recent transactions (last 7)
      const recentTransactions = (txData || []).slice(0, 7).map(t => ({
        id: t.id,
        desc: t.description,
        amount: t.amount,
        type: t.type as 'income' | 'expense',
        date: new Date(t.reference_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      }));

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

      setData({ saldo, incomeBulanIni, expenseBulanIni, totalSiswa, outstandingSiswa, collectionRate, recentTransactions, alerts });
      setLoading(false);
    }

    fetchDashboard();

    // Realtime subscriptions
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
  }, [schoolId]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  const displayedTx = showAllTx ? data.recentTransactions : data.recentTransactions.slice(0, 4);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white">Dashboard</h2>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-medium text-emerald-400">LIVE</span>
          </div>
          {liveCount > 0 && (
            <span className="text-[10px] text-white/20">#{liveCount} updates</span>
          )}
        </div>
        <p className="text-sm text-white/30 mt-0.5">Ringkasan keuangan dan operasional sekolah — data real-time</p>
      </div>

      {/* Kas Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-premium p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Saldo Kas</span>
              <button onClick={() => setHideSaldo(!hideSaldo)} className="text-white/30 hover:text-white/60 transition-colors">
                {hideSaldo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {hideSaldo ? '••••••••' : formatRp(data.saldo)}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-white/30">Saldo per hari ini</span>
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-medium border border-emerald-500/10">Aktif</span>
            </div>
          </div>
        </div>

        <div className="card-premium p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Pemasukan</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/10">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400 mb-1">{formatRp(data.incomeBulanIni)}</div>
          <div className="text-xs text-white/30">Bulan ini</div>
        </div>

        <div className="card-premium p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Pengeluaran</span>
            <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/10">
              <TrendingDown className="w-5 h-5 text-red-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-red-400 mb-1">{formatRp(data.expenseBulanIni)}</div>
          <div className="text-xs text-white/30">Bulan ini</div>
        </div>
      </div>

      {/* SPP Health + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card-premium p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Kesehatan SPP</h3>
            <Receipt className="w-5 h-5 text-white/20" />
          </div>

          <div className="mb-4">
            <div className="flex items-end justify-between mb-2">
              <span className="text-xs text-white/40">Tingkat Koleksi</span>
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
              <Users className="w-4 h-4 text-white/30" />
              <span className="text-white/50">{data.totalSiswa} Siswa</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-white/50">{data.outstandingSiswa} Menunggak</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5">
            <a href="/spp" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors">
              Kelola SPP <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="lg:col-span-2 card-premium p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Transaksi Terbaru</h3>
            <a href="/transactions" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors">
              Lihat Semua <ArrowRight className="w-3 h-3" />
            </a>
          </div>

          {displayedTx.length === 0 ? (
            <p className="text-sm text-white/30 py-4 text-center">Belum ada transaksi.</p>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {displayedTx.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
                        tx.type === 'income' ? 'bg-emerald-500/10 border border-emerald-500/10' : 'bg-red-500/10 border border-red-500/10'
                      )}
                    >
                      {tx.type === 'income' ? (
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white/80 truncate">{tx.desc}</p>
                      <p className="text-xs text-white/30">{tx.date}</p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'text-sm font-semibold shrink-0 ml-3 tabular-nums',
                      tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'
                    )}
                  >
                    {tx.type === 'income' ? '+' : '-'}{formatRpShort(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {data.recentTransactions.length > 4 && (
            <button
              onClick={() => setShowAllTx((prev) => !prev)}
              className="mt-3 text-xs text-white/30 hover:text-white/50 transition-colors font-medium"
            >
              {showAllTx ? 'Tampilkan lebih sedikit' : `Tampilkan ${data.recentTransactions.length - 4} transaksi lainnya`}
            </button>
          )}
        </div>
      </div>

      {/* Alerts */}
      <div className="card-premium p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Perhatian</h3>
        {data.alerts.length === 0 ? (
          <p className="text-sm text-white/30 py-2">Tidak ada peringatan.</p>
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
                  <p className="text-xs text-white/30 mt-0.5">{alert.detail}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
