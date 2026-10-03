-- =============================================
-- MIGRATION: Kategori pada pembayaran siswa (tab "Keuangan Siswa")
--   1) spp_payments.category_id  -> kategori kas yang dipakai saat masuk Kas
--   2) bulan/tahun jadi OPSIONAL -> pembayaran sekali jadi (seragam, daftar ulang, jemputan)
--   3) unique bill kini per kategori -> 1 siswa boleh punya SPP + Seragam di bulan sama
-- =============================================

-- 1) Kolom kategori
ALTER TABLE public.spp_payments
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.categories(id);

-- 2) Backfill: tagihan lama semuanya memang SPP -> arahkan ke kategori 'SPP'
--    (kategori 'SPP' dipastikan ada untuk setiap sekolah yang punya tagihan)
INSERT INTO public.categories (school_id, type, name, description, is_default)
SELECT DISTINCT p.school_id, 'income', 'SPP', 'Pembayaran SPP bulanan', true
FROM public.spp_payments p
WHERE NOT EXISTS (
  SELECT 1 FROM public.categories c
  WHERE c.school_id = p.school_id AND c.name = 'SPP'
);

UPDATE public.spp_payments p
SET category_id = c.id
FROM public.categories c
WHERE p.category_id IS NULL
  AND c.school_id = p.school_id
  AND c.name = 'SPP';

-- 3) Bulan/tahun opsional (pembayaran non-bulanan dibiarkan kosong)
ALTER TABLE public.spp_payments ALTER COLUMN month DROP NOT NULL;
ALTER TABLE public.spp_payments ALTER COLUMN year DROP NOT NULL;

-- 4) Unique bill per kategori: satu siswa hanya boleh punya SATU tagihan
--    per kategori per bulan. (NULL bulan/tahun tidak ikut terikat — Postgres
--    memperlakukan NULL sebagai distinct, jadi pembayaran sekali jadi boleh
--    lebih dari satu.)
DROP INDEX IF EXISTS public.idx_spp_unique_bill;

CREATE UNIQUE INDEX IF NOT EXISTS idx_spp_unique_bill
  ON public.spp_payments(school_id, student_id, category_id, month, year);
