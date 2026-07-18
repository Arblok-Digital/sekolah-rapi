-- ============================================
-- FIX RLS + REGISTER FLOW
-- ============================================

-- 1. Enable RLS on schools & profiles (missing from migration 010)
ALTER TABLE IF EXISTS public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop and recreate the trigger function for schools (fix duplicate)
DROP TRIGGER IF EXISTS schools_updated_at_trigger ON public.schools;
DROP TRIGGER IF EXISTS after_school_create ON public.schools;
DROP FUNCTION IF EXISTS seed_school_categories();

-- 3. Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

-- 4. Schools policies
DROP POLICY IF EXISTS "Users can view own school" ON public.schools;
CREATE POLICY "Users can view own school" ON public.schools
  FOR SELECT USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert school" ON public.schools;
CREATE POLICY "Users can insert school" ON public.schools
  FOR INSERT WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own school" ON public.schools;
CREATE POLICY "Users can update own school" ON public.schools
  FOR UPDATE USING (owner_id = auth.uid());

-- 5. Recreate seed_categories trigger
CREATE OR REPLACE FUNCTION seed_school_categories()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS after_school_create ON public.schools;
CREATE TRIGGER after_school_create
  AFTER INSERT ON public.schools
  FOR EACH ROW EXECUTE FUNCTION seed_school_categories();

-- 6. Add INSERT policies for other tables (for future use)
DROP POLICY IF EXISTS "Users can insert own school students" ON public.students;
CREATE POLICY "Users can insert own school students" ON public.students
  FOR INSERT WITH CHECK (school_id = ANY(get_user_school_ids()));

DROP POLICY IF EXISTS "Users can insert own school transactions" ON public.transactions;
CREATE POLICY "Users can insert own school transactions" ON public.transactions
  FOR INSERT WITH CHECK (school_id = ANY(get_user_school_ids()));

DROP POLICY IF EXISTS "Users can insert own school spp" ON public.spp_payments;
CREATE POLICY "Users can insert own school spp" ON public.spp_payments
  FOR INSERT WITH CHECK (school_id = ANY(get_user_school_ids()));

-- 7. Public access for registration (anon can check if email exists)
-- This is handled by Supabase Auth directly

-- 8. Enable email confirmations off for testing
-- (handled via supabase settings, not SQL)
