-- ============================================
-- MIGRATION: Transaction source lineage + reversal support
-- ============================================
-- Menambah kolom lineage di transactions agar auto-transaksi (dari SPP,
-- payroll, inventory) bisa ditelusuri ke record asalnya, dan transaksi
-- koreksi/reversal bisa ditautkan ke transaksi aslinya.
--
-- Nilai source_type:
--   'spp'       -> transaksi income yang dibuat saat SPP lunas (source_id = spp_payments.id)
--   'payroll'   -> transaksi expense yang dibuat saat gaji dibayar (source_id = payroll_records.id)
--   'inventory' -> transaksi expense yang dibuat saat pembelian inventaris (source_id = inventory_items.id)
--   'reversal'  -> transaksi koreksi; source_id = id transaksi asli yang di-reverse

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS source_type TEXT;

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS source_id UUID;

ALTER TABLE public.transactions
  ADD CONSTRAINT transactions_source_type_check
  CHECK (source_type IS NULL OR source_type IN ('spp', 'payroll', 'inventory', 'reversal'));

CREATE INDEX IF NOT EXISTS idx_transactions_source
  ON public.transactions(source_type, source_id);
