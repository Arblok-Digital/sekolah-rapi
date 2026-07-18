import { useEffect, useState } from 'react';
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

  const triggerSync = async () => {
    if (status.pending === 0 || status.isSyncing) return;
    if (!navigator.onLine) return;

    setStatus(prev => ({ ...prev, isSyncing: true, error: null }));
    try {
      const result = await syncToSupabase();
      const now = new Date();
      setStatus(prev => ({ ...prev, lastSync: now, isSyncing: false, pending: result.pending, error: null }));
    } catch (err) {
      setStatus(prev => ({ ...prev, isSyncing: false, error: err instanceof Error ? err.message : 'Sync failed' }));
    }
  };

  useEffect(() => {
    if (status.pending === 0 || status.isSyncing) return;
    if (!navigator.onLine) return;

    triggerSync();
    const interval = setInterval(triggerSync, 10000);
    return () => clearInterval(interval);
  }, [status.pending, status.isSyncing]);

  return {
    pending: status.pending,
    lastSync: status.lastSync,
    isSyncing: status.isSyncing,
    syncing: status.isSyncing,
    error: status.error,
    triggerSync,
  };
}
