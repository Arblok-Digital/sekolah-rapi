'use client';

import Link from 'next/link';
import { ArrowUpRight, LockKeyhole } from 'lucide-react';
import { useAuth } from '@/shared/providers/AuthProvider';
import { FEATURE_DEFINITIONS, type Feature } from '@/shared/entitlements';

export function EntitlementGate({ feature, children }: { feature: Feature; children: React.ReactNode }) {
  const { canUse, loading } = useAuth();
  if (loading || canUse(feature)) return <>{children}</>;

  const definition = FEATURE_DEFINITIONS[feature];
  return (
    <div className="flex min-h-[420px] items-center justify-center p-6">
      <div className="max-w-md text-center">
        <LockKeyhole className="mx-auto mb-4 h-10 w-10 text-[#dfe99a]" />
        <h2 className="text-xl font-bold text-white">Fitur {definition.label} terkunci</h2>
        <p className="mt-2 text-sm text-white/60">Fitur ini tersedia mulai paket {definition.minimumPlan === 'basic' ? 'Basic' : 'Pro'}.</p>
        <Link href="/pricing" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#b8d44b] px-4 py-2.5 text-sm font-bold text-[#173f35]">
          Lihat paket <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}