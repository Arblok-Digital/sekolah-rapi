-- ============================================
-- MIGRATION 031: Restrict anon column exposure on schools
-- ============================================
-- The public enrollment lookup added in 030 works, but SELECT on the full
-- active+enrollment rows would also expose owner_id / phone / email to
-- anonymous visitors. Keep only (id, name) grantable to anon.

REVOKE ALL ON public.schools FROM anon;
GRANT SELECT (id, name) ON public.schools TO anon;

-- Restore other role privileges (revoking from anon does not affect these,
-- but NEW default privileges keep hitting service_role via ALTER DEFAULT
-- PRIVILEGES from migration 20260801003; explicit re-grant not required).
-- anon/authenticated INSERT on schools is intentionally dropped: anon cannot
-- satisfy the RLS INSERT check (owner_id = auth.uid()) anyway.