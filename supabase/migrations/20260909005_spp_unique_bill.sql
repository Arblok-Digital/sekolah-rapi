-- ============================================
-- MIGRATION 033: SPP bulan-siswa unik per sekolah
-- Mencegah tagihan SPP ganda untuk siswa+bulan+tahun yang sama
-- (dipasang setelah verifikasi tidak ada duplikat pada data existing)
-- ============================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_spp_unique_bill
  ON public.spp_payments(school_id, student_id, month, year);