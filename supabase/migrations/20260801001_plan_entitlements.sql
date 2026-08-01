-- Plan entitlement enforcement.
-- Database policy is authoritative; client guards are UX only.

ALTER TABLE public.schools
  DROP CONSTRAINT IF EXISTS schools_plan_check;

ALTER TABLE public.schools
  ADD CONSTRAINT schools_plan_check
  CHECK (plan IN ('free', 'basic', 'pro', 'lifetime'));

CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.is_dev_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND role = 'dev'
  );
$$;

CREATE OR REPLACE FUNCTION private.user_has_school(target_school_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT (SELECT private.is_dev_user()) OR EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND school_id = target_school_id
  );
$$;

CREATE OR REPLACE FUNCTION private.school_has_feature(target_school_id UUID, feature_name TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT (SELECT private.is_dev_user()) OR EXISTS (
    SELECT 1
    FROM public.schools
    WHERE id = target_school_id
      AND status = 'active'
      AND CASE
        WHEN feature_name IN ('dashboard', 'students', 'spp', 'transactions') THEN plan IN ('free', 'basic', 'pro', 'lifetime')
        WHEN feature_name IN ('reports', 'student_import') THEN plan IN ('basic', 'pro', 'lifetime')
        WHEN feature_name IN ('enrollment', 'realtime_dashboard', 'payroll', 'inventory') THEN plan IN ('pro', 'lifetime')
        ELSE false
      END
  );
$$;

-- A browser must never be able to activate or downgrade a plan by updating schools.
DROP POLICY IF EXISTS "Users can update own school" ON public.schools;
DROP POLICY IF EXISTS "Users can update own school profile" ON public.schools;
CREATE POLICY "Users can update own school profile"
  ON public.schools FOR UPDATE TO authenticated
  USING (owner_id = (SELECT auth.uid()))
  WITH CHECK (owner_id = (SELECT auth.uid()));

-- Remove legacy permissive policies whose names may differ between environments.
DO $$
DECLARE policy_row RECORD;
BEGIN
  FOR policy_row IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('inventory_items', 'employees', 'payroll_records', 'enrollment_requests')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_row.policyname, policy_row.tablename);
  END LOOP;
END;
$$;

ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollment_requests ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION private.prevent_browser_plan_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.plan IS DISTINCT FROM OLD.plan
     AND COALESCE(current_setting('request.jwt.claim.role', true), '') <> 'service_role'
     AND session_user <> 'postgres' THEN
    RAISE EXCEPTION 'Plan hanya dapat diubah melalui jalur admin tepercaya';
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.prevent_browser_plan_change() FROM PUBLIC;

DROP TRIGGER IF EXISTS prevent_browser_plan_change_trigger ON public.schools;
CREATE TRIGGER prevent_browser_plan_change_trigger
  BEFORE UPDATE OF plan ON public.schools
  FOR EACH ROW EXECUTE FUNCTION private.prevent_browser_plan_change();

