'use client';

import { useAuth } from '@/shared/providers/AuthProvider';
import { usePathname } from 'next/navigation';
import { DashboardShell } from '@/shared/components/Layout/DashboardShell';
import { EntitlementGate } from '@/shared/components/EntitlementGate';
import { getRouteFeature } from '@/shared/entitlements';
import { SyncStatus } from '@/modules/offline/components/SyncStatus';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, profile, school, loading } = useAuth();
  const pathname = usePathname();

  // AuthProvider handles redirects — just show loading
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-sm text-white/70">Memuat...</p>
        </div>
      </div>
    );
  }

  // AuthProvider will redirect — don't render anything
  if (!session || !profile) return null;

  const schoolName = school?.name ?? 'SekolahRapi';
  const feature = getRouteFeature(pathname);

  return (
    <>
      <DashboardShell
        schoolName={schoolName}
        userName={profile.name}
        userRole={profile.role}
      >
        {feature ? <EntitlementGate feature={feature}>{children}</EntitlementGate> : children}
      </DashboardShell>
      <SyncStatus />
    </>
  );
}
