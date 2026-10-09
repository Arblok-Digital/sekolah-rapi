'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { SYNCED_EVENT } from '@/modules/offline/sync-events';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  // Setelah sinkronisasi dua arah selesai, tarik ulang semua query aktif
  // supaya halaman berbasis React Query (SPP, kategori, laporan, dsb.) ikut basi.
  useEffect(() => {
    const invalidate = () => queryClient.invalidateQueries();
    window.addEventListener(SYNCED_EVENT, invalidate);
    return () => window.removeEventListener(SYNCED_EVENT, invalidate);
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
