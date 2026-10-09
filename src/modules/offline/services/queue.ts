import { db } from '@/modules/offline/db';
import { createSupabaseClient } from '@/shared/services/supabase/client';
import { mapEntityToTable } from './sync-core';
import type { SyncQueueItem } from '@/shared/types';

/** User id untuk item antrian — '' bila sesi tidak terbaca (tetap bisa push). */
export async function getQueueUserId(): Promise<string> {
  try {
    const supabase = createSupabaseClient();
    const { data } = await supabase.auth.getSession();
    return data?.session?.user?.id ?? '';
  } catch {
    return '';
  }
}

/** Tambah satu item ke sync_queue (status pending, attempts 0). */
export async function queueWrite(
  item: Omit<SyncQueueItem, 'id' | 'attempts' | 'status' | 'created_at'>
): Promise<void> {
  await db.sync_queue.add({
    ...item,
    attempts: 0,
    status: 'pending',
    created_at: new Date(),
  });
}

function dexieTableFor(entity: string) {
  switch (mapEntityToTable(entity)) {
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
 * Hapus baris dari mirror lokal + antrikan DELETE. Tombstone deleted_rows
 * dibuat oleh sync.service saat push — device lain belajar dari sana.
 */
export async function queueLocalDelete(
  entity: SyncQueueItem['entity'],
  id: string,
  schoolId: string
): Promise<void> {
  const userId = await getQueueUserId();
  await queueWrite({
    school_id: schoolId,
    user_id: userId,
    entity,
    entity_id: id,
    action: 'DELETE',
    payload: { id },
  });
  await dexieTableFor(entity)?.delete(id);
}
