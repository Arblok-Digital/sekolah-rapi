'use client';

import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { useOfflineSync } from '@/modules/offline/hooks/useOfflineSync';

export function SyncStatus() {
  const { pending, lastSync, syncing, error, triggerSync } = useOfflineSync();

  if (pending === 0 && !lastSync) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border p-3 min-w-[200px]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-600">Sinkronisasi</span>
          <button
            onClick={triggerSync}
            disabled={syncing}
            className="text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400"
          >
            {syncing ? 'Sync...' : 'Sync now'}
          </button>
        </div>

        {pending > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <span className="inline-block w-2 h-2 rounded-full bg-yellow-400" />
            <span className="text-yellow-700">
              {pending} item pending
            </span>
          </div>
        )}

        {pending === 0 && lastSync && (
          <div className="flex items-center gap-2 text-sm">
            <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
            <span className="text-green-700">
              Tersinkronisasi
            </span>
          </div>
        )}

        {lastSync && (
          <p className="text-xs text-gray-400 mt-1">
            {formatDistanceToNow(lastSync, { addSuffix: true, locale: id })}
          </p>
        )}

        {error && (
          <p className="text-xs text-red-500 mt-1">{error}</p>
        )}
      </div>
    </div>
  );
}
