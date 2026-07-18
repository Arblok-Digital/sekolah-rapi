-- ============================================
-- MIGRATION 004: Create SPP payments table
-- ============================================
CREATE TABLE IF NOT EXISTS public.spp_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  paid_amount NUMERIC(12,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'unpaid',
  payment_date DATE,
  method TEXT,
  receipt_number TEXT,
  recorded_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_spp_school_id ON public.spp_payments(school_id);
CREATE INDEX IF NOT EXISTS idx_spp_student_id ON public.spp_payments(student_id);
CREATE INDEX IF NOT EXISTS idx_spp_month_year ON public.spp_payments(month, year);
CREATE INDEX IF NOT EXISTS idx_spp_status ON public.spp_payments(status);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_spp_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER spp_payments_updated_at_trigger
  BEFORE UPDATE ON public.spp_payments
  FOR EACH ROW EXECUTE FUNCTION update_spp_payments_updated_at();
