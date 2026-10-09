import { createSupabaseClient } from '@/shared/services/supabase/client';
import { db } from '@/modules/offline/db';
import { PULL_TABLES, pullSinceIso, nextCursor, type PullTable } from './sync-core';
import { mirrorFull } from './mirror';
import type { RemoteTombstone } from '@/modules/offline/db/sekolah-rapi-db';

/** Ukuran halaman — 1000 baris sekali tarik, aman untuk RAM 500MB Supabase free. */
const PULL_PAGE_SIZE = 1000;
/** Guard: satu pull paling banyak 20 halaman per tabel (20k baris). */
const MAX_PAGES = 20;

export interface PullResult {
  /** Baris data yang diterapkan ke mirror. */
  pulled: number;
  /** Baris yang dihapus dari mirror (tombstone). */
  deleted: number;
}

async function getCursor(table: string, schoolId: string): Promise<string | null> {
  const row = await db.sync_cursors.get(`${table}:${schoolId}`);
  return row?.cursor ?? null;
}

async function setCursor(table: string, schoolId: string, iso: string): Promise<void> {
  await db.sync_cursors.put({
    id: `${table}:${schoolId}`,
    table,
    school_id: schoolId,
    cursor: iso,
  });
}

function dexieTableFor(tableName: string) {
  switch (tableName) {
    case 'students':
      return db.students;
    case 'spp_payments':
      return db.spp_payments;
    case 'transactions':
      return db.transactions;
    case 'categories':
      return db.categories;
    default:
      return null;
  }
}

/**
 * Tarik satu tabel: WHERE school_id = ? AND updated_at > cursor - overlap,
 * ascending, per halaman, upsert ke mirror. Cursor disimpan per tabel —
 * nilai awal = epoch (mirror kosong = tarik semua).
 *
 * Idempoten: baris yang sama boleh diterapkan berkali-kali (upsert by id).
 * Jeda antar-run pakai overlap PULL_OVERLAP_MS supaya baris yang keburu
 * di-commit dekat timestamp cursor tidak terlewat; pulih sendiri di run
 * berikutnya kalau ada baris straddle batas halaman.
 */
async function pullTable(
  supabase: ReturnType<typeof createSupabaseClient>,
  schoolId: string,
  table: PullTable
): Promise<number> {
  let since = pullSinceIso(await getCursor(table, schoolId));
  let total = 0;

  for (let page = 0; page < MAX_PAGES; page++) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('school_id', schoolId)
      .gt('updated_at', since)
      .order('updated_at', { ascending: true })
      .limit(PULL_PAGE_SIZE);
    if (error) throw error;

    const rows = data ?? [];
    if (rows.length > 0) {
      await mirrorFull(table, rows as Array<Record<string, unknown> & { id: string }>);
      const next = nextCursor(rows);
      if (next) {
        await setCursor(table, schoolId, next);
        since = next;
      }
      total += rows.length;
    }
    if (rows.length < PULL_PAGE_SIZE) break;
  }

  return total;
}

/**
 * Tombstone: baris yang dihapus di device lain. Karena aslinya di-hard-delete,
 * satu-satunya jejaknya ada di deleted_rows — tanpa ini, mirror lokal tidak
 * pernah tahu ada yang dihapus.
 */
async function pullTombstones(
  supabase: ReturnType<typeof createSupabaseClient>,
  schoolId: string
): Promise<number> {
  let since = pullSinceIso(await getCursor('deleted_rows', schoolId));
  let total = 0;

  for (let page = 0; page < MAX_PAGES; page++) {
    const { data, error } = await supabase
      .from('deleted_rows')
      .select('table_name, row_id, school_id, deleted_at')
      .eq('school_id', schoolId)
      .gt('deleted_at', since)
      .order('deleted_at', { ascending: true })
      .limit(PULL_PAGE_SIZE);
    if (error) throw error;

    const rows = (data ?? []) as RemoteTombstone[];
    if (rows.length > 0) {
      for (const row of rows) {
        dexieTableFor(row.table_name)?.delete(row.row_id);
      }
      const next = nextCursor(rows.map((r) => ({ updated_at: r.deleted_at })));
      if (next) {
        await setCursor('deleted_rows', schoolId, next);
        since = next;
      }
      total += rows.length;
    }
    if (rows.length < PULL_PAGE_SIZE) break;
  }

  return total;
}

/**
 * Tarik SEMUA perubahan server ke mirror lokal (dipanggil setelah push,
 * saat app dibuka, dan manual dari tombol Sync).
 *
 * - schools: tanpa cursor — cuma 1 baris, selalu tarik (plan/status harus
 *   segar untuk plan-guard offline).
 * - profiles sengaja TIDAK di-pull: jarang berubah, terisi oleh mirror
 *   AuthProvider saat online.
 */
export async function pullChanges(schoolId: string): Promise<PullResult> {
  const supabase = createSupabaseClient();
  let pulled = 0;

  for (const table of PULL_TABLES) {
    pulled += await pullTable(supabase, schoolId, table);
  }

  const { data: school, error: schoolError } = await supabase
    .from('schools')
    .select('*')
    .eq('id', schoolId)
    .maybeSingle();
  if (schoolError) throw schoolError;
  if (school) {
    await db.schools.put(school);
    pulled += 1;
  }

  const deleted = await pullTombstones(supabase, schoolId);
  return { pulled, deleted };
}

/** Hanya schools + tombstone — dipakai bila penuh tarik terlalu berat. */
export async function pullLight(schoolId: string): Promise<PullResult> {
  const supabase = createSupabaseClient();
  const { data: school, error } = await supabase
    .from('schools')
    .select('*')
    .eq('id', schoolId)
    .maybeSingle();
  if (error) throw error;
  if (school) await db.schools.put(school);
  const deleted = await pullTombstones(supabase, schoolId);
  return { pulled: school ? 1 : 0, deleted };
}
