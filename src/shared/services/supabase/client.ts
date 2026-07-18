/**
 * Browser-side Supabase client using @supabase/ssr.
 *
 * Stores session in BOTH localStorage (for client) AND cookies (for server/middleware).
 * This fixes the production auth loop where middleware couldn't read localStorage.
 *
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 */
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export const createSupabaseClient = (): SupabaseClient => {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return client;
};
