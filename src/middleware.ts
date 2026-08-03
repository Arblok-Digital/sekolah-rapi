import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Route publik yang layak diindeks (crawlable + indexable).
const indexablePublicPaths = ['/', '/pricing'];

// Prefiks route marketing: artikel/halaman baru di bawah prefiks ini otomatis
// publik tanpa perlu menambahkan allowlist manual.
const indexablePublicPrefixes = [
  '/fitur',
  '/solusi',
  '/panduan',
  '/blog',
  '/tentang',
  '/kontak',
  '/keamanan-data',
  '/kebijakan-privasi',
  '/syarat-ketentuan',
];

// Route publik tetapi TIDAK layak diindeks (auth/account surfaces).
const publicNoindexPaths = ['/login', '/register', '/register-student'];

function isIndexablePublic(pathname: string): boolean {
  return (
    indexablePublicPaths.includes(pathname) ||
    indexablePublicPrefixes.some((p) => pathname.startsWith(p))
  );
}

function isPublicNoindex(pathname: string): boolean {
  return publicNoindexPaths.some((p) => pathname === p || pathname.startsWith(p + '?'));
}

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

  const indexable = isIndexablePublic(pathname);

  // Production: block dev panel entirely
  if (pathname.startsWith('/dev')) {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Set cookies on the request (for downstream handlers)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          // Set cookies on the response (sent to browser)
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do NOT run any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard
  // to debug issues with users being randomly logged out.

  // Refresh session if expired — required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublic = indexable || isPublicNoindex(pathname);

  // Not logged in + not on public page → redirect to login
  if (!user && !isPublic) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  // Logged in + on login/register → redirect to overview
  // Skip if user just signed out (no session cookie present)
  if (user && (pathname === '/login' || pathname === '/register')) {
    // Check if this is a fresh navigation (not a client-side redirect after signOut)
    const overviewUrl = request.nextUrl.clone();
    overviewUrl.pathname = '/overview';
    return NextResponse.redirect(overviewUrl);
  }

  // SEO: semua surface private/app/auth tidak boleh diindeks.
  if (!indexable) {
    supabaseResponse.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  // IMPORTANT: Return supabaseResponse (with updated cookies), not NextResponse.next()
  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons/|manifest.json).*)',
  ],
};
