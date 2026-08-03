'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { createSupabaseClient } from '@/shared/services/supabase/client';
import { TrendingUp, TrendingDown, ArrowRight, Loader2, History } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import type { Transaction } from '@/shared/types';
import {
  Timeframe,
  TIMEFRAME_LABELS,
  timeframeRange,
  inTimeframe,
} from '../utils/timeframe';

function formatRpShort(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}rb`;
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

function sourceBadge(source?: string | null) {
  switch (source) {
    case 'spp': return { label: 'SPP', className: 'bg-blue-500/15 text-blue-300' };
    case 'payroll': return { label: 'Gaji', className: 'bg-purple-500/15 text-purple-300' };
    case 'inventory': return { label: 'Belanja', className: 'bg-amber-500/15 text-amber-300' };
    case 'reversal': return { label: 'Koreksi', className: 'bg-red-500/15 text-red-300' };
    default: return { label: 'Manual', className: 'bg-white/10 text-white/60' };
  }
}

interface TransactionHistoryProps {
  schoolId: string;
  limit?: number;
  showAllHref?: string;
}

export function TransactionHistory({ schoolId, limit = 10, showAllHref = '/audit' }: TransactionHistoryProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>('month');
  const [allTx, setAllTx] = useState<Transaction[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const supabase = createSupabaseClient();

    async function load() {
      try {
        const { data, error: txError } = await supabase
          .from('transactions')
          .select('id, description, amount, type, reference_date, source_type')
          .eq('school_id', schoolId)
          .order('reference_date', { ascending: false });
        if (txError) throw txError;
        if (!cancelled) setAllTx((data as Transaction[]) || []);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Gagal memuat transaksi');
      }
    }
    load();
    return () => { cancelled = true; };
  }, [schoolId]);

  const range = timeframe === 'custom' ? { start: '', end: '' } : timeframeRange(timeframe as Exclude<Timeframe, 'custom'>);

  const visible = useMemo(() => {
    if (!allTx) return [];
    return allTx
      .filter((tx) => inTimeframe(tx.reference_date, timeframe, range.start, range.end))
      .slice(0, limit);
  }, [allTx, timeframe, range.start, range.end, limit]);

  const summary = useMemo(() => {
    const income = visible.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = visible.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expense };
  }, [visible]);

  return (
    <div className="card-premium border-white/10 bg-white/[.07] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black text-white">Riwayat Transaksi</h3>
        <Link href={showAllHref} className="flex items-center gap-1 text-xs font-black text-[#dfe99a] transition-colors hover:text-white">
          Lihat Semua <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Timeframe panel */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {(Object.keys(TIMEFRAME_LABELS) as Array<Exclude<Timeframe, 'custom'>>).map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={cn(
              'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
              timeframe === tf
                ? 'bg-[#dfe99a]/20 text-[#eaf2b8] border border-[#dfe99a]/25'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-transparent'
            )}
          >
            {TIMEFRAME_LABELS[tf]}
          </button>
        ))}
      </div>

      {/* Mini summary */}
      <div className="flex items-center gap-4 mb-4 text-xs">
        <span className="flex items-center gap-1.5 text-emerald-300">
          <TrendingUp className="w-3.5 h-3.5" /> Masuk {formatRpShort(summary.income)}
        </span>
        <span className="flex items-center gap-1.5 text-red-300">
          <TrendingDown className="w-3.5 h-3.5" /> Keluar {formatRpShort(summary.expense)}
        </span>
      </div>

      {error && <p className="text-xs text-red-300 py-2">{error}</p>}

      {!allTx ? (
        <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 border-2 border-white/15 border-t-indigo-400 rounded-full animate-spin" /></div>
      ) : visible.length === 0 ? (
        <div className="py-6 text-center">
          <History className="w-8 h-8 text-white/30 mx-auto mb-2" />
          <p className="text-xs text-white/50">Belum ada transaksi pada periode ini.</p>
        </div>
      ) : (
        <div className="divide-y divide-white/[0.04]">
          {visible.map((tx) => {
            const badge = sourceBadge(tx.source_type);
            return (
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
                    <p className="text-sm font-medium text-white/80 truncate">{tx.description || '-'}</p>
                    <p className="text-xs text-white/60 mt-0.5">
                      {new Date(tx.reference_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      <span className={cn('inline-flex ml-2 px-1.5 py-0.5 rounded-md text-[10px] font-bold', badge.className)}>{badge.label}</span>
                    </p>
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
            );
          })}
        </div>
      )}
    </div>
  );
}
