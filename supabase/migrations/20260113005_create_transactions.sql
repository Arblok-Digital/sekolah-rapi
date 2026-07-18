-- ============================================
-- MIGRATION 005: Create transactions table
-- ============================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category_id UUID NOT NULL REFERENCES public.categories(id),
  amount NUMERIC(12,2) NOT NULL,
  description TEXT,
  reference_date DATE NOT NULL,
  proof_url TEXT,
  recorded_by UUID NOT NULL REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_school_id ON public.transactions(school_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON public.transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_reference_date ON public.transactions(reference_date);
CREATE INDEX IF NOT EXISTS idx_transactions_approved_by ON public.transactions(approved_by);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transactions_updated_at_trigger
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION update_transactions_updated_at();
