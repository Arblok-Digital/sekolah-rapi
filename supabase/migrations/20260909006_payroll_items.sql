-- ============================================
-- MIGRATION 034: Payroll items (rincian gaji per slip)
-- Tunjangan (allowance) & potongan (deduction) per payroll_record,
-- mis. Bonus, Insentif, THR, BPJS, Kasbon, Pajak, dll.
-- Total slip = base_salary + allow - deduct. Kolom bonus/deduction
-- di payroll_records dipertahankan & disinkronkan (= jumlah item)
-- agar kode lama tetap jalan.
-- ============================================

CREATE TABLE IF NOT EXISTS public.payroll_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  payroll_record_id UUID NOT NULL REFERENCES public.payroll_records(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('allowance', 'deduction')),
  category TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS (cermin payroll_records: batasi per sekolah + fitur payroll)
ALTER TABLE public.payroll_items ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.payroll_items TO authenticated;
GRANT ALL ON public.payroll_items TO service_role;
GRANT SELECT ON public.payroll_items TO anon;

DROP POLICY IF EXISTS "school_select_payitems" ON public.payroll_items;
DROP POLICY IF EXISTS "school_insert_payitems" ON public.payroll_items;
DROP POLICY IF EXISTS "school_update_payitems" ON public.payroll_items;
DROP POLICY IF EXISTS "school_delete_payitems" ON public.payroll_items;
DROP POLICY IF EXISTS "dev_all_payitems" ON public.payroll_items;

CREATE POLICY "school_select_payitems" ON public.payroll_items FOR SELECT TO authenticated
  USING ((SELECT private.user_has_school(school_id)) AND (SELECT private.school_has_feature(school_id, 'payroll')));
CREATE POLICY "school_insert_payitems" ON public.payroll_items FOR INSERT TO authenticated
  WITH CHECK ((SELECT private.user_has_school(school_id)) AND (SELECT private.school_has_feature(school_id, 'payroll')));
CREATE POLICY "school_update_payitems" ON public.payroll_items FOR UPDATE TO authenticated
  USING ((SELECT private.user_has_school(school_id)) AND (SELECT private.school_has_feature(school_id, 'payroll')))
  WITH CHECK ((SELECT private.user_has_school(school_id)) AND (SELECT private.school_has_feature(school_id, 'payroll')));
CREATE POLICY "school_delete_payitems" ON public.payroll_items FOR DELETE TO authenticated
  USING ((SELECT private.user_has_school(school_id)) AND (SELECT private.school_has_feature(school_id, 'payroll')));
CREATE POLICY "dev_all_payitems" ON public.payroll_items
  FOR ALL USING (is_dev());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payitems_school ON public.payroll_items(school_id);
CREATE INDEX IF NOT EXISTS idx_payitems_record ON public.payroll_items(payroll_record_id);

-- Backfill AMAN (idempotent): hanya untuk slip yang belum punya item
INSERT INTO public.payroll_items (school_id, payroll_record_id, kind, category, amount)
SELECT school_id, id, 'allowance', 'Bonus', bonus
FROM public.payroll_records pr
WHERE COALESCE(bonus, 0) > 0
  AND NOT EXISTS (SELECT 1 FROM public.payroll_items pi WHERE pi.payroll_record_id = pr.id AND pi.kind = 'allowance');

INSERT INTO public.payroll_items (school_id, payroll_record_id, kind, category, amount)
SELECT school_id, id, 'deduction', 'Potongan', deduction
FROM public.payroll_records pr
WHERE COALESCE(deduction, 0) > 0
  AND NOT EXISTS (SELECT 1 FROM public.payroll_items pi WHERE pi.payroll_record_id = pr.id AND pi.kind = 'deduction');

-- Realtime: ikutkan agar panel gaji live di semua perangkat
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'payroll_items'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.payroll_items;
  END IF;
END;
$$;
