-- ============================================
-- MIGRATION 002 (2026-10-03): Kunci INSERT profiles
-- Menutup temuan audit C1 (eskalasi role) dan C2 (menyusup sekolah lain)
--
-- Sebelumnya: policy INSERT hanya WITH CHECK (id = auth.uid()),
-- sehingga pengguna biasa bisa menulis role='dev' sendiri dan
-- school_id milik sekolah orang lain.
-- ============================================

-- 1) Validasi nilai role di semua jalur (termasuk backend)
--    Data yang ada sekarang: 'owner', 'dev' -> tetap sah.
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('owner', 'admin', 'staff', 'teacher', 'dev'));

-- 2) Fungsi trigger: setiap profil baru harus memenuhi dua syarat
--    (a) role bukan 'dev' untuk jalur pengguna biasa
--    (b) school_id menunjuk sekolah yang dimiliki penelepon
CREATE OR REPLACE FUNCTION private.prevent_profile_insert_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  jwt_role text := COALESCE(current_setting('request.jwt.claim.role', true), '');
  caller_id uuid := (SELECT auth.uid());
BEGIN
  -- Backend / Admin API (service_role) dan koneksi langsung (psql, Dashboard SQL)
  -- tidak dibatasi: jalur tepercaya yang memang mengelola data.
  IF jwt_role = 'service_role' OR session_user = 'postgres' THEN
    RETURN NEW;
  END IF;

  -- Akun dev asli (dibuat backend) tetap boleh membuat profil
  -- untuk keperluan panel dev / seeding.
  IF caller_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = caller_id AND role = 'dev'
  ) THEN
    RETURN NEW;
  END IF;

  -- Role tidak sah: 'dev' dan nilai liar lainnya ditolak.
  IF NEW.role NOT IN ('owner', 'admin', 'staff', 'teacher') THEN
    RAISE EXCEPTION 'Role tidak diizinkan';
  END IF;

  -- Syarat C2: sekolah tujuan harus dimiliki penelepon.
  -- Pemilik terverifikasi diambil dari schools.owner_id yang sendiri
  -- sudah dipaksa = auth.uid() oleh policy INSERT schools.
  IF NEW.school_id IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.schools s
    WHERE s.id = NEW.school_id
      AND s.owner_id = caller_id
  ) THEN
    RAISE EXCEPTION 'Hanya pemilik sekolah yang boleh menambah pengguna di sekolahnya';
  END IF;

  RETURN NEW;
END;
$$;

-- Amankan fungsi trigger
REVOKE ALL ON FUNCTION private.prevent_profile_insert_escalation() FROM PUBLIC;

-- 3) Pasang trigger sebelum INSERT
DROP TRIGGER IF EXISTS lock_profile_insert_trigger ON public.profiles;

CREATE TRIGGER lock_profile_insert_trigger
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION private.prevent_profile_insert_escalation();

COMMENT ON TRIGGER lock_profile_insert_trigger ON public.profiles IS
  'Audit 2026-10-03: cegah pemalsuan role (C1) dan penyisipan school_id sekolah lain (C2)';
