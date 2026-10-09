'use client';

import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { RefreshCw, AlertTriangle, Download, Wifi, WifiOff, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useOfflineSync } from '@/modules/offline/hooks/useOfflineSync';
import { useAuth } from '@/shared/providers/AuthProvider';
import { cn } from '@/shared/utils/cn';

/** Di atas umur ini dan masih online → data dianggap perlu ditarik ulang. */
const STALE_AFTER_MS = 10 * 60 * 1000;

/**
 * Status sinkronisasi di header: pill Online/Offline + titik status,
 * klik untuk membuka panel detail (pending/gagal/terakhir sync + tombol Tarik).
 * Menggantikan kartu melayang yang menutupi form transaksi.
 */
export function SyncStatus() {
  const { schoolId } = useAuth();
  const { pending, failed, lastSync, syncing, error, isOnline, triggerSync, retryFailed } =
    useOfflineSync(schoolId);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Tutup panel saat klik di luar atau Escape.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Pindah halaman → panel ikut tertutup.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const stale =
    isOnline && lastSync !== null && Date.now() - lastSync.getTime() > STALE_AFTER_MS;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Status sinkronisasi"
        aria-expanded={open}
        aria-haspopup="true"
        title="Status sinkronisasi"
        className="flex h-9 items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-2.5 transition-colors hover:bg-white/15"
      >
        {isOnline ? (
          <Wifi className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
        ) : (
          <WifiOff className="w-3.5 h-3.5 shrink-0 text-amber-400" />
        )}
        <span className="hidden text-xs font-bold text-white/70 sm:inline">
          {isOnline ? 'Online' : 'Offline'}
        </span>
        {failed > 0 && <span className="h-2 w-2 shrink-0 rounded-full bg-red-400" />}
        {failed === 0 && pending > 0 && (
          <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400" />
        )}
        {failed === 0 && pending === 0 && syncing && (
          <RefreshCw className="h-3 w-3 shrink-0 animate-spin text-white/70" />
        )}
        {failed === 0 && pending === 0 && !syncing && lastSync && (
          <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
        )}
        <ChevronDown
          className={cn(
            'hidden h-3.5 w-3.5 shrink-0 text-white/40 transition-transform sm:inline',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-white/10 bg-[#0d1b17]/97 p-3 shadow-[0_20px_50px_rgba(0,0,0,.5)] backdrop-blur-md">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-black text-white/70">Sinkronisasi</span>
            <button
              type="button"
              onClick={triggerSync}
              disabled={syncing || !isOnline}
              aria-label="Tarik data terbaru"
              className="flex items-center gap-1 rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] font-black text-[#dfe99a] transition-colors hover:bg-white/5 disabled:text-white/30"
            >
              <RefreshCw className={cn('h-3 w-3', syncing && 'animate-spin')} />
              {syncing ? 'Menarik…' : 'Tarik'}
            </button>
          </div>

          {!isOnline && (
            <div className="flex items-center gap-2 text-sm">
              <span className="inline-flex h-2 w-2 rounded-full bg-amber-400" />
              <span className="text-amber-300">Offline — data lokal</span>
            </div>
          )}

          {isOnline && pending > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
              <span className="text-amber-200">{pending} perubahan menunggu</span>
            </div>
          )}

          {failed > 0 && (
            <button
              type="button"
              onClick={retryFailed}
              className="mt-1 flex w-full items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-2 py-1.5 text-left text-sm transition-colors hover:bg-red-500/15"
            >
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-400" />
              <span className="text-red-300">{failed} gagal — coba lagi</span>
            </button>
          )}

          {isOnline && pending === 0 && failed === 0 && syncing && (
            <div className="flex items-center gap-2 text-sm">
              <RefreshCw className="h-3 w-3 animate-spin text-white/60" />
              <span className="text-white/70">Sedang sinkron…</span>
            </div>
          )}

          {isOnline && pending === 0 && failed === 0 && !syncing && lastSync && (
            <div className="flex items-center gap-2 text-sm">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-emerald-300">Tersinkronisasi</span>
            </div>
          )}

          {!lastSync && !syncing && isOnline && pending === 0 && failed === 0 && (
            <div className="flex items-center gap-2 text-sm">
              <span className="inline-block h-2 w-2 rounded-full bg-white/30" />
              <span className="text-white/60">Belum pernah sinkron</span>
            </div>
          )}

          {lastSync && (
            <p className="mt-1 text-xs text-white/50">
              {formatDistanceToNow(lastSync, { addSuffix: true, locale: id })}
            </p>
          )}

          {stale && !syncing && (
            <p className="mt-1 flex items-center gap-1 text-xs text-amber-300/90">
              <Download className="h-3 w-3" /> Data mungkin basi — tarik sekarang
            </p>
          )}

          {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        </div>
      )}
    </div>
  );
}
