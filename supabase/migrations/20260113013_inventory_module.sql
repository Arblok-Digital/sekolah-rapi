-- ============================================
-- MIGRATION 013: Inventory Module
-- ============================================

CREATE TABLE IF NOT EXISTS public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Umum',
  quantity INTEGER NOT NULL DEFAULT 1,
  condition TEXT NOT NULL DEFAULT 'Baik' CHECK (condition IN ('Baik', 'Rusak Ringan', 'Rusak Berat', 'Hilang')),
  location TEXT,
  purchase_date DATE,
  purchase_price NUMERIC(12,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "school_select_inventory" ON public.inventory_items
  FOR SELECT USING (school_id IN (SELECT school_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "school_insert_inventory" ON public.inventory_items
  FOR INSERT WITH CHECK (school_id IN (SELECT school_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "school_update_inventory" ON public.inventory_items
  FOR UPDATE USING (school_id IN (SELECT school_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "school_delete_inventory" ON public.inventory_items
  FOR DELETE USING (school_id IN (SELECT school_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "dev_all_inventory" ON public.inventory_items
  FOR ALL USING (is_dev());

-- Index
CREATE INDEX IF NOT EXISTS idx_inventory_school ON public.inventory_items(school_id);
