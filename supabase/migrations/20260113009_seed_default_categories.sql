-- ============================================
-- MIGRATION 009: Seed default categories + trigger
-- ============================================
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
