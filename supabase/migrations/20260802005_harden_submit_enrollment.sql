-- ============================================
-- MIGRATION: Harden submit_enrollment against spam/abuse
-- ============================================
-- The anon public enrollment form calls this RPC directly. Previously it accepted
-- any JSONB with no validation or throttling. Now it validates required fields,
-- caps field lengths, and blocks rapid duplicate submissions per parent phone.

CREATE OR REPLACE FUNCTION public.submit_enrollment(target_school_id uuid, enrollment jsonb)
 RETURNS SETOF enrollment_requests
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_student_name text := NULLIF(btrim(coalesce(enrollment->>'student_name', '')), '');
  v_parent_phone text := NULLIF(btrim(coalesce(enrollment->>'parent_phone', '')), '');
  v_duplicate boolean;
BEGIN
  IF NOT (SELECT private.school_has_feature(target_school_id, 'enrollment')) THEN
    RAISE EXCEPTION 'Pendaftaran online tidak tersedia untuk sekolah ini';
  END IF;

  -- Required fields
  IF v_student_name IS NULL THEN
    RAISE EXCEPTION 'Nama siswa wajib diisi' USING ERRCODE = '22023';
  END IF;
  IF v_parent_phone IS NULL THEN
    RAISE EXCEPTION 'No. HP orang tua wajib diisi' USING ERRCODE = '22023';
  END IF;

  -- Field length caps (prevent oversized payload abuse)
  IF length(v_student_name) > 200 THEN
    RAISE EXCEPTION 'Nama siswa terlalu panjang' USING ERRCODE = '22023';
  END IF;
  IF length(v_parent_phone) > 30 THEN
    RAISE EXCEPTION 'No. HP terlalu panjang' USING ERRCODE = '22023';
  END IF;
  IF length(coalesce(enrollment->>'parent_name', '')) > 200 THEN
    RAISE EXCEPTION 'Nama orang tua terlalu panjang' USING ERRCODE = '22023';
  END IF;
  IF length(coalesce(enrollment->>'class', '')) > 20 THEN
    RAISE EXCEPTION 'Kelas tidak valid' USING ERRCODE = '22023';
  END IF;

  -- Rapid duplicate-submission guard: same school + parent phone within 10 minutes
  SELECT EXISTS (
    SELECT 1 FROM public.enrollment_requests
    WHERE school_id = target_school_id
      AND parent_phone = v_parent_phone
      AND status = 'pending'
      AND created_at > now() - interval '10 minutes'
  ) INTO v_duplicate;

  IF v_duplicate THEN
    RAISE EXCEPTION 'Pendaftaran sudah dikirim baru-baru ini. Silakan tunggu atau hubungi sekolah.' USING ERRCODE = '22023';
  END IF;

  RETURN QUERY
  INSERT INTO public.enrollment_requests (
    school_id, student_name, nis, class, gender, address, birth_date,
    birth_place, parent_name, parent_phone, parent_email, parent_occupation, status
  ) VALUES (
    target_school_id, v_student_name, NULLIF(btrim(coalesce(enrollment->>'nis', '')), ''),
    NULLIF(btrim(coalesce(enrollment->>'class', '')), ''), NULLIF(btrim(coalesce(enrollment->>'gender', '')), ''),
    NULLIF(btrim(coalesce(enrollment->>'address', '')), ''), NULLIF(btrim(coalesce(enrollment->>'birth_date', '')), '')::DATE,
    NULLIF(btrim(coalesce(enrollment->>'birth_place', '')), ''), NULLIF(btrim(coalesce(enrollment->>'parent_name', '')), ''),
    v_parent_phone, NULLIF(btrim(coalesce(enrollment->>'parent_email', '')), ''),
    NULLIF(btrim(coalesce(enrollment->>'parent_occupation', '')), ''), 'pending'
  ) RETURNING *;
END;
$function$;

REVOKE ALL ON FUNCTION public.submit_enrollment(uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_enrollment(uuid, jsonb) TO anon, authenticated;
