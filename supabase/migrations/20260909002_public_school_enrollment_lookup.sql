-- ============================================
-- MIGRATION 030: Public school lookup for enrollment
-- ============================================
-- /register-student reads a single school's name via the anon client to show
-- the school header, but RLS (owner-role + dev-role policies only) returned
-- nothing for anonymous visitors.
--
-- Expose only ACTIVE schools that have the enrollment feature enabled.
-- Columns exposed: the full row of those scoped schools only; rows of
-- pending/rejected schools and schools without the enrollment feature stay
-- invisible to the public.

CREATE POLICY "Public can view school for enrollment" ON public.schools
  FOR SELECT TO anon
  USING (status = 'active' AND private.school_has_feature(id, 'enrollment'));