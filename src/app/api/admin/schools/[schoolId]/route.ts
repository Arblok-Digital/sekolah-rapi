import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { PLAN_DEFINITIONS, type Plan } from '@/shared/entitlements';

const ALLOWED_STATUSES = ['pending', 'active', 'rejected'] as const;
type ManagedSchoolStatus = (typeof ALLOWED_STATUSES)[number];

function isPlan(value: unknown): value is Plan {
  return typeof value === 'string' && value in PLAN_DEFINITIONS;
}

function isManagedStatus(value: unknown): value is ManagedSchoolStatus {
  return typeof value === 'string' && ALLOWED_STATUSES.includes(value as ManagedSchoolStatus);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { schoolId: string } }
) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return NextResponse.json({ error: 'Server admin belum dikonfigurasi' }, { status: 500 });
  }

  // Clients are request-scoped so authenticated state cannot leak between requests.
  const supabaseAuth = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profileError) {
    console.error('Admin school update: failed to load caller profile', profileError);
    return NextResponse.json({ error: 'Gagal memverifikasi akun admin' }, { status: 500 });
  }
  if (profile?.role !== 'dev') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON tidak valid' }, { status: 400 });
  }

  const payload = body as { plan?: unknown; status?: unknown };
  const updates: { plan?: Plan; status?: ManagedSchoolStatus } = {};

  if (payload.plan !== undefined) {
    if (!isPlan(payload.plan)) {
      return NextResponse.json({ error: 'Plan tidak valid' }, { status: 400 });
    }
    updates.plan = payload.plan;
  }

  if (payload.status !== undefined) {
    if (!isManagedStatus(payload.status)) {
      return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 });
    }
    updates.status = payload.status;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Plan atau status wajib diisi' }, { status: 400 });
  }

  const { data: school, error: updateError } = await supabaseAuth.rpc('dev_update_school_access', {
    target_school_id: params.schoolId,
    next_status: updates.status ?? null,
    next_plan: updates.plan ?? null,
  }).maybeSingle();

  if (updateError) {
    if (updateError.code === '42501' || updateError.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Admin school update failed', updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  if (!school) {
    return NextResponse.json({ error: 'Sekolah tidak ditemukan' }, { status: 404 });
  }

  return NextResponse.json({ school }, {
    headers: { 'Cache-Control': 'private, no-store' },
  });
}