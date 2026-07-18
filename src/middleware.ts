import { NextResponse, type NextRequest } from 'next/server';

// Public paths — no auth required
const publicPaths = ['/', '/login', '/register', '/register-student'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pass through: static files, internal Next.js routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // In dev mode, let client-side AuthProvider handle auth.
  // Supabase JS v2 stores session in localStorage, NOT cookies.
  // Middleware (Edge Runtime) can't read localStorage.
  // Only do server-side redirect if we detect an actual sb- cookie.
  // Dev mode: skip cookie check (session in localStorage, not cookies).
  // NODE_ENV is auto-controlled by Next.js (dev=development, prod=production).
  // Vercel always forces NODE_ENV=production, so this can't leak to prod.
  if (process.env.NODE_ENV !== 'production') {
    return NextResponse.next();
  }

  // PRODUCTION: check for Supabase auth cookie
  // If using @supabase/ssr later, cookie name will be sb-<project-ref>-auth-token
  const hasSession = request.cookies.getAll().some(
    (c) => c.name.startsWith('sb-') && c.value.length > 0
  );

  const isPublicPath = publicPaths.some(
    (p) => pathname === p || pathname.startsWith(p + '?')
  );

  // Not logged in + not on public page → redirect to login
  if (!hasSession && !isPublicPath) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  // Logged in + on login/register → redirect to overview
  if (hasSession && (pathname === '/login' || pathname === '/register')) {
    const overviewUrl = request.nextUrl.clone();
    overviewUrl.pathname = '/overview';
    return NextResponse.redirect(overviewUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons/|manifest.json).*)',
  ],
};
