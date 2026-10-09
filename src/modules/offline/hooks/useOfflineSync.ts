import { useCallback, useEffect, useRef, useState } from 'react';
import {
  runSync,
  getPendingSyncCount,
  getFailedSyncCount,
  retryFailedItems,
} from '@/modules/offline/services/sync.service';
import { toUserMessage } from '@/shared/lib/safe-error';
import { emitSynced } from '../sync-events';

export interface SyncStatusState {
  pending: number;
  failed: number;
  lastSync: Date | null;
  isSyncing: boolean;
  error: string | null;
}

/** Interval putaran penuh saat online tanpa antrian (jaring pengaman realtime). */
const IDLE_SYNC_INTERVAL_MS = 5 * 60 * 1000;
/** Interval saat masih ada antrian menunggu push. */
const PENDING_SYNC_INTERVAL_MS = 10 * 1000;

/**
 * Otomasi sinkronisasi dua arah: push → rekonsiliasi kas → pull (runSync).
 *
 * - Berjalan saat: aplikasi dibuka, kembali online, ada antrian pending,
 *   interval saat idle (menangkap realtime yang terlewat), dan tombol manual.
 * - `schoolId` wajib untuk sync penuh; tanpa sekolah hook hanya memantau status.
 */
export function useOfflineSync(schoolId?: string | null) {
  const [status, setStatus] = useState<SyncStatusState>({
    pending: 0,
    failed: 0,
    lastSync: null,
    isSyncing: false,
    error: null,
  });
  const [isOnline, setIsOnline] = useState(
    () => typeof navigator === 'undefined' || navigator.onLine
  );

  // Guard lintas-effect: interval & event bisa beriringan.
  const syncingRef = useRef(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // Pantau jumlah antrian pending & gagal (poll ringan ke Dexie).
  useEffect(() => {
    let cancelled = false;
    const checkStatus = async () => {
      const [pending, failed] = await Promise.all([
        getPendingSyncCount(),
        getFailedSyncCount(),
      ]);
      if (cancelled) return;
      setStatus((prev) =>
        prev.pending === pending && prev.failed === failed
          ? prev
          : { ...prev, pending, failed }
      );
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const runFullSync = useCallback(async () => {
    if (!schoolId || !navigator.onLine || syncingRef.current) return;

    syncingRef.current = true;
    setStatus((prev) => ({ ...prev, isSyncing: true, error: null }));
    try {
      const result = await runSync(schoolId);
      setStatus((prev) => ({
        ...prev,
        lastSync: new Date(),
        isSyncing: false,
        pending: result.pending,
        failed: result.failed,
        error: null,
      }));
      emitSynced();
    } catch (err) {
      setStatus((prev) => ({
        ...prev,
        isSyncing: false,
        error: toUserMessage(err, 'Sinkronisasi gagal'),
      }));
    } finally {
      syncingRef.current = false;
    }
  }, [schoolId]);

  // Saat aplikasi dibuka / sekolah siap / kembali online → satu putaran penuh.
  useEffect(() => {
    if (!isOnline || !schoolId) return;
    runFullSync();
  }, [isOnline, schoolId, runFullSync]);

  // Interval: cepat saat masih ada antrian, lambat saat idle.
  useEffect(() => {
    if (!isOnline || !schoolId) return;
    const ms =
      status.pending > 0 || status.failed > 0
        ? PENDING_SYNC_INTERVAL_MS
        : IDLE_SYNC_INTERVAL_MS;
    const timer = setInterval(runFullSync, ms);
    return () => clearInterval(timer);
  }, [isOnline, schoolId, status.pending, status.failed, runFullSync]);

  /** Tombol manual: selalu boleh (berguna untuk "Tarik data terbaru"). */
  const triggerSync = runFullSync;

  /** Reset item gagal → langsung coba sync penuh lagi. */
  const retryFailed = useCallback(async () => {
    await retryFailedItems();
    await runFullSync();
  }, [runFullSync]);

  return {
    pending: status.pending,
    failed: status.failed,
    lastSync: status.lastSync,
    isSyncing: status.isSyncing,
    syncing: status.isSyncing,
    error: status.error,
    isOnline,
    triggerSync,
    retryFailed,
  };
}
