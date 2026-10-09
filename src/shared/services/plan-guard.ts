import { createSupabaseClient } from '@/shared/services/supabase/client';
import { hasFeature, FEATURE_DEFINITIONS, type Feature } from '@/shared/entitlements';

/** Fast client-side feedback only. RLS/RPC remains the security boundary. */
export async function assertSchoolFeature(schoolId: string, feature: Feature): Promise<void> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.from('schools').select('plan').eq('id', schoolId).single();

  let plan = data?.plan;
  if (error) {
    // OFFLINE: baca plan dari mirror lokal (hasil pull + tulis AuthProvider).
    // Data basi tetap dilayani — RLS/RPC di server tetap penjaga akhir.
    try {
      const { db } = await import('@/modules/offline/db');
      plan = (await db.schools.get(schoolId))?.plan;
    } catch {
      plan = undefined;
    }
    if (!plan) throw new Error('Gagal memeriksa paket sekolah.');
  }

  if (!hasFeature(plan, feature)) {
    throw new Error(`Fitur ${FEATURE_DEFINITIONS[feature].label} membutuhkan paket ${FEATURE_DEFINITIONS[feature].minimumPlan === 'basic' ? 'Basic' : 'Pro'}.`);
  }
}