import { useEffect, useRef } from 'react';
import { SYNCED_EVENT } from '../sync-events';

/**
 * Menjalankan `refetch` setiap kali sinkronisasi penuh selesai
 * (tarik manual, kembali online, atau interval) sehingga tampilan
 * tidak basi setelah pull memperbarui data lokal.
 *
 * Callback boleh berubah tiap render; listener tetap stabil.
 */
export function useSyncedRefresh(refetch: () => void): void {
  const ref = useRef(refetch);
  ref.current = refetch;

  useEffect(() => {
    const handler = () => ref.current();
    window.addEventListener(SYNCED_EVENT, handler);
    return () => window.removeEventListener(SYNCED_EVENT, handler);
  }, []);
}
