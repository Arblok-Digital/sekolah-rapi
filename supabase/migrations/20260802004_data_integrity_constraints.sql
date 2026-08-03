-- ============================================
-- MIGRATION: Data integrity constraints + FK + realtime
-- ============================================
-- 1. Deduplicate spp_payments (keep best row per school+student+month+year)
-- 2. Add UNIQUE constraints to prevent future duplicates
-- 3. Add ON DELETE actions to auth.users FKs so deleting a user can't fail
-- 4. Ensure realtime publication covers the dashboard tables (fresh deploys)

-- ── 1. Deduplicate spp_payments ──
-- Keep the row with the highest paid_amount (ties: earliest created_at, lowest id).
WITH ranked AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY school_id, student_id, month, year
      ORDER BY paid_amount DESC, created_at ASC, id ASC
    ) AS rn
  FROM public.spp_payments
)
DELETE FROM public.spp_payments s
USING ranked r
WHERE s.id = r.id AND r.rn > 1;

-- ── 2. UNIQUE constraints ──
ALTER TABLE public.spp_payments
  ADD CONSTRAINT spp_payments_school_student_month_year_key
  UNIQUE (school_id, student_id, month, year);

ALTER TABLE public.students
  ADD CONSTRAINT students_school_nis_key
  UNIQUE (school_id, nis);

-- ── 3. auth.users FK actions ──
-- transactions.recorded_by: nullable already; SET NULL on user deletion
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_recorded_by_fkey;
ALTER TABLE public.transactions ADD CONSTRAINT transactions_recorded_by_fkey
  FOREIGN KEY (recorded_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_approved_by_fkey;
ALTER TABLE public.transactions ADD CONSTRAINT transactions_approved_by_fkey
  FOREIGN KEY (approved_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- spp_payments.recorded_by: drop NOT NULL so user deletion can null it
ALTER TABLE public.spp_payments DROP CONSTRAINT IF EXISTS spp_payments_recorded_by_fkey;
ALTER TABLE public.spp_payments ALTER COLUMN recorded_by DROP NOT NULL;
ALTER TABLE public.spp_payments ADD CONSTRAINT spp_payments_recorded_by_fkey
  FOREIGN KEY (recorded_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- enrollment_requests.processed_by
ALTER TABLE public.enrollment_requests DROP CONSTRAINT IF EXISTS enrollment_requests_processed_by_fkey;
ALTER TABLE public.enrollment_requests ADD CONSTRAINT enrollment_requests_processed_by_fkey
  FOREIGN KEY (processed_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- sync_queue.user_id: transient offline queue; cascade on user deletion
ALTER TABLE public.sync_queue DROP CONSTRAINT IF EXISTS sync_queue_user_id_fkey;
ALTER TABLE public.sync_queue ADD CONSTRAINT sync_queue_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ── 4. Realtime publication (idempotent) ──
DO $$
DECLARE
  tbl_name text;
  parts text[];
BEGIN
  FOREACH tbl_name IN ARRAY ARRAY[
    'public.transactions',
    'public.students',
    'public.spp_payments',
    'public.enrollment_requests'
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
