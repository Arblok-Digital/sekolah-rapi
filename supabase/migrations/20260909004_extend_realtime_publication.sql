-- ============================================
-- MIGRATION 032: Extend realtime publication to all monitoring panels
-- ============================================
-- Overview already subscribes to transactions/students/spp_payments/
-- enrollment_requests. Add the remaining panel tables so every dashboard
-- panel (Kategori, Inventaris, Payroll/Gaji) can update live via realtime.

DO $$
DECLARE
  tbl_name text;
  parts text[];
BEGIN
  FOREACH tbl_name IN ARRAY ARRAY[
    'public.categories',
    'public.inventory_items',
    'public.employees',
    'public.payroll_records'
  ]
  LOOP
    parts := string_to_array(tbl_name, '.');
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = parts[1]
        AND tablename = parts[2]
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %s', tbl_name);
    END IF;
  END LOOP;
END;
$$;