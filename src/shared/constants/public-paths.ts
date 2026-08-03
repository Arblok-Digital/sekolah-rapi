// Route publik yang layak diindeks (crawlable + indexable).
export const INDEXABLE_PUBLIC_PATHS = ['/', '/pricing'];

// Prefiks route marketing: artikel/halaman baru di bawah prefiks ini otomatis
// publik tanpa perlu menambahkan allowlist manual.
export const INDEXABLE_PUBLIC_PREFIXES = [
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
export const PUBLIC_NOINDEX_PATHS = ['/login', '/register', '/register-student'];

export function isIndexablePublic(pathname: string): boolean {
  return (
    INDEXABLE_PUBLIC_PATHS.includes(pathname) ||
    INDEXABLE_PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))
  );
}

export function isPublicPath(pathname: string): boolean {
  return (
    isIndexablePublic(pathname) ||
    PUBLIC_NOINDEX_PATHS.some((p) => pathname === p || pathname.startsWith(p + '?'))
  );
}
