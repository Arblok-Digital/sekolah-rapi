'use client';

import { createSupabaseClient } from '@/shared/services/supabase/client';
import { db } from '@/modules/offline/db';
import { mapEntityToTable } from './sync-core';
import { pullChanges, type PullResult } from './pull.service';
import { reconcilePaymentKas } from '@/modules/spp/services/spp.service';
import type { SyncQueueItem } from '@/shared/types';

const MAX_RETRIES = 5;

/** localStorage: daftar pembayaran SPP yang kas-nya belum terekonsiliasi. */
const RECONCILE_KEY = 'sekolah_rapi_kas_reconcile';

interface ReconcileEntry {
  id: string;
  at: string;
}

function readReconcileQueue(): ReconcileEntry[] {
  try {
    const raw = window.localStorage.getItem(RECONCILE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeReconcileQueue(entries: ReconcileEntry[]): void {
  try {
    if (entries.length === 0) window.localStorage.removeItem(RECONCILE_KEY);
    else window.localStorage.setItem(RECONCILE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage penuh/nonaktif — rekonsiliasi kehilangan antrian cadangan;
    // tombol "Sinkronkan ke Kas" manual tetap jadi jaring pengaman.
  }
}

function queueReconcile(paymentId: string): void {
  const entries = readReconcileQueue();
  if (entries.some((e) => e.id === paymentId)) return;
  entries.push({ id: paymentId, at: new Date().toISOString() });
  writeReconcileQueue(entries);
}

/**
 * Proses satu item sync_queue terhadap Supabase.
 * Returns 'synced' on success, 'failed' for permanent error, 'pending' to retry later.
 *
 * Semua aksi dibuat IDEMPOTEN: retry setelah "sukses tapi gagal menandai"
 * tidak boleh menggandakan data.
 */
async function processSyncItem(item: SyncQueueItem): Promise<'synced' | 'failed' | 'pending'> {
  const table = mapEntityToTable(item.entity);
  const supabase = createSupabaseClient();

  try {
    if (item.action === 'INSERT') {
      // upsert on conflict id — INSERT yang diulang tidak pernah dobel.
      const { error } = await supabase
        .from(table)
        .upsert(item.payload, { onConflict: 'id' });
      if (error) throw error;
      if (item.entity === 'spp_payment') queueReconcile(item.entity_id);
    } else if (item.action === 'UPDATE') {
      // Update tanpa .select(): 0 baris terpengaruh BUKAN error — baris sudah
      // dihapus di server berarti kematian menang (LWW), op dianggap selesai.
      const { error } = await supabase.from(table).update(item.payload).eq('id', item.entity_id);
      if (error) throw error;
      if (item.entity === 'spp_payment') queueReconcile(item.entity_id);
    } else if (item.action === 'DELETE') {
      // Tombstone dibuat oleh trigger server (log_deleted_row, migration 002)
      // ATOMIC bersama hard delete — tidak perlu insert manual, dan tidak ada
      // risiko tombstone-terlebih-dulu menyembunyikan baris yang gagal dihapus.
      // Gagal = dicoba lagi; "hapus yang sudah hilang" tetap tanpa error.
      const { error } = await supabase.from(table).delete().eq('id', item.entity_id);
      if (error) throw error;
    }

    await db.sync_queue.update(item.id!, {
      status: 'synced',
      synced_at: new Date(),
      attempts: item.attempts + 1,
    });
    return 'synced';
  } catch (err: any) {
    const attempts = item.attempts + 1;
    const lastError = err?.message || 'Unknown error';

    if (attempts >= MAX_RETRIES) {
      await db.sync_queue.update(item.id!, {
        status: 'failed',
        last_error: lastError,
        attempts,
      });
      return 'failed';
    }

    await db.sync_queue.update(item.id!, {
      attempts,
      last_error: lastError,
    });
    return 'pending';
  }
}

export interface PushResult {
  synced: number;
  failed: number;
  pending: number;
}

/**
 * Push semua item pending sync_queue ke Supabase (urut, per item).
 * TIDAK menarik data — lihat runSync untuk push → pull.
 */
export async function syncToSupabase(): Promise<PushResult> {
  const pendingItems = await db.sync_queue
    .where('status')
    .equals('pending')
    .toArray();

  if (pendingItems.length === 0) {
    return { synced: 0, failed: 0, pending: 0 };
  }

  let synced = 0;
  let failed = 0;
  let pending = 0;

  // Urutkan berdasarkan waktu buat: kas/hapus bergantung urutan yang benar.
  pendingItems.sort((a, b) => (a.created_at?.getTime() ?? 0) - (b.created_at?.getTime() ?? 0));

  for (const item of pendingItems) {
    const result = await processSyncItem(item);
    if (result === 'synced') synced++;
    else if (result === 'failed') failed++;
    else pending++;
  }

  return { synced, failed, pending };
}

/**
 * Rekonsiliasi Kas untuk pembayaran SPP yang barusan tersalin dari antrian
 * offline. Gagal = dicoba lagi pada runSync berikutnya (penyimpanan lokal).
 * Wajib dijalankan SETELAH push, SEBELUM pull — kas dibangun dari keadaan
 * server yang sudah menerima barisnya.
 */
export async function runPendingReconciles(): Promise<{ ok: number; failed: number }> {
  const entries = readReconcileQueue();
  if (entries.length === 0) return { ok: 0, failed: 0 };

  const remaining: ReconcileEntry[] = [];
  let ok = 0;

  for (const entry of entries) {
    try {
      await reconcilePaymentKas(entry.id);
      ok++;
    } catch (err) {
      console.warn('[sync] rekonsiliasi kas gagal, coba lagi nanti:', entry.id, err);
      remaining.push(entry);
    }
  }

  writeReconcileQueue(remaining);
  return { ok, failed: remaining.length };
}

export async function getPendingSyncCount(): Promise<number> {
  return db.sync_queue.where('status').equals('pending').count();
}

export async function getFailedSyncCount(): Promise<number> {
  return db.sync_queue.where('status').equals('failed').count();
}

/** Reset item gagal → coba lagi (dipakai tombol retry di SyncStatus). */
export async function retryFailedItems(): Promise<number> {
  const failedItems = await db.sync_queue.where('status').equals('failed').toArray();
  for (const item of failedItems) {
    await db.sync_queue.update(item.id!, { status: 'pending', attempts: 0 });
  }
  return failedItems.length;
}

export interface SyncRunResult extends PushResult {
  reconcileOk: number;
  reconcileFailed: number;
  pull: PullResult | null;
}

/**
 * Orkestrator satu putaran sinkronisasi penuh — URUTAN PENTING:
 *
 *   1. PUSH   — antrian offline dikirim lebih dulu supaya baris lokal sudah
 *               ada di server sebelum tarikan (pull tidak menimpa op tertunda).
 *   2. RECONCILE — kas SPP dibangun dari state server yang sudah lengkap.
 *   3. PULL   — perubahan device lain masuk ke mirror lokal.
 *
 * Melempar error bila push/pull gagal (panggil tangani di caller); keadaan
 * antrean per item sudah tersimpan sebelum melempar.
 */
export async function runSync(schoolId: string): Promise<SyncRunResult> {
  const push = await syncToSupabase();
  const reconcile = await runPendingReconciles();
  const pull = await pullChanges(schoolId);
  return {
    ...push,
    reconcileOk: reconcile.ok,
    reconcileFailed: reconcile.failed,
    pull,
  };
}
