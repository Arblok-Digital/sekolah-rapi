'use client';

import { createSupabaseClient } from '@/shared/services/supabase/client';
import { db } from '@/modules/offline/db';
import type { SyncQueueItem } from '@/shared/types';

const MAX_RETRIES = 5;

/**
 * Process a single sync_queue item against Supabase.
 * Returns 'synced' on success, 'failed' on permanent error, or 'pending' to retry later.
 */
async function processSyncItem(item: SyncQueueItem): Promise<'synced' | 'failed' | 'pending'> {
  // Map entity names to actual table names (handle singular/plural mismatch)
  const TABLE_MAP: Record<string, string> = {
    transaction: 'transactions',
    student: 'students',
    spp_payment: 'spp_payments',
  };
  const entity = TABLE_MAP[item.entity] || item.entity;
  const supabase = createSupabaseClient();

  try {
    if (item.action === 'INSERT') {
      const { error } = await supabase.from(entity).insert(item.payload);
      if (error) throw error;
    } else if (item.action === 'UPDATE') {
      const { error } = await supabase
        .from(entity)
        .update(item.payload)
        .eq('id', item.entity_id);
      if (error) throw error;
    } else if (item.action === 'DELETE') {
      const { error } = await supabase.from(entity).delete().eq('id', item.entity_id);
      if (error) throw error;
    }

    // Mark synced
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

/**
 * Push all pending sync_queue items to Supabase.
 */
export async function syncToSupabase(): Promise<{
  synced: number;
  failed: number;
  pending: number;
}> {
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

  for (const item of pendingItems) {
    const result = await processSyncItem(item);
    if (result === 'synced') synced++;
    else if (result === 'failed') failed++;
    else pending++;
  }

  return { synced, failed, pending };
}

export async function getPendingSyncCount(): Promise<number> {
  return db.sync_queue.where('status').equals('pending').count();
}
