export interface InventoryItem {
  id: string;
  school_id: string;
  name: string;
  category: string;
  quantity: number;
  condition: 'Baik' | 'Rusak Ringan' | 'Rusak Berat' | 'Hilang';
  location?: string;
  purchase_date?: string;
  purchase_price: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type InventoryFormInput = Omit<InventoryItem, 'id' | 'school_id' | 'created_at' | 'updated_at'>;

export const INVENTORY_CATEGORIES = [
  'Furniture',
  'Elektronik',
  'ATK',
  'Olahraga',
  'Laboratorium',
  'Perpustakaan',
  'Umum',
] as const;

export const INVENTORY_CONDITIONS = ['Baik', 'Rusak Ringan', 'Rusak Berat', 'Hilang'] as const;
