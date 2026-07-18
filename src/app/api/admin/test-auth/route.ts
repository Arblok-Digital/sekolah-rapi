import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '') || '';

  // Test 1: is token present?
  if (!token) {
    return NextResponse.json({ step: 'token', error: 'No token in header', allHeaders: Object.fromEntries(request.headers.entries()) });
  }

  // Test 2: can we get user from token?
  const { data, error } = await supabaseAuth.auth.getUser(token);

  if (error || !data.user) {
    return NextResponse.json({ step: 'getUser', error: error?.message || 'No user', tokenLength: token.length, tokenStart: token.substring(0, 20) });
  }

  // Test 3: check role
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', data.user.id).single();

  return NextResponse.json({ step: 'ok', userId: data.user.id, email: data.user.email, role: profile?.role });
}
