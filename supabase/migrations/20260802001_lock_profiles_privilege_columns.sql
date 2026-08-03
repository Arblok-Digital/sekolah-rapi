-- ============================================
-- MIGRATION: Lock profiles privilege columns
-- ============================================
-- Security fix for C1/C2: Prevent privilege escalation via self-modifying role/school_id.
-- Users can register (INSERT with role='owner'), but cannot UPDATE these sensitive columns.
-- Only service_role and postgres superuser can modify role/school_id.

CREATE OR REPLACE FUNCTION private.prevent_profile_privilege_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Bypass check for service_role (Admin API/Backend) or postgres superuser
  IF COALESCE(current_setting('request.jwt.claim.role', true), '') = 'service_role'
     OR session_user = 'postgres' THEN
    RETURN NEW;
  END IF;

  -- Block UPDATE of critical columns for all other users
  IF TG_OP = 'UPDATE' THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Role profil hanya dapat diubah melalui jalur admin tepercaya';
    END IF;

    IF NEW.school_id IS DISTINCT FROM OLD.school_id THEN
      RAISE EXCEPTION 'Perpindahan sekolah tidak diizinkan';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Secure the trigger function
REVOKE ALL ON FUNCTION private.prevent_profile_privilege_escalation() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.prevent_profile_privilege_escalation() TO service_role, postgres;

-- Apply trigger to profiles table
DROP TRIGGER IF EXISTS lock_profile_privileges_trigger ON public.profiles;
CREATE TRIGGER lock_profile_privileges_trigger
  BEFORE UPDATE OF role, school_id ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION private.prevent_profile_privilege_escalation();
