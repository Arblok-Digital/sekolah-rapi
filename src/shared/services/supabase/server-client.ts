/**
 * Server-side Supabase client.
 *
 * Currently re-exports the browser client because the project
 * uses client-side auth via AuthProvider (localStorage session).
 *
 * @supabase/auth-helpers-nextjs v0.8.7 has type conflicts with
 * @supabase/supabase-js v2.110.2 — so server auth stays client-side.
 * Middleware.ts handles server-side auth guard separately.
 *
 * If migrating later, install @supabase/ssr package:
 * https://supabase.com/docs/guides/auth/server-side/nextjs
 */
export { createSupabaseClient } from '@/shared/services/supabase/client';
