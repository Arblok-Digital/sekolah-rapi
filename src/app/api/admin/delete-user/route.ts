import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { getClientIp, rateLimit } from '@/shared/services/rate-limit';

const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function requireDev(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return false;
  const { data: { user }, error } = await supabaseAuth.auth.getUser(token);
  if (error || !user) return false;
  const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single();
  return profile?.role === 'dev';
}

// DELETE /api/admin/delete-user?id=xxx
export async function DELETE(request: NextRequest) {
  const limit = rateLimit(getClientIp(request), 10, 60_000);
  if (!limit.ok) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan' }, {
      status: 429,
      headers: { 'Retry-After': String(limit.retryAfter) },
    });
  }

  if (!(await requireDev(request))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('id');
  if (!userId) {
    return NextResponse.json({ error: 'Missing user id' }, { status: 400 });
  }

  try {
    // Prevent self-delete
    const token = request.headers.get('authorization')?.replace('Bearer ', '')!;
    const { data: { user: caller } } = await supabaseAuth.auth.getUser(token);
    if (caller?.id === userId) {
      return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
    }

    // Find school owned by this user
    const { data: school } = await supabaseAdmin.from('schools').select('id').eq('owner_id', userId).single();

    if (school) {
      // Delete all school data (children first)
      await supabaseAdmin.from('spp_payments').delete().eq('school_id', school.id);
      await supabaseAdmin.from('transactions').delete().eq('school_id', school.id);
      await supabaseAdmin.from('students').delete().eq('school_id', school.id);
      await supabaseAdmin.from('categories').delete().eq('school_id', school.id);
      await supabaseAdmin.from('enrollment_requests').delete().eq('school_id', school.id);
      await supabaseAdmin.from('inventory_items').delete().eq('school_id', school.id);
      await supabaseAdmin.from('employees').delete().eq('school_id', school.id);
      await supabaseAdmin.from('payroll_records').delete().eq('school_id', school.id);
      await supabaseAdmin.from('schools').delete().eq('id', school.id);
    }

    // Delete profile
    await supabaseAdmin.from('profiles').delete().eq('id', userId);

    // Delete auth user
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Admin delete-user failed', err);
    return NextResponse.json({ error: 'Gagal menghapus pengguna' }, { status: 500 });
  }
}
