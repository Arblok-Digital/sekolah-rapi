-- ============================================
-- MIGRATION: Enrollment delete RLS policy
-- ============================================
-- The enrollment management UI adds a delete flow. Enrollment_requests only
-- had INSERT (public), SELECT, and UPDATE policies (see 20260801001), so
-- deletes were denied by RLS. Add a DELETE policy scoped to the user's own
-- school. Deleting an enrollment request never cascades to student records,
-- which are created separately on approve.

CREATE POLICY "Users can delete own school enrollments" ON public.enrollment_requests
  FOR DELETE USING (school_id = ANY(get_user_school_ids()));
