-- ============================================
-- MIGRATION 008: Create financial_summary view + trigger
-- ============================================
CREATE OR REPLACE VIEW public.financial_summary AS
SELECT
  t.school_id,
  date_trunc('month', t.reference_date)::date AS month,
  EXTRACT(YEAR FROM t.reference_date)::integer AS year,
  COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) AS total_income,
  COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS total_expense,
  COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END), 0) AS balance
FROM public.transactions t
GROUP BY t.school_id, date_trunc('month', t.reference_date), EXTRACT(YEAR FROM t.reference_date);

-- SPP summary subview
CREATE OR REPLACE VIEW public.spp_summary AS
SELECT
  school_id,
  year,
  month,
  COUNT(*) FILTER (WHERE status = 'paid') AS paid_count,
  COUNT(*) FILTER (WHERE status IN ('partial', 'unpaid')) AS outstanding_count,
  SUM(amount) AS total_amount,
  SUM(paid_amount) AS total_paid,
  SUM(amount - paid_amount) AS total_outstanding
FROM public.spp_payments
GROUP BY school_id, year, month;
