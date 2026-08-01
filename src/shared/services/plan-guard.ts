import { createSupabaseClient } from '@/shared/services/supabase/client';
import { hasFeature, FEATURE_DEFINITIONS, type Feature } from '@/shared/entitlements';

/** Fast client-side feedback only. RLS/RPC remains the security boundary. */
export async function assertSchoolFeature(schoolId: string, feature: Feature): Promise<void> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.from('schools').select('plan').eq('id', schoolId).single();
  if (error) throw new Error('Gagal memeriksa paket sekolah.');
  if (!hasFeature(data?.plan, feature)) {
    throw new Error(`Fitur ${FEATURE_DEFINITIONS[feature].label} membutuhkan paket ${FEATURE_DEFINITIONS[feature].minimumPlan === 'basic' ? 'Basic' : 'Pro'}.`);
  }
}