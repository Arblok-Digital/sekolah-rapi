import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function requireDev(request: NextRequest) {
  let supabaseResponse = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { allowed: false, response: supabaseResponse };

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return { allowed: profile?.role === 'dev', response: supabaseResponse };
}

// GET /api/admin/users
export async function GET(request: NextRequest) {
  const { allowed, response } = await requireDev(request);
  if (!allowed) {
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
