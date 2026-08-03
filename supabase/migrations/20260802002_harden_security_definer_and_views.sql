-- ============================================
-- MIGRATION: Harden legacy SECURITY DEFINER functions + secure financial views
-- ============================================
-- C3: Legacy dev functions were SECURITY DEFINER without SET search_path and
--     called is_dev() unqualified, so pg_temp.is_dev() could hijack the check.
--     Now they set search_path = '' and call private.is_dev_user() qualified.
-- C4: financial_summary & spp_summary were plain views (definer semantics), so
--     RLS was bypassed and anon could read every school's financial data.
--     Now they run with security_invoker = true and are granted to authenticated only.

-- ============================================
-- 1. Harden legacy helper functions
-- ============================================
-- public.is_dev() must keep its exact signature: existing RLS policies in
-- 20260113012/013/014 reference it unqualified. Only search_path is hardened;
-- all names inside were already qualified (public.profiles, auth.uid()).
CREATE OR REPLACE FUNCTION public.is_dev()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'dev'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- ============================================
-- 2. Harden dev data management functions (C3)
-- ============================================

CREATE OR REPLACE FUNCTION public.dev_delete_school_data(target_school_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT private.is_dev_user() THEN
    RAISE EXCEPTION 'Access denied: dev role required';
  END IF;

  DELETE FROM public.spp_payments WHERE school_id = target_school_id;
  DELETE FROM public.transactions WHERE school_id = target_school_id;
  DELETE FROM public.students WHERE school_id = target_school_id;
  DELETE FROM public.categories WHERE school_id = target_school_id;
  DELETE FROM public.enrollment_requests WHERE school_id = target_school_id;
  DELETE FROM public.sync_queue WHERE school_id = target_school_id;

  -- Re-seed categories
  INSERT INTO public.categories (school_id, type, name, description, is_default)
  VALUES
    (target_school_id, 'income', 'SPP', 'Pembayaran SPP bulanan', true),
    (target_school_id, 'income', 'Donasi', 'Donasi dari alumni/umum', true),
    (target_school_id, 'income', 'Subsidi', 'Subsidi pemerintah/yayasan', true),
    (target_school_id, 'expense', 'Gaji Guru', 'Penggajian guru dan staff', true),
    (target_school_id, 'expense', 'Operasional', 'Biaya operasional harian', true),
    (target_school_id, 'expense', 'ATK', 'Alat tulis kantor', true),
    (target_school_id, 'expense', 'Listrik/Water', 'Utilitas', true),
    (target_school_id, 'expense', 'Perbaikan', 'Perbaikan gedung/alat', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.dev_nuclear_delete()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT private.is_dev_user() THEN
    RAISE EXCEPTION 'Access denied: dev role required';
  END IF;

  DELETE FROM public.sync_queue;
  DELETE FROM public.spp_payments;
  DELETE FROM public.transactions;
  DELETE FROM public.enrollment_requests;
  DELETE FROM public.students;
  DELETE FROM public.categories;
  DELETE FROM public.profiles;
  DELETE FROM public.schools;
END;
$$;

CREATE OR REPLACE FUNCTION public.dev_set_school_status(target_school_id UUID, new_status TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT private.is_dev_user() THEN
    RAISE EXCEPTION 'Access denied: dev role required';
  END IF;
  UPDATE public.schools SET status = new_status WHERE id = target_school_id;
END;
$$;

-- Return type drifted on the remote DB (text vs local void). Drop before
-- recreating so the hardened definition converges with the local migration.
DROP FUNCTION IF EXISTS public.dev_seed_test_data(UUID);

CREATE OR REPLACE FUNCTION public.dev_seed_test_data(target_school_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  student1_id UUID := gen_random_uuid();
  student2_id UUID := gen_random_uuid();
  student3_id UUID := gen_random_uuid();
  cat_spp_id UUID;
  cat_gaji_id UUID;
BEGIN
  IF NOT private.is_dev_user() THEN
    RAISE EXCEPTION 'Access denied: dev role required';
  END IF;

  -- Get category IDs
  SELECT id INTO cat_spp_id FROM public.categories WHERE school_id = target_school_id AND name = 'SPP' LIMIT 1;
  SELECT id INTO cat_gaji_id FROM public.categories WHERE school_id = target_school_id AND name = 'Gaji Guru' LIMIT 1;

  -- Insert 3 test students
  INSERT INTO public.students (id, school_id, nis, name, class, gender, parent_name, parent_phone, status)
  VALUES
    (student1_id, target_school_id, '2026001', 'Andi Pratama', '7A', 'Laki-laki', 'Budi Pratama', '081234567890', 'active'),
    (student2_id, target_school_id, '2026002', 'Siti Nurhaliza', '7A', 'Perempuan', 'Ahmad Nurhaliz', '081234567891', 'active'),
    (student3_id, target_school_id, '2026003', 'Budi Santoso', '7B', 'Laki-laki', 'Dwi Santoso', '081234567892', 'active');

  -- Insert SPP payments (month 1-7 of 2026)
  INSERT INTO public.spp_payments (school_id, student_id, month, year, amount, paid_amount, status, payment_date, method, recorded_by)
  VALUES
    -- Andi: fully paid 7 months
    (target_school_id, student1_id, 1, 2026, 350000, 350000, 'paid', '2026-01-05', 'Tunai', auth.uid()),
    (target_school_id, student1_id, 2, 2026, 350000, 350000, 'paid', '2026-02-05', 'Tunai', auth.uid()),
    (target_school_id, student1_id, 3, 2026, 350000, 350000, 'paid', '2026-03-05', 'Transfer', auth.uid()),
    (target_school_id, student1_id, 4, 2026, 350000, 350000, 'paid', '2026-04-05', 'Tunai', auth.uid()),
    (target_school_id, student1_id, 5, 2026, 350000, 350000, 'paid', '2026-05-05', 'Transfer', auth.uid()),
    (target_school_id, student1_id, 6, 2026, 350000, 350000, 'paid', '2026-06-05', 'Tunai', auth.uid()),
    (target_school_id, student1_id, 7, 2026, 350000, 350000, 'paid', '2026-07-05', 'Transfer', auth.uid()),
    -- Siti: paid 5, unpaid 2
    (target_school_id, student2_id, 1, 2026, 350000, 350000, 'paid', '2026-01-06', 'Tunai', auth.uid()),
    (target_school_id, student2_id, 2, 2026, 350000, 350000, 'paid', '2026-02-06', 'Tunai', auth.uid()),
    (target_school_id, student2_id, 3, 2026, 350000, 350000, 'paid', '2026-03-06', 'Transfer', auth.uid()),
    (target_school_id, student2_id, 4, 2026, 350000, 350000, 'paid', '2026-04-06', 'Tunai', auth.uid()),
    (target_school_id, student2_id, 5, 2026, 350000, 350000, 'paid', '2026-05-06', 'Tunai', auth.uid()),
    (target_school_id, student2_id, 6, 2026, 350000, 0, 'unpaid', NULL, NULL, auth.uid()),
    (target_school_id, student2_id, 7, 2026, 350000, 0, 'unpaid', NULL, NULL, auth.uid()),
    -- Budi: partial payment in June
    (target_school_id, student3_id, 1, 2026, 350000, 350000, 'paid', '2026-01-07', 'Tunai', auth.uid()),
    (target_school_id, student3_id, 2, 2026, 350000, 350000, 'paid', '2026-02-07', 'Transfer', auth.uid()),
    (target_school_id, student3_id, 3, 2026, 350000, 350000, 'paid', '2026-03-07', 'Tunai', auth.uid()),
    (target_school_id, student3_id, 4, 2026, 350000, 350000, 'paid', '2026-04-07', 'Tunai', auth.uid()),
    (target_school_id, student3_id, 5, 2026, 350000, 200000, 'partial', '2026-05-08', 'Tunai', auth.uid()),
    (target_school_id, student3_id, 6, 2026, 350000, 0, 'unpaid', NULL, NULL, auth.uid()),
    (target_school_id, student3_id, 7, 2026, 350000, 0, 'unpaid', NULL, NULL, auth.uid());

  -- Insert test transactions
  IF cat_spp_id IS NOT NULL AND cat_gaji_id IS NOT NULL THEN
    INSERT INTO public.transactions (school_id, type, category_id, amount, description, reference_date, recorded_by)
    VALUES
      (target_school_id, 'income', cat_spp_id, 350000, 'SPP Andi Pratama - Januari', '2026-01-05', auth.uid()),
      (target_school_id, 'income', cat_spp_id, 350000, 'SPP Siti Nurhaliza - Januari', '2026-01-06', auth.uid()),
      (target_school_id, 'income', cat_spp_id, 350000, 'SPP Budi Santoso - Januari', '2026-01-07', auth.uid()),
      (target_school_id, 'expense', cat_gaji_id, 8500000, 'Gaji Guru Periode Januari', '2026-01-25', auth.uid()),
      (target_school_id, 'income', cat_spp_id, 1050000, 'SPP 3 Siswa - Februari', '2026-02-05', auth.uid()),
      (target_school_id, 'expense', cat_gaji_id, 8500000, 'Gaji Guru Periode Februari', '2026-02-25', auth.uid()),
      (target_school_id, 'income', cat_spp_id, 1050000, 'SPP 3 Siswa - Maret', '2026-03-05', auth.uid()),
      (target_school_id, 'expense', cat_gaji_id, 8500000, 'Gaji Guru Periode Maret', '2026-03-25', auth.uid()),
      (target_school_id, 'income', cat_spp_id, 1050000, 'SPP 3 Siswa - April', '2026-04-05', auth.uid()),
      (target_school_id, 'expense', cat_gaji_id, 8500000, 'Gaji Guru Periode April', '2026-04-25', auth.uid()),
      (target_school_id, 'income', cat_spp_id, 1050000, 'SPP 3 Siswa - Mei', '2026-05-05', auth.uid()),
      (target_school_id, 'expense', cat_gaji_id, 8500000, 'Gaji Guru Periode Mei', '2026-05-25', auth.uid()),
      (target_school_id, 'income', cat_spp_id, 700000, 'SPP Andi + Siti - Juni', '2026-06-05', auth.uid()),
      (target_school_id, 'expense', cat_gaji_id, 8500000, 'Gaji Guru Periode Juni', '2026-06-25', auth.uid()),
      (target_school_id, 'income', cat_spp_id, 350000, 'SPP Andi - Juli', '2026-07-05', auth.uid()),
      (target_school_id, 'expense', cat_gaji_id, 200000, 'Pembelian ATK', '2026-07-10', auth.uid());
  END IF;

  -- Set school status to active
  UPDATE public.schools SET status = 'active' WHERE id = target_school_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.dev_delete_user(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT private.is_dev_user() THEN
    RAISE EXCEPTION 'Access denied: dev role required';
  END IF;

  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot delete yourself';
  END IF;

  DELETE FROM public.spp_payments WHERE school_id IN (SELECT id FROM public.schools WHERE owner_id = target_user_id);
  DELETE FROM public.transactions WHERE school_id IN (SELECT id FROM public.schools WHERE owner_id = target_user_id);
  DELETE FROM public.students WHERE school_id IN (SELECT id FROM public.schools WHERE owner_id = target_user_id);
  DELETE FROM public.categories WHERE school_id IN (SELECT id FROM public.schools WHERE owner_id = target_user_id);
  DELETE FROM public.enrollment_requests WHERE school_id IN (SELECT id FROM public.schools WHERE owner_id = target_user_id);
  DELETE FROM public.sync_queue WHERE school_id IN (SELECT id FROM public.schools WHERE owner_id = target_user_id);
  DELETE FROM public.inventory_items WHERE school_id IN (SELECT id FROM public.schools WHERE owner_id = target_user_id);
  DELETE FROM public.employees WHERE school_id IN (SELECT id FROM public.schools WHERE owner_id = target_user_id);
  DELETE FROM public.payroll_records WHERE school_id IN (SELECT id FROM public.schools WHERE owner_id = target_user_id);
  DELETE FROM public.schools WHERE owner_id = target_user_id;
  DELETE FROM public.profiles WHERE id = target_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.dev_reject_school(target_school_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT private.is_dev_user() THEN
    RAISE EXCEPTION 'Access denied: dev role required';
  END IF;
  UPDATE public.schools SET status = 'rejected' WHERE id = target_school_id;
END;
$$;

-- Dev functions stay callable from the dev panel (authenticated RPC calls),
-- but are removed from PUBLIC so anon/others cannot invoke them.
REVOKE ALL ON FUNCTION public.dev_delete_school_data(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.dev_nuclear_delete() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.dev_set_school_status(UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.dev_seed_test_data(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.dev_delete_user(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.dev_reject_school(UUID) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.dev_delete_school_data(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.dev_nuclear_delete() TO authenticated;
GRANT EXECUTE ON FUNCTION public.dev_set_school_status(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.dev_seed_test_data(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.dev_delete_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.dev_reject_school(UUID) TO authenticated;

-- ============================================
-- 3. Harden seed_school_categories trigger function (audit H5)
-- ============================================
-- Trigger runs after INSERT on schools; with RLS on categories the invoker
-- cannot insert default categories yet (their profile does not reference the
-- brand-new school). SECURITY DEFINER + empty search_path lets the seed run.
CREATE OR REPLACE FUNCTION public.seed_school_categories()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.categories (school_id, type, name, description, is_default)
  VALUES
    (NEW.id, 'income', 'SPP', 'Pembayaran SPP bulanan', true),
    (NEW.id, 'income', 'Donasi', 'Donasi dari alumni/umum', true),
    (NEW.id, 'income', 'Subsidi', 'Subsidi pemerintah/yayasan', true),
    (NEW.id, 'expense', 'Gaji Guru', 'Penggajian guru dan staff', true),
    (NEW.id, 'expense', 'Operasional', 'Biaya operasional harian', true),
    (NEW.id, 'expense', 'ATK', 'Alat tulis kantor', true),
    (NEW.id, 'expense', 'Listrik/Water', 'Utilitas', true),
    (NEW.id, 'expense', 'Perbaikan', 'Perbaikan gedung/alat', true);
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.seed_school_categories() FROM PUBLIC;

-- ============================================
-- 4. Secure financial views (C4)
-- ============================================
-- security_invoker re-applies RLS on the underlying transactions/spp_payments
-- tables per querying role, so users only see their own school's data.
ALTER VIEW public.financial_summary SET (security_invoker = true);
ALTER VIEW public.spp_summary SET (security_invoker = true);

REVOKE SELECT ON public.financial_summary FROM anon;
REVOKE SELECT ON public.spp_summary FROM anon;
GRANT SELECT ON public.financial_summary TO authenticated;
GRANT SELECT ON public.spp_summary TO authenticated;
