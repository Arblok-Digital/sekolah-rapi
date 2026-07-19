-- ============================================
-- MIGRATION 016: Add 'rejected' status to schools
-- ============================================

-- 1. Alter CHECK constraint to include 'rejected'
ALTER TABLE public.schools DROP CONSTRAINT IF EXISTS schools_status_check;
ALTER TABLE public.schools ADD CONSTRAINT schools_status_check
  CHECK (status IN ('pending', 'active', 'suspended', 'archived', 'rejected'));

-- 2. Dev function to reject a school (sets status to rejected)
CREATE OR REPLACE FUNCTION dev_reject_school(target_school_id UUID)
RETURNS VOID AS $$
BEGIN
  IF NOT is_dev() THEN
    RAISE EXCEPTION 'Access denied: dev role required';
  END IF;
  UPDATE public.schools SET status = 'rejected' WHERE id = target_school_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
