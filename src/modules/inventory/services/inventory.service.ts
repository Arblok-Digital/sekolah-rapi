import { createSupabaseClient } from '@/shared/services/supabase/client';
import type { InventoryItem, InventoryFormInput } from '../types/inventory.types';

const TABLE = 'inventory_items';

export async function getInventory(schoolId: string, category?: string) {
  const supabase = createSupabaseClient();
  let q = supabase.from(TABLE).select('*').eq('school_id', schoolId).order('name');
  if (category) q = q.eq('category', category);
  const { data, error } = await q;
  if (error) throw error;
  return data as InventoryItem[];
}

export async function createInventory(schoolId: string, input: InventoryFormInput, userId?: string) {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ ...input, school_id: schoolId })
    .select()
    .single();
  if (error) throw error;

  // Auto-create transaction for purchase cost
  if (input.purchase_price && input.purchase_price > 0) {
    let { data: cat } = await supabase.from('categories').select('id').eq('school_id', schoolId).eq('name', 'ATK').single();
    if (!cat) {
      const { data: newCat } = await supabase.from('categories').insert({ name: 'ATK', type: 'expense', school_id: schoolId }).select('id').single();
      cat = newCat;
    }
    const itemName = data?.name || input.name;
    const qty = input.quantity || 1;
    await supabase.from('transactions').insert({
      school_id: schoolId,
      type: 'expense',
      category_id: cat!.id,
      amount: input.purchase_price * qty,
      description: `Beli ${itemName}${qty > 1 ? ` x${qty}` : ''}`,
      reference_date: new Date().toISOString().split('T')[0],
      recorded_by: userId || null,
    });
  }

  return data as InventoryItem;
}

export async function updateInventory(id: string, input: Partial<InventoryFormInput>) {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as InventoryItem;
}

export async function deleteInventory(id: string) {
  const supabase = createSupabaseClient();
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}
