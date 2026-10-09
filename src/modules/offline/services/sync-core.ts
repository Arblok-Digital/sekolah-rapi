/**
 * Logika murni sinkronisasi — tanpa Dexie/tanpa Supabase supaya bisa diuji
 * unit test (vitest environment = node, tidak punya indexedDB).
 */

/** Tabel yang di-pull dari server ke mirror lokal. */
export const PULL_TABLES = [
  'students',
  'spp_payments',
  'transactions',
  'categories',
] as const;
export type PullTable = (typeof PULL_TABLES)[number];

/** Tombstone yang dibaca dari tabel deleted_rows server. */
export const TOMBSTONE_TABLES = [
  'students',
  'spp_payments',
  'transactions',
  'categories',
] as const;

const ENTITY_TABLE_MAP: Record<string, string> = {
  transaction: 'transactions',
  student: 'students',
  spp_payment: 'spp_payments',
  category: 'categories',
};

/** Entity di sync_queue → nama tabel Postgres. Tanpa map = entity sudah nama tabel. */
export function mapEntityToTable(entity: string): string {
  return ENTITY_TABLE_MAP[entity] ?? entity;
}

/**
 * Pull memakai jendela OVERLAP ini ke belakang dari cursor terakhir.
 * Alasan: beberapa baris bisa saja punya updated_at "terlalu dekat" dengan
 * saat kita menyimpan cursor (jam server vs jam push). Karena upsert mirror
 * idempoten, re-fetch sedikit tidak merusak apa pun — yang bahaya justru
 * kelewatan.
 */
export const PULL_OVERLAP_MS = 10_000;

/** ISO string aman untuk perbandingan leksikografis (selalu UTC + Z). */
export function normalizeIso(value: string | Date | null | undefined): string | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

/**
 * Batas bawah query pull: cursor dikurangi overlap. Cursor kosong/tidak
 * valid = epoch (pull penuh dari awal — aman karena idempoten).
 */
export function pullSinceIso(cursor: string | null | undefined): string {
  const iso = normalizeIso(cursor);
  if (!iso) return new Date(0).toISOString();
  const since = new Date(new Date(iso).getTime() - PULL_OVERLAP_MS);
  return since.toISOString();
}

/**
 * Cursor baru setelah menerima satu halaman pull: timestamp terbesar dari
 * baris yang diterima (bukan `now()` — baris yang belum sempat ter-commit
 * tidak boleh terlewat). Null kalau tidak ada baris (cursor lama dipakai).
 */
export function nextCursor(
  rows: Array<{ updated_at?: string | null }>
): string | null {
  let max: string | null = null;
  for (const row of rows) {
    const iso = normalizeIso(row.updated_at);
    if (!iso) continue;
    // ISO normal selalu format sama → perbandingan string = perbandingan waktu.
    if (!max || iso > max) max = iso;
  }
  return max;
}

/** Jam lokal perangkat dipakai untuk updated_at baris yang ditulis offline. */
export function localNowIso(): string {
  return new Date().toISOString();
}
