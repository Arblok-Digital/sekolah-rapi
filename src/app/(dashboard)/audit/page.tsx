'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/shared/providers/AuthProvider';
import { assertSchoolFeature } from '@/shared/services/plan-guard';
import { createSupabaseClient } from '@/shared/services/supabase/client';
import { Download, Loader2, TrendingUp, TrendingDown, Scale, History, Receipt, ScrollText } from 'lucide-react';
import type { Transaction } from '@/shared/types';

function formatRp(n: number) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n); }
function formatDate(d: string) { return d ? d.slice(0, 10) : '-'; }
function localIso(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

type Timeframe = 'today' | '7d' | 'month' | 'lastmonth' | 'year' | 'all' | 'custom';

const TIMEFRAME_LABELS: Record<Exclude<Timeframe, 'custom'>, string> = {
  today: 'Hari Ini',
  '7d': '7 Hari',
  month: 'Bulan Ini',
  lastmonth: 'Bulan Lalu',
  year: 'Tahun Ini',
  all: 'Semua',
};

function timeframeRange(tf: Exclude<Timeframe, 'custom'>): { start: string; end: string } {
  const now = new Date();
  switch (tf) {
    case 'today': return { start: localIso(now), end: localIso(now) };
    case '7d': {
      const s = new Date(now);
      s.setDate(s.getDate() - 6);
      return { start: localIso(s), end: localIso(now) };
    }
    case 'month': return { start: localIso(new Date(now.getFullYear(), now.getMonth(), 1)), end: localIso(now) };
    case 'lastmonth': {
      const s = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const e = new Date(now.getFullYear(), now.getMonth(), 0);
      return { start: localIso(s), end: localIso(e) };
    }
    case 'year': return { start: `${now.getFullYear()}-01-01`, end: localIso(now) };
    case 'all': return { start: '', end: '' };
  }
}

interface SourceMeta {
  label: string;
  className: string;
}

function sourceMeta(source?: string | null): SourceMeta {
  switch (source) {
    case 'spp': return { label: 'SPP', className: 'bg-blue-100 text-blue-700' };
    case 'payroll': return { label: 'Gaji', className: 'bg-purple-100 text-purple-700' };
    case 'inventory': return { label: 'Belanja', className: 'bg-amber-100 text-amber-700' };
    case 'reversal': return { label: 'Koreksi', className: 'bg-red-100 text-red-700' };
    default: return { label: 'Manual', className: 'bg-gray-100 text-gray-600' };
  }
}

export default function AuditPage() {
  const { schoolId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [allTx, setAllTx] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Record<string, string>>({});

  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [timeframe, setTimeframe] = useState<Timeframe>('month');
  const [startDate, setStartDate] = useState(() => timeframeRange('month').start);
  const [endDate, setEndDate] = useState(() => timeframeRange('month').end);

  function applyTimeframe(tf: Exclude<Timeframe, 'custom'>) {
    const range = timeframeRange(tf);
    setTimeframe(tf);
    setStartDate(range.start);
    setEndDate(range.end);
  }

  function handleCustomDate(field: 'start' | 'end', value: string) {
    setTimeframe('custom');
    if (field === 'start') setStartDate(value);
    else setEndDate(value);
  }

  useEffect(() => {
    if (!schoolId) return;
    const activeSchoolId = schoolId;
    const supabase = createSupabaseClient();
    setLoading(true);

    async function fetchData() {
      try {
        await assertSchoolFeature(activeSchoolId, 'reports');
      } catch {
        setLoading(false);
        return;
      }

      // Semua transaksi (asc) agar saldo berjalan akurat dari awal
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('school_id', activeSchoolId)
        .order('reference_date', { ascending: true });

      if (txError) throw txError;

      const { data: catData } = await supabase
        .from('categories')
        .select('id, name')
        .eq('school_id', activeSchoolId);

      const catMap: Record<string, string> = {};
      (catData || []).forEach((c: any) => { catMap[c.id] = c.name; });

      setAllTx((txData as Transaction[]) || []);
      setCategories(catMap);
      setError(null);
      setLoading(false);
    }

    fetchData().catch((err) => {
      console.error('[Audit Page] load failed', err);
      setError(err instanceof Error ? err.message : 'Gagal memuat riwayat transaksi');
      setLoading(false);
    });
  }, [schoolId]);

  // Saldo berjalan (dari awal data) + filter tampilan
  const { displayRows, summary } = useMemo(() => {
    let bal = 0;
    const withBalance = allTx.map((tx) => {
      bal += tx.type === 'income' ? tx.amount : -tx.amount;
      return { ...tx, running_balance: bal };
    });

    const filtered = withBalance.filter((tx) => {
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
      if (categoryFilter && tx.category_id !== categoryFilter) return false;
      if (startDate && tx.reference_date.slice(0, 10) < startDate) return false;
      if (endDate && tx.reference_date.slice(0, 10) > endDate) return false;
      return true;
    });

    const income = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    return {
      // Tampil terbaru di atas
      displayRows: [...filtered].reverse(),
      summary: { income, expense, net: income - expense, count: filtered.length },
    };
  }, [allTx, typeFilter, categoryFilter, startDate, endDate]);

  function exportCSV() {
    let csv = 'Tanggal,Tipe,Keterangan,Sumber,Kategori,Masuk,Keluar,Saldo\n';
    displayRows.forEach((tx) => {
      const meta = sourceMeta(tx.source_type);
      csv += [
        formatDate(tx.reference_date),
        tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
        `"${(tx.description || '').replace(/"/g, '""')}"`,
        meta.label,
        `"${(categories[tx.category_id] || '-').replace(/"/g, '""')}"`,
        tx.type === 'income' ? tx.amount : '',
        tx.type === 'expense' ? tx.amount : '',
        tx.running_balance,
      ].join(',') + '\n';
    });
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `riwayat-kas-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Riwayat Kas</h2>
          <p className="text-sm text-white/60 mt-0.5">Jejak audit seluruh arus kas sekolah</p>
        </div>
        <button
          onClick={exportCSV}
          disabled={displayRows.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 border-2 border-white/15 border-t-indigo-600 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-white/60 mt-3">Memuat riwayat transaksi...</p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-emerald-500" /><span className="text-xs text-gray-500">Pemasukan</span></div>
              <p className="text-xl font-bold text-emerald-600">{formatRp(summary.income)}</p>
            </div>
            <div className="bg-white rounded-xl border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-2"><TrendingDown className="w-4 h-4 text-red-500" /><span className="text-xs text-gray-500">Pengeluaran</span></div>
              <p className="text-xl font-bold text-red-600">{formatRp(summary.expense)}</p>
            </div>
            <div className="bg-white rounded-xl border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-2"><Scale className="w-4 h-4 text-indigo-500" /><span className="text-xs text-gray-500">Net</span></div>
              <p className={`text-xl font-bold ${summary.net >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>{formatRp(summary.net)}</p>
            </div>
            <div className="bg-white rounded-xl border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-2"><Receipt className="w-4 h-4 text-gray-500" /><span className="text-xs text-gray-500">Transaksi</span></div>
              <p className="text-xl font-bold text-gray-900">{summary.count}</p>
            </div>
          </div>

          {/* Timeframe panel */}
          <div className="bg-white rounded-xl border border-white/10 p-4">
            <div className="flex items-center gap-1.5 mb-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              <History className="w-3.5 h-3.5" /> Rentang Waktu
            </div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(TIMEFRAME_LABELS) as Array<Exclude<Timeframe, 'custom'>>).map((tf) => (
                <button
                  key={tf}
                  onClick={() => applyTimeframe(tf)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeframe === tf
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {TIMEFRAME_LABELS[tf]}
                </button>
              ))}
              {timeframe === 'custom' && (
                <span className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-indigo-50 text-indigo-600">
                  Custom
                </span>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-white/10 p-4">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-medium ${typeFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}
              >Semua</button>
              <button
                onClick={() => setTypeFilter('income')}
                className={`px-3 py-1.5 rounded-lg font-medium ${typeFilter === 'income' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'}`}
              >Pemasukan</button>
              <button
                onClick={() => setTypeFilter('expense')}
                className={`px-3 py-1.5 rounded-lg font-medium ${typeFilter === 'expense' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}
              >Pengeluaran</button>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="">Semua Kategori</option>
                {Object.entries(categories).sort(([, a], [, b]) => a.localeCompare(b)).map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>

              <label className="flex items-center gap-1.5 text-gray-500">
                Dari
                <input type="date" value={startDate} onChange={(e) => handleCustomDate('start', e.target.value)} className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm" />
              </label>
              <label className="flex items-center gap-1.5 text-gray-500">
                Sampai
                <input type="date" value={endDate} onChange={(e) => handleCustomDate('end', e.target.value)} className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm" />
              </label>
            </div>
          </div>

          {/* Table */}
          {displayRows.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-white/10">
              <History className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Belum ada transaksi pada filter ini.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-white/10">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Tanggal</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Keterangan</th>
                      <th className="text-center px-4 py-3 font-medium text-gray-500">Sumber</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Kategori</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-500">Masuk</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-500">Keluar</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-500">Saldo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {displayRows.map((tx) => {
                      const meta = sourceMeta(tx.source_type);
                      return (
                        <tr key={tx.id} className={`hover:bg-gray-50 ${tx.source_type === 'reversal' ? 'bg-red-50/40' : ''}`}>
                          <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(tx.reference_date)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-gray-900">{tx.description || '-'}</span>
                              {tx.source_type === 'reversal' && <ScrollText className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${meta.className}`}>{meta.label}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{categories[tx.category_id] || '-'}</td>
                          <td className="px-4 py-3 text-right font-medium text-emerald-600">{tx.type === 'income' ? formatRp(tx.amount) : '-'}</td>
                          <td className="px-4 py-3 text-right font-medium text-red-600">{tx.type === 'expense' ? formatRp(tx.amount) : '-'}</td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatRp(tx.running_balance)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
