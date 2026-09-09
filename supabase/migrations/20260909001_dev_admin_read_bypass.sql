-- ============================================
-- MIGRATION 029: Dev role read bypass (restore dev admin visibility)
-- ============================================
-- Dev admin panel was designed to list ALL schools, profiles, and inspect
-- any school's data (the "dev bypasses RLS" intent in the panel code), but no
-- RLS policy ever implemented it. After linking a school_id to the dev
-- account, RLS locked the panel to only dev's own school.
--
-- These SELECT-only policies restore that original behavior for the dev role.
-- Write access stays guarded by the existing SECURITY DEFINER dev_* RPCs.
-- Regular users are unaffected (existing per-user policies still apply).

CREATE POLICY "Dev can view all schools" ON public.schools
  FOR SELECT USING (private.is_dev_user());

CREATE POLICY "Dev can view all profiles" ON public.profiles
  FOR SELECT USING (private.is_dev_user());

CREATE POLICY "Dev can view all students" ON public.students
  FOR SELECT USING (private.is_dev_user());

CREATE POLICY "Dev can view all spp" ON public.spp_payments
  FOR SELECT USING (private.is_dev_user());

CREATE POLICY "Dev can view all transactions" ON public.transactions
  FOR SELECT USING (private.is_dev_user());

CREATE POLICY "Dev can view all categories" ON public.categories
  FOR SELECT USING (private.is_dev_user());