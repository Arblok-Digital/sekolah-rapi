-- ============================================
-- MIGRATION 010: RLS Policies + helper
-- ============================================

-- Enable RLS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spp_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Helper: get user's school_id
CREATE OR REPLACE FUNCTION get_user_school_ids()
RETURNS UUID[] AS $$
BEGIN
  RETURN (
    SELECT array_agg(school_id)
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Students policies
CREATE POLICY "Users can view own school students" ON public.students
  FOR SELECT USING (
    school_id = ANY(get_user_school_ids())
  );

-- SPP payments policies
CREATE POLICY "Users can view own school spp" ON public.spp_payments
  FOR SELECT USING (
    school_id = ANY(get_user_school_ids())
  );

-- Transactions policies
CREATE POLICY "Users can view own school transactions" ON public.transactions
  FOR SELECT USING (
    school_id = ANY(get_user_school_ids())
  );

-- Categories policies
CREATE POLICY "Users can view own school categories" ON public.categories
  FOR SELECT USING (
    school_id = ANY(get_user_school_ids())
  );
