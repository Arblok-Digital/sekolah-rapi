-- ============================================
-- MIGRATION 012: Dev Mode + School Status + Enrollment + RLS Overhaul
-- ============================================

-- 1. Add 'status' column to schools (pending/active/suspended/archived)
ALTER TABLE public.schools
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'
  CHECK (status IN ('pending', 'active', 'suspended', 'archived'));

-- 2. Add 'avatar_url' to profiles for future use
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 3. Create enrollment_requests table (public pendaftaran online)
CREATE TABLE IF NOT EXISTS public.enrollment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,

  -- Data siswa
  student_name TEXT NOT NULL,
  nis TEXT,
  class TEXT NOT NULL,
  gender TEXT,
  address TEXT,
  birth_date DATE,
  birth_place TEXT,

  -- Data orang tua
  parent_name TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  parent_email TEXT,
  parent_occupation TEXT,

  -- Berkas (JSON array of {type, url})
  documents JSONB DEFAULT '[]',

  -- Status
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMPTZ,

  -- Meta
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_enrollment_school ON public.enrollment_requests(school_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_status ON public.enrollment_requests(status);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_enrollment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enrollment_requests_updated_at_trigger
  BEFORE UPDATE ON public.enrollment_requests
  FOR EACH ROW EXECUTE FUNCTION update_enrollment_updated_at();

-- 4. Helper: check if current user is dev
CREATE OR REPLACE FUNCTION is_dev()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'dev'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 5. Helper: get user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================
-- 6. RLS POLICIES — COMPLETE OVERHAUL
-- ============================================

-- Drop ALL old policies first (clean slate)
DO $$
DECLARE
  _tbl TEXT;
  _pol TEXT;
BEGIN
  FOR _tbl IN SELECT unnest(ARRAY['schools', 'profiles', 'students', 'spp_payments', 'transactions', 'categories', 'enrollment_requests']) LOOP
    FOR _pol IN SELECT policyname FROM pg_policies WHERE tablename = _tbl LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', _pol, _tbl);
    END LOOP;
  END LOOP;
END $$;

-- ── SCHOOLS ──
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dev: full access to schools" ON public.schools
  FOR ALL USING (is_dev());

CREATE POLICY "Users can view own school" ON public.schools
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can insert own school" ON public.schools
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own school" ON public.schools
  FOR UPDATE USING (owner_id = auth.uid());

-- ── PROFILES ──
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dev: full access to profiles" ON public.profiles
  FOR ALL USING (is_dev());

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

-- ── STUDENTS ──
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dev: full access to students" ON public.students
  FOR ALL USING (is_dev());

CREATE POLICY "Users can view own school students" ON public.students
  FOR SELECT USING (school_id = ANY(get_user_school_ids()));

CREATE POLICY "Users can insert own school students" ON public.students
  FOR INSERT WITH CHECK (school_id = ANY(get_user_school_ids()));

CREATE POLICY "Users can update own school students" ON public.students
  FOR UPDATE USING (school_id = ANY(get_user_school_ids()));

CREATE POLICY "Users can delete own school students" ON public.students
  FOR DELETE USING (school_id = ANY(get_user_school_ids()));

-- ── SPP PAYMENTS ──
ALTER TABLE public.spp_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dev: full access to spp_payments" ON public.spp_payments
  FOR ALL USING (is_dev());

CREATE POLICY "Users can view own school spp" ON public.spp_payments
  FOR SELECT USING (school_id = ANY(get_user_school_ids()));

CREATE POLICY "Users can insert own school spp" ON public.spp_payments
  FOR INSERT WITH CHECK (school_id = ANY(get_user_school_ids()));

CREATE POLICY "Users can update own school spp" ON public.spp_payments
  FOR UPDATE USING (school_id = ANY(get_user_school_ids()));

CREATE POLICY "Users can delete own school spp" ON public.spp_payments
  FOR DELETE USING (school_id = ANY(get_user_school_ids()));

-- ── TRANSACTIONS ──
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dev: full access to transactions" ON public.transactions
  FOR ALL USING (is_dev());

CREATE POLICY "Users can view own school transactions" ON public.transactions
  FOR SELECT USING (school_id = ANY(get_user_school_ids()));

CREATE POLICY "Users can insert own school transactions" ON public.transactions
  FOR INSERT WITH CHECK (school_id = ANY(get_user_school_ids()));

CREATE POLICY "Users can update own school transactions" ON public.transactions
  FOR UPDATE USING (school_id = ANY(get_user_school_ids()));

CREATE POLICY "Users can delete own school transactions" ON public.transactions
  FOR DELETE USING (school_id = ANY(get_user_school_ids()));

-- ── CATEGORIES ──
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dev: full access to categories" ON public.categories
  FOR ALL USING (is_dev());

CREATE POLICY "Users can view own school categories" ON public.categories
  FOR SELECT USING (school_id = ANY(get_user_school_ids()));

CREATE POLICY "Users can insert own school categories" ON public.categories
  FOR INSERT WITH CHECK (school_id = ANY(get_user_school_ids()));

-- ── ENROLLMENT REQUESTS ──
ALTER TABLE public.enrollment_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dev: full access to enrollments" ON public.enrollment_requests
  FOR ALL USING (is_dev());

CREATE POLICY "Anyone can submit enrollment" ON public.enrollment_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own school enrollments" ON public.enrollment_requests
  FOR SELECT USING (school_id = ANY(get_user_school_ids()));

CREATE POLICY "Users can update own school enrollments" ON public.enrollment_requests
  FOR UPDATE USING (school_id = ANY(get_user_school_ids()));

-- ── SYNC QUEUE ──
ALTER TABLE public.sync_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dev: full access to sync_queue" ON public.sync_queue
  FOR ALL USING (is_dev());

CREATE POLICY "Users can manage own sync queue" ON public.sync_queue
  FOR ALL USING (user_id = auth.uid());

-- ============================================
-- 7. Dev data management functions
-- ============================================

-- Delete all test data for a school (dev only)
CREATE OR REPLACE FUNCTION dev_delete_school_data(target_school_id UUID)
RETURNS VOID AS $$
BEGIN
  IF NOT is_dev() THEN
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Delete EVERYTHING (dev only — nuclear option)
CREATE OR REPLACE FUNCTION dev_nuclear_delete()
RETURNS VOID AS $$
BEGIN
  IF NOT is_dev() THEN
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Toggle school status (dev only)
CREATE OR REPLACE FUNCTION dev_set_school_status(target_school_id UUID, new_status TEXT)
RETURNS VOID AS $$
BEGIN
  IF NOT is_dev() THEN
    RAISE EXCEPTION 'Access denied: dev role required';
  END IF;
  UPDATE public.schools SET status = new_status WHERE id = target_school_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Seed test data for a school (dev only)
CREATE OR REPLACE FUNCTION dev_seed_test_data(target_school_id UUID)
RETURNS VOID AS $$
DECLARE
  student1_id UUID := gen_random_uuid();
  student2_id UUID := gen_random_uuid();
  student3_id UUID := gen_random_uuid();
  cat_spp_id UUID;
  cat_gaji_id UUID;
BEGIN
  IF NOT is_dev() THEN
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
      -- Last transaction: Pembelian ATK (category_id must be UUID, not amount)
      (target_school_id, 'expense', cat_gaji_id, 200000, 'Pembelian ATK', '2026-07-10', auth.uid());
  END IF;

  -- Set school status to active
  UPDATE public.schools SET status = 'active' WHERE id = target_school_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
