import { createSupabaseClient } from '@/shared/services/supabase/client';
import type { Category } from '../types/transaction.types';

const supabase = createSupabaseClient();

export async function getCategories(
  schoolId: string,
  type?: 'income' | 'expense'
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
  category: Omit<Category, 'id' | 'created_at' | 'is_default'>
): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .insert({
      school_id: category.school_id,
      type: category.type,
      name: category.name,
      description: category.description || null,
      is_default: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