GRANT USAGE ON SCHEMA private TO anon, authenticated;
GRANT EXECUTE ON FUNCTION private.is_dev_user() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION private.user_has_school(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION private.school_has_feature(UUID, TEXT) TO anon, authenticated;

-- Existing paid data remains readable after downgrade, but all paid mutations stop.
DROP POLICY IF EXISTS "school_select_inventory" ON public.inventory_items;
DROP POLICY IF EXISTS "school_insert_inventory" ON public.inventory_items;
DROP POLICY IF EXISTS "school_update_inventory" ON public.inventory_items;
DROP POLICY IF EXISTS "school_delete_inventory" ON public.inventory_items;
CREATE POLICY "school_select_inventory" ON public.inventory_items FOR SELECT TO authenticated
  USING ((SELECT private.user_has_school(school_id)));
CREATE POLICY "school_insert_inventory" ON public.inventory_items FOR INSERT TO authenticated
  WITH CHECK ((SELECT private.user_has_school(school_id)) AND (SELECT private.school_has_feature(school_id, 'inventory')));
CREATE POLICY "school_update_inventory" ON public.inventory_items FOR UPDATE TO authenticated
  USING ((SELECT private.user_has_school(school_id)) AND (SELECT private.school_has_feature(school_id, 'inventory')))
  WITH CHECK ((SELECT private.user_has_school(school_id)) AND (SELECT private.school_has_feature(school_id, 'inventory')));
CREATE POLICY "school_delete_inventory" ON public.inventory_items FOR DELETE TO authenticated
  USING ((SELECT private.user_has_school(school_id)) AND (SELECT private.school_has_feature(school_id, 'inventory')));

DROP POLICY IF EXISTS "school_select_employees" ON public.employees;
DROP POLICY IF EXISTS "school_insert_employees" ON public.employees;
DROP POLICY IF EXISTS "school_update_employees" ON public.employees;
DROP POLICY IF EXISTS "school_delete_employees" ON public.employees;
CREATE POLICY "school_select_employees" ON public.employees FOR SELECT TO authenticated
  USING ((SELECT private.user_has_school(school_id)));
CREATE POLICY "school_insert_employees" ON public.employees FOR INSERT TO authenticated
  WITH CHECK ((SELECT private.user_has_school(school_id)) AND (SELECT private.school_has_feature(school_id, 'payroll')));
CREATE POLICY "school_update_employees" ON public.employees FOR UPDATE TO authenticated
  USING ((SELECT private.user_has_school(school_id)) AND (SELECT private.school_has_feature(school_id, 'payroll')))
  WITH CHECK ((SELECT private.user_has_school(school_id)) AND (SELECT private.school_has_feature(school_id, 'payroll')));
CREATE POLICY "school_delete_employees" ON public.employees FOR DELETE TO authenticated
  USING ((SELECT private.user_has_school(school_id)) AND (SELECT private.school_has_feature(school_id, 'payroll')));

DROP POLICY IF EXISTS "school_select_payroll" ON public.payroll_records;
DROP POLICY IF EXISTS "school_insert_payroll" ON public.payroll_records;
DROP POLICY IF EXISTS "school_update_payroll" ON public.payroll_records;
DROP POLICY IF EXISTS "school_delete_payroll" ON public.payroll_records;
CREATE POLICY "school_select_payroll" ON public.payroll_records FOR SELECT TO authenticated
  USING ((SELECT private.user_has_school(school_id)));
CREATE POLICY "school_insert_payroll" ON public.payroll_records FOR INSERT TO authenticated
  WITH CHECK ((SELECT private.user_has_school(school_id)) AND (SELECT private.school_has_feature(school_id, 'payroll')));
CREATE POLICY "school_update_payroll" ON public.payroll_records FOR UPDATE TO authenticated
  USING ((SELECT private.user_has_school(school_id)) AND (SELECT private.school_has_feature(school_id, 'payroll')))
  WITH CHECK ((SELECT private.user_has_school(school_id)) AND (SELECT private.school_has_feature(school_id, 'payroll')));
CREATE POLICY "school_delete_payroll" ON public.payroll_records FOR DELETE TO authenticated
  USING ((SELECT private.user_has_school(school_id)) AND (SELECT private.school_has_feature(school_id, 'payroll')));

DROP POLICY IF EXISTS "Anyone can submit enrollment" ON public.enrollment_requests;
DROP POLICY IF EXISTS "Users can view own school enrollments" ON public.enrollment_requests;
DROP POLICY IF EXISTS "Users can update own school enrollments" ON public.enrollment_requests;
CREATE POLICY "Active Pro schools accept public enrollment" ON public.enrollment_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    status = 'pending'
    AND (SELECT private.school_has_feature(school_id, 'enrollment'))
  );

