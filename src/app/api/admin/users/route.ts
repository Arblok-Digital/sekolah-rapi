import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

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

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile?.role === 'dev';
}

// GET /api/admin/users
export async function GET(request: NextRequest) {
  if (!(await requireDev(request))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) throw authError;

    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, email, role, name, school_id');

    const { data: schools } = await supabaseAdmin
      .from('schools')
      .select('id, name, status, owner_id');

    const users = authUsers.users.map((u) => {
      const profile = profiles?.find((p) => p.id === u.id);
      const school = schools?.find((s) => s.owner_id === u.id);
      return {
        id: u.id,
        email: u.email,
        name: profile?.name || '-',
        role: profile?.role || 'no_profile',
        school: school?.name || '-',
        school_status: school?.status || '-',
        created_at: u.created_at,
      };
    });

    return NextResponse.json({ users });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
