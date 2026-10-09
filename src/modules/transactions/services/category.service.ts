import { createSupabaseClient } from '@/shared/services/supabase/client';
import { db } from '@/modules/offline/db';
import type { Category } from '../types/transaction.types';
import { isOfflineError } from '@/modules/offline/services/network';
import { withOfflineFallback } from '@/modules/offline/services/read';
import { mirrorFull } from '@/modules/offline/services/mirror';
import { getDeviceId } from '@/modules/offline/services/device';
import { queueWrite, queueLocalDelete, getQueueUserId } from '@/modules/offline/services/queue';

const supabase = createSupabaseClient();

export type CategoryType = 'income' | 'expense';

export interface CategoryInput {
  name: string;
  type: CategoryType;
  description?: string;
}

export interface CategoryUpdates {
  name?: string;
  type?: CategoryType;
  description?: string | null;
}

export async function getCategories(
  schoolId: string,
  type?: CategoryType
): Promise<Category[]> {
  return withOfflineFallback(
    async () => {
      let query = supabase
        .from('categories')
        .select('*')
        .eq('school_id', schoolId)
        .order('name');

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;
      if (error) throw error;
      const rows = data ?? [];
      await mirrorFull('categories', rows);
      return rows;
    },
    async () => {
      let rows = await db.categories.where('school_id').equals(schoolId).toArray();
      if (type) rows = rows.filter((r) => r.type === type);
      rows.sort((a, b) => a.name.localeCompare(b.name));
      return rows as unknown as Category[];
    }
  );
}

export async function createCategory(
  schoolId: string,
  input: CategoryInput
): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .insert({
      school_id: schoolId,
      type: input.type,
      name: input.name,
      description: input.description || null,
      is_default: false,
      device_id: getDeviceId(),
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('Kategori dengan nama yang sama sudah ada.');
    }
    if (!isOfflineError(error)) throw error;

    // ── OFFLINE: tulis lokal + antrikan. Duplikat nama baru terdeteksi saat
    // push (server tetap menolak 23505 → item gagal, terlihat di badge sync).
    const localId = crypto.randomUUID();
    const nowIso = new Date().toISOString();
    const localRow = {
      id: localId,
      school_id: schoolId,
      type: input.type,
      name: input.name,
      description: input.description || null,
      is_default: false,
      created_at: nowIso,
      updated_at: nowIso,
      device_id: getDeviceId(),
    };
    await db.categories.put(localRow as never);
    await queueWrite({
      school_id: schoolId,
      user_id: await getQueueUserId(),
      entity: 'category',
      entity_id: localId,
      action: 'INSERT',
      payload: localRow,
    });
    return localRow as unknown as Category;
  }

  await db.categories.put(data);
  return data;
}

async function categoryInUse(id: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('transactions')
    .select('id')
    .eq('category_id', id)
    .limit(1);
  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

export async function updateCategory(
  id: string,
  updates: CategoryUpdates
): Promise<Category> {
  let offline = false;
  let { data: existing, error: fetchError } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();
  if (fetchError) {
    if (!isOfflineError(fetchError)) throw fetchError;
    // OFFLINE: pakai mirror lokal sebagai basis validasi.
    const local = await db.categories.get(id);
    if (!local) throw fetchError;
    existing = local as unknown as Category;
    offline = true;
  }

  const payload: Record<string, unknown> = {};
  if (updates.name !== undefined) {
    // Default categories are referenced by name (SPP/Gaji Guru/ATK auto-create
    // in spp/payroll/inventory services), so renames would break those lookups.
    if (existing.is_default && updates.name !== existing.name) {
      throw new Error('Nama kategori bawaan tidak dapat diubah.');
    }
    payload.name = updates.name;
  }
  if (updates.type !== undefined && updates.type !== existing.type) {
    // Cek "sudah dipakai transaksi" butuh query server — offline tidak bisa
    // memverifikasi, jadi tipe hanya boleh diubah saat online.
    if (offline) throw new Error('Ubah tipe kategori butuh koneksi internet.');
    if (await categoryInUse(id)) {
      throw new Error('Tipe kategori tidak dapat diubah karena sudah dipakai transaksi.');
    }
    payload.type = updates.type;
  }
  if (updates.description !== undefined) {
    payload.description = updates.description || null;
  }

  if (Object.keys(payload).length === 0) return existing;

  const { data, error } = await supabase
    .from('categories')
    .update({ ...payload, device_id: getDeviceId() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('Kategori dengan nama yang sama sudah ada.');
    }
    if (!isOfflineError(error)) throw error;

    // ── OFFLINE: merge lokal + antrikan UPDATE ──
    const local = await db.categories.get(id);
    if (!local) throw error;
    const merged = {
      ...local,
      ...payload,
      updated_at: new Date().toISOString(),
      device_id: getDeviceId(),
    };
    await db.categories.put(merged as never);
    await queueWrite({
      school_id: local.school_id,
      user_id: await getQueueUserId(),
      entity: 'category',
      entity_id: id,
      action: 'UPDATE',
      payload: { ...payload, id, school_id: local.school_id, device_id: getDeviceId() },
    });
    return merged as unknown as Category;
  }

  await db.categories.put(data);
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  let { data: category, error: fetchError } = await supabase
    .from('categories')
    .select('name, is_default, school_id')
    .eq('id', id)
    .single();

  if (fetchError) {
    if (!isOfflineError(fetchError)) throw fetchError;
    const local = await db.categories.get(id);
    if (!local) throw fetchError;
    if (local.is_default) {
      throw new Error(`Kategori bawaan "${local.name}" tidak dapat dihapus.`);
    }
    // Pengecekan "masih dipakai transaksi" tidak bisa diverifikasi offline —
    // server tetap menolak via FK saat push (item muncul sebagai gagal).
    await queueLocalDelete('category', id, local.school_id);
    return;
  }
  if (!category) throw new Error('Kategori tidak ditemukan.');

  if (category.is_default) {
    throw new Error(`Kategori bawaan "${category.name}" tidak dapat dihapus.`);
  }

  // transactions.category_id is NOT NULL without ON DELETE; deleting a category
  // still referenced by transactions would violate the FK constraint.
  if (await categoryInUse(id)) {
    throw new Error(`Kategori "${category.name}" masih digunakan oleh transaksi dan tidak dapat dihapus.`);
  }

  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) {
    if (!isOfflineError(error)) throw error;
    await queueLocalDelete('category', id, category.school_id);
    return;
  }
  await db.categories.delete(id);
}
