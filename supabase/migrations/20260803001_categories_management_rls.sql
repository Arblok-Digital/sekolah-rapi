-- ============================================
-- MIGRATION: Categories management RLS policies
-- ============================================
-- The category management UI adds update/delete flows for categories. Regular
-- users only had SELECT + INSERT policies (see 20260113010/20260113012), so
-- updates and deletes were denied by RLS. Add UPDATE/DELETE policies scoped
-- to the user's own school.

CREATE POLICY "Users can update own school categories" ON public.categories
  FOR UPDATE USING (school_id = ANY(get_user_school_ids()))
  WITH CHECK (school_id = ANY(get_user_school_ids()));

CREATE POLICY "Users can delete own school categories" ON public.categories
  FOR DELETE USING (school_id = ANY(get_user_school_ids()));
