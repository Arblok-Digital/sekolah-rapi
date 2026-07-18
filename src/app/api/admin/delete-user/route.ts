import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function requireDev(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return false;

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return false;

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile?.role === 'dev';
}

// DELETE /api/admin/delete-user?id=xxx
export async function DELETE(request: NextRequest) {
  if (!(await requireDev(request))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('id');

  if (!userId) {
    return NextResponse.json({ error: 'Missing user id' }, { status: 400 });
  }

  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')!;
    const { data: { user: caller } } = await supabaseAdmin.auth.getUser(token);
    if (caller?.id === userId) {
      return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
    }

    await supabaseAdmin.from('profiles').delete().eq('id', userId);

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
