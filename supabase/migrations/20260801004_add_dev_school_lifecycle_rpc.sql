-- Update school lifecycle fields through a controlled, RLS-independent RPC.
-- The caller is still authenticated and must have a dev profile.

CREATE OR REPLACE FUNCTION private.prevent_browser_school_lifecycle_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF COALESCE(current_setting('request.jwt.claim.role', true), '') = 'service_role'
     OR COALESCE(current_setting('app.dev_school_lifecycle_update', true), '') = 'allowed'
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

CREATE OR REPLACE FUNCTION public.dev_update_school_access(
  target_school_id uuid,
  next_status text DEFAULT NULL,
  next_plan text DEFAULT NULL
)
RETURNS TABLE (id uuid, name text, status text, plan text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  caller_role text;
BEGIN
  SELECT p.role INTO caller_role
  FROM public.profiles p
  WHERE p.id = auth.uid();

  IF caller_role IS DISTINCT FROM 'dev' THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501';
  END IF;

  IF next_status IS NULL AND next_plan IS NULL THEN
    RAISE EXCEPTION 'Plan atau status wajib diisi' USING ERRCODE = '22023';
  END IF;

  PERFORM set_config('app.dev_school_lifecycle_update', 'allowed', true);

  RETURN QUERY
  UPDATE public.schools s
  SET status = COALESCE(next_status, s.status),
      plan = COALESCE(next_plan, s.plan)
  WHERE s.id = target_school_id
  RETURNING s.id, s.name, s.status, s.plan;
END;
$$;

REVOKE ALL ON FUNCTION public.dev_update_school_access(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.dev_update_school_access(uuid, text, text) TO authenticated;