import { useCallback, useEffect, useState } from 'react';
import { db } from '@/modules/offline/db';
import { syncToSupabase, getPendingSyncCount } from '@/modules/offline/services/sync.service';

export interface SyncStatusState {
  pending: number;
  lastSync: Date | null;
  isSyncing: boolean;
  error: string | null;
}

export function useOfflineSync() {
  const [status, setStatus] = useState<SyncStatusState>({ pending: 0, lastSync: null, isSyncing: false, error: null });
  const [isOnline, setIsOnline] = useState(() => typeof navigator === 'undefined' || navigator.onLine);

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

  useEffect(() => {
    let cancelled = false;
    const checkStatus = async () => {
      const pending = await getPendingSyncCount();
      if (cancelled) return;
      setStatus(prev => ({ ...prev, pending }));
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  const triggerSync = useCallback(async () => {
    if (status.pending === 0 || status.isSyncing) return;
    if (!isOnline) return;

    setStatus(prev => ({ ...prev, isSyncing: true, error: null }));
    try {
      const result = await syncToSupabase();
      const now = new Date();
      setStatus(prev => ({ ...prev, lastSync: now, isSyncing: false, pending: result.pending, error: null }));
    } catch (err) {
      setStatus(prev => ({ ...prev, isSyncing: false, error: err instanceof Error ? err.message : 'Sync failed' }));
    }
  }, [status.pending, status.isSyncing, isOnline]);

  useEffect(() => {
    if (status.pending === 0 || status.isSyncing || !isOnline) return;

    triggerSync();
    const interval = setInterval(triggerSync, 10000);
    return () => clearInterval(interval);
  }, [triggerSync, status.pending, status.isSyncing, isOnline]);

  return {
    pending: status.pending,
    lastSync: status.lastSync,
    isSyncing: status.isSyncing,
    syncing: status.isSyncing,
    error: status.error,
    triggerSync,
  };
}
