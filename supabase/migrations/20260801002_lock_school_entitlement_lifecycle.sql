-- School plan/status are activation state, not owner-editable profile fields.
-- Browser-created schools start as free/pending; trusted service_role may activate them.

CREATE OR REPLACE FUNCTION private.prevent_browser_school_lifecycle_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF COALESCE(current_setting('request.jwt.claim.role', true), '') = 'service_role'
     OR session_user = 'postgres' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' AND (NEW.plan IS DISTINCT FROM 'free' OR NEW.status IS DISTINCT FROM 'pending') THEN
    RAISE EXCEPTION 'Sekolah baru hanya dapat dibuat sebagai free/pending';
  END IF;

  IF TG_OP = 'UPDATE'
     AND (NEW.plan IS DISTINCT FROM OLD.plan OR NEW.status IS DISTINCT FROM OLD.status) THEN
    RAISE EXCEPTION 'Plan dan status sekolah hanya dapat diubah melalui jalur admin tepercaya';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.prevent_browser_school_lifecycle_change() FROM PUBLIC;

DROP TRIGGER IF EXISTS prevent_browser_plan_change_trigger ON public.schools;
DROP TRIGGER IF EXISTS prevent_browser_school_lifecycle_trigger ON public.schools;
CREATE TRIGGER prevent_browser_school_lifecycle_trigger
  BEFORE INSERT OR UPDATE OF plan, status ON public.schools
  FOR EACH ROW EXECUTE FUNCTION private.prevent_browser_school_lifecycle_change();