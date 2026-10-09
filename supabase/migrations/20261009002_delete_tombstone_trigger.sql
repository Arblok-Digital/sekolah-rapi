-- Tombstone otomatis untuk SEMUA penghapusan (jalur online maupun push dari
-- antrian offline). Tanpa trigger ini, device lain tidak pernah tahu baris
-- dihapus (hard delete meninggalkan zombie di mirror IndexedDB).
--
-- Idempoten: push DELETE di client juga menginsert deleted_rows lebih dulu —
-- ON CONFLICT DO NOTHING membuat ganda aman.

CREATE OR REPLACE FUNCTION public.log_deleted_row()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Guard: saat sekolah di-cascade delete, baris schools sudah hilang dan
  -- insert tombstone akan melanggar FK — lewati saja (tak ada device yang
  -- perlu tahu tentang sekolah yang sudah mati).
  IF EXISTS (SELECT 1 FROM public.schools WHERE id = OLD.school_id) THEN
    INSERT INTO public.deleted_rows (school_id, table_name, row_id, deleted_by)
    VALUES (OLD.school_id, TG_TABLE_NAME, OLD.id, auth.uid())
    ON CONFLICT (table_name, row_id) DO NOTHING;
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_students_tombstone ON public.students;
CREATE TRIGGER trg_students_tombstone
  AFTER DELETE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.log_deleted_row();

DROP TRIGGER IF EXISTS trg_spp_payments_tombstone ON public.spp_payments;
CREATE TRIGGER trg_spp_payments_tombstone
  AFTER DELETE ON public.spp_payments
  FOR EACH ROW EXECUTE FUNCTION public.log_deleted_row();

DROP TRIGGER IF EXISTS trg_transactions_tombstone ON public.transactions;
CREATE TRIGGER trg_transactions_tombstone
  AFTER DELETE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.log_deleted_row();

DROP TRIGGER IF EXISTS trg_categories_tombstone ON public.categories;
CREATE TRIGGER trg_categories_tombstone
  AFTER DELETE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.log_deleted_row();
