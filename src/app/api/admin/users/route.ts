import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/admin/users
export async function GET() {
  try {
    // List auth users
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) throw authError;

    // List profiles
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, email, role, name, school_id');

    // List schools
    const { data: schools } = await supabaseAdmin
      .from('schools')
      .select('id, name, status, owner_id');

    // Merge: auth users + profiles + schools
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
