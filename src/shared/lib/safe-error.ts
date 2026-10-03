/**
 * Sanitasi pesan error sebelum ditampilkan ke pengguna.
 *
 * Pesan mentah dari Postgres/PostgREST membocorkan struktur internal
 * (nama tabel, kolom, constraint, kebijakan RLS) — lihat temuan audit
 * keamanan 2026-10-03 (H2: oracle skema lewat halaman publik).
 *
 * Aturan: pesan teknis diganti fallback; pesan buatan aplikasi
 * (Bahasa Indonesia) diteruskan apa adanya.
 */

const DEFAULT_FALLBACK = 'Terjadi kesalahan. Silakan coba lagi.';

/** Pola pesan teknis Postgres / PostgREST / Supabase Auth. */
const TECHNICAL_PATTERN = new RegExp(
  [
    'permission denied',
    'row-level security',
    'duplicate key',
    'violates ',
    'constraint',
    'does not exist',
    'already exists',
    'foreign key',
    'not-null',
    'relation ',
    'column ',
    'table ',
    'schema ',
    'function ',
    'syntax error',
    'invalid ',
    'unexpected',
    'cardinality',
    'SQLSTATE',
    'PGRST',
    'JWT',
    'detail:',
    'hint:',
  ].join('|'),
  'i'
);

function extractMessage(err: unknown): string {
  if (err instanceof Error) return err.message || '';
  if (err && typeof err === 'object' && 'message' in err) {
    const msg = (err as { message?: unknown }).message;
    if (typeof msg === 'string') return msg;
  }
  if (typeof err === 'string') return err;
  return '';
}

/**
 * Ambil pesan yang aman ditampilkan ke pengguna.
 *
 * @param err nilai yang dilempar (Error, objek Supabase, string)
 * @param fallback dipakai kalau pesan kosong atau bersifat teknis
 */
export function toUserMessage(err: unknown, fallback: string = DEFAULT_FALLBACK): string {
  const msg = extractMessage(err);
  if (!msg) return fallback;
  if (TECHNICAL_PATTERN.test(msg)) return fallback;
  return msg;
}
