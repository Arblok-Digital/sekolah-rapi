import { createSupabaseClient } from '@/shared/services/supabase/client';
import type { Category } from '../types/transaction.types';

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
  return data ?? [];
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
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('Kategori dengan nama yang sama sudah ada.');
    }
    throw error;
  }
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
  const { data: existing, error: fetchError } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();
  if (fetchError) throw fetchError;

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
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('Kategori dengan nama yang sama sudah ada.');
    }
    throw error;
  }
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  const { data: category, error: fetchError } = await supabase
    .from('categories')
    .select('name, is_default')
    .eq('id', id)
    .single();
  if (fetchError) throw fetchError;

  if (category.is_default) {
    throw new Error(`Kategori bawaan "${category.name}" tidak dapat dihapus.`);
  }

  // transactions.category_id is NOT NULL without ON DELETE; deleting a category
  // still referenced by transactions would violate the FK constraint.
  if (await categoryInUse(id)) {
    throw new Error(`Kategori "${category.name}" masih digunakan oleh transaksi dan tidak dapat dihapus.`);
  }

  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}
