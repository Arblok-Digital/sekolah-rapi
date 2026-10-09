-- ============================================
-- MIGRATION: Offline sync foundation (Fase 1)
--
-- Tujuan: aplikasi bisa baca/tulis lokal (Dexie) saat offline lalu
-- disinkronkan dua arah saat kembali online.
--
-- Isi:
-- 1. categories: updated_at + trigger (satu-satunya tabel inti tanpa ini)
-- 2. device_id: penanda perangkat yang menulis baris (diagnosis konflik)
-- 3. deleted_rows: tombstone — hard delete tetap terlihat oleh sync pull
--    di perangkat lain (tanpa tombstone, baris yang dihapus di 1 device
--    tidak pernah hilang dari mirror device lain)
-- 4. Index (school_id, updated_at) — jalur query utama pull
--
-- CATATAN DEPLOY: migration ini HARUS dijalankan SEBELUM kode client yang
-- mengirim kolom device_id, atau push offline akan gagal "column not found".
-- ============================================

-- ── 1. categories.updated_at ──────────────────────────────────────────────
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS categories_updated_at_trigger ON public.categories;
CREATE TRIGGER categories_updated_at_trigger
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION update_categories_updated_at();

-- ── 2. device_id (penulis terakhir, untuk audit konflik LWW) ───────────────
ALTER TABLE public.students      ADD COLUMN IF NOT EXISTS device_id TEXT;
ALTER TABLE public.spp_payments  ADD COLUMN IF NOT EXISTS device_id TEXT;
ALTER TABLE public.transactions  ADD COLUMN IF NOT EXISTS device_id TEXT;
ALTER TABLE public.categories    ADD COLUMN IF NOT EXISTS device_id TEXT;

-- ── 3. Tombstone: siapa menghapus apa, kapan ──────────────────────────────
-- Push DELETE = insert sini dulu (idempotent via UNIQUE), lalu hard delete
-- baris aslinya. Pull membaca tabel ini dan menghapus baris di mirror lokal
-- perangkat lain. Tabel ini bersifat append-only (tanpa UPDATE/DELETE policy
-- untuk user biasa).
CREATE TABLE IF NOT EXISTS public.deleted_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL CHECK (table_name IN ('students', 'spp_payments', 'transactions', 'categories')),
  row_id UUID NOT NULL,
  deleted_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (table_name, row_id)
);

CREATE INDEX IF NOT EXISTS idx_deleted_rows_school_sync
  ON public.deleted_rows(school_id, deleted_at);

ALTER TABLE public.deleted_rows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Dev: full access to deleted_rows" ON public.deleted_rows;
CREATE POLICY "Dev: full access to deleted_rows" ON public.deleted_rows
  FOR ALL USING (is_dev());

DROP POLICY IF EXISTS "Users can view own school deleted_rows" ON public.deleted_rows;
CREATE POLICY "Users can view own school deleted_rows" ON public.deleted_rows
  FOR SELECT USING (school_id = ANY(get_user_school_ids()));

DROP POLICY IF EXISTS "Users can insert own school deleted_rows" ON public.deleted_rows;
CREATE POLICY "Users can insert own school deleted_rows" ON public.deleted_rows
  FOR INSERT WITH CHECK (school_id = ANY(get_user_school_ids()));

-- Samakan privilese dengan tabel domain lain: anon tidak boleh sentuh.
REVOKE ALL ON public.deleted_rows FROM anon;
GRANT SELECT, INSERT ON public.deleted_rows TO authenticated;

-- ── 4. Index jalur pull: WHERE school_id = ? AND updated_at > ? ──────────
CREATE INDEX IF NOT EXISTS idx_students_school_updated
  ON public.students(school_id, updated_at);
CREATE INDEX IF NOT EXISTS idx_spp_payments_school_updated
  ON public.spp_payments(school_id, updated_at);
CREATE INDEX IF NOT EXISTS idx_transactions_school_updated
  ON public.transactions(school_id, updated_at);
CREATE INDEX IF NOT EXISTS idx_categories_school_updated
  ON public.categories(school_id, updated_at);
