'use client';

import { OnlineStatusProvider } from '@/shared/hooks/OnlineStatusProvider';
import { OfflineIndicator } from '@/modules/offline/components/OfflineIndicator';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <OnlineStatusProvider>
      <div className="min-h-screen bg-gray-50">
        <OfflineIndicator />
        {children}
      </div>
    </OnlineStatusProvider>
  );
}
