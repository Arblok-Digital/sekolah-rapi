import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

/**
 * Keepalive cron — mencegah project Supabase free tier di-pause karena
 * tidak ada aktivitas API selama 7 hari.
 *
 * Dipanggil oleh Vercel Cron (vercel.json) setiap hari, atau bisa juga
 * dari GitHub Actions / UptimeRobot. Endpoint ini menjalankan satu query
 * ringan ke Supabase agar tercatat sebagai aktivitas API.
 */
export async function GET(request: Request) {
  // Guard: bila CRON_SECRET di-set, WAJIB Authorization: Bearer <secret>
  // (Vercel otomatis mengirimkannya untuk request cron).
  // Tanpa secret, jatuh ke header x-vercel-cron — tetap dipertahankan agar
  // cron lama tidak mati, tapi sebaiknya CRON_SECRET segera diisi di env.
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get('authorization');
  const isVercelCron = request.headers.get('x-vercel-cron') === '1';
  const authorized = secret ? auth === `Bearer ${secret}` : isVercelCron;
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: 'Missing Supabase env' }, { status: 500 });
  }

  const supabase = createClient(url, key);
  // Query ringan; RLS akan mengembalikan 0 baris untuk anon, tapi request-nya
  // tetap tercatat sebagai aktivitas API di Supabase.
  const { count, error } = await supabase
    .from('schools')
    .select('id', { count: 'exact', head: true })
    .limit(1);

  if (error) {
    console.error('Keepalive query failed', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true, count: count ?? 0 });
}