CREATE OR REPLACE FUNCTION public.submit_enrollment(target_school_id UUID, enrollment JSONB)
RETURNS SETOF public.enrollment_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT (SELECT private.school_has_feature(target_school_id, 'enrollment')) THEN
    RAISE EXCEPTION 'Pendaftaran online tidak tersedia untuk sekolah ini';
  END IF;

  RETURN QUERY
  INSERT INTO public.enrollment_requests (
    school_id, student_name, nis, class, gender, address, birth_date,
    birth_place, parent_name, parent_phone, parent_email, parent_occupation, status
  ) VALUES (
    target_school_id, enrollment->>'student_name', NULLIF(enrollment->>'nis', ''),
    enrollment->>'class', NULLIF(enrollment->>'gender', ''), NULLIF(enrollment->>'address', ''),
    NULLIF(enrollment->>'birth_date', '')::DATE, NULLIF(enrollment->>'birth_place', ''),
    enrollment->>'parent_name', enrollment->>'parent_phone', NULLIF(enrollment->>'parent_email', ''),
    NULLIF(enrollment->>'parent_occupation', ''), 'pending'
  ) RETURNING *;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_enrollment(UUID, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_enrollment(UUID, JSONB) TO anon, authenticated;
CREATE POLICY "Users can view own school enrollments" ON public.enrollment_requests
  FOR SELECT TO authenticated
  USING ((SELECT private.user_has_school(school_id)));
CREATE POLICY "Users can update own school enrollments" ON public.enrollment_requests
  FOR UPDATE TO authenticated
  USING ((SELECT private.user_has_school(school_id)) AND (SELECT private.school_has_feature(school_id, 'enrollment')))
  WITH CHECK ((SELECT private.user_has_school(school_id)) AND (SELECT private.school_has_feature(school_id, 'enrollment')));

CREATE OR REPLACE FUNCTION public.approve_enrollment(target_enrollment_id UUID, admin_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE enrollment_row public.enrollment_requests%ROWTYPE;
BEGIN
  IF admin_id IS DISTINCT FROM (SELECT auth.uid()) THEN
    RAISE EXCEPTION 'Admin tidak valid';
  END IF;
  SELECT * INTO enrollment_row
  FROM public.enrollment_requests
  WHERE id = target_enrollment_id;
  IF NOT FOUND OR NOT (SELECT private.user_has_school(enrollment_row.school_id))
     OR NOT (SELECT private.school_has_feature(enrollment_row.school_id, 'enrollment')) THEN
    RAISE EXCEPTION 'Enrollment tidak tersedia untuk sekolah ini';
  END IF;
  IF enrollment_row.status <> 'pending' THEN
    RAISE EXCEPTION 'Enrollment sudah diproses';
  END IF;

  INSERT INTO public.students (school_id, nis, name, class, gender, address, parent_name, parent_phone, status)
  VALUES (enrollment_row.school_id, enrollment_row.nis, enrollment_row.student_name, enrollment_row.class,
          enrollment_row.gender, enrollment_row.address, enrollment_row.parent_name, enrollment_row.parent_phone, 'active');
  UPDATE public.enrollment_requests
  SET status = 'approved', processed_by = admin_id, processed_at = now()
  WHERE id = target_enrollment_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_enrollment(target_enrollment_id UUID, admin_id UUID, notes TEXT DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE target_school_id UUID;
BEGIN
  IF admin_id IS DISTINCT FROM (SELECT auth.uid()) THEN
    RAISE EXCEPTION 'Admin tidak valid';
  END IF;
  SELECT school_id INTO target_school_id FROM public.enrollment_requests WHERE id = target_enrollment_id;
  IF target_school_id IS NULL OR NOT (SELECT private.user_has_school(target_school_id))
     OR NOT (SELECT private.school_has_feature(target_school_id, 'enrollment')) THEN
    RAISE EXCEPTION 'Enrollment tidak tersedia untuk sekolah ini';
  END IF;
  UPDATE public.enrollment_requests
  SET status = 'rejected', admin_notes = notes, processed_by = admin_id, processed_at = now()
  WHERE id = target_enrollment_id AND status = 'pending';
END;
$$;

REVOKE ALL ON FUNCTION public.approve_enrollment(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_enrollment(UUID, UUID) TO authenticated;
REVOKE ALL ON FUNCTION public.reject_enrollment(UUID, UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reject_enrollment(UUID, UUID, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.import_students(target_school_id UUID, records JSONB)
RETURNS TABLE(imported INTEGER, failed INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  item JSONB;
  imported_count INTEGER := 0;
  failed_count INTEGER := 0;
BEGIN
  IF NOT (SELECT private.user_has_school(target_school_id))
     OR NOT (SELECT private.school_has_feature(target_school_id, 'student_import')) THEN
    RAISE EXCEPTION 'Import siswa tidak tersedia untuk sekolah ini';
  END IF;
  IF jsonb_typeof(records) <> 'array' THEN
    RAISE EXCEPTION 'Records harus berupa array';
  END IF;

  FOR item IN SELECT value FROM jsonb_array_elements(records)
  LOOP
    BEGIN
      INSERT INTO public.students (school_id, nis, name, class, gender, address, parent_name, parent_phone, status)
      VALUES (
        target_school_id,
        NULLIF(item->>'nis', ''),
        item->>'name',
        item->>'class',
        NULLIF(item->>'gender', ''),
        NULLIF(item->>'address', ''),
        NULLIF(item->>'parent_name', ''),
        NULLIF(item->>'parent_phone', ''),
        COALESCE(NULLIF(item->>'status', ''), 'active')
      );
      imported_count := imported_count + 1;
    EXCEPTION WHEN OTHERS THEN
      failed_count := failed_count + 1;
    END;
  END LOOP;

  RETURN QUERY SELECT imported_count, failed_count;
END;
$$;

REVOKE ALL ON FUNCTION public.import_students(UUID, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.import_students(UUID, JSONB) TO authenticated;
