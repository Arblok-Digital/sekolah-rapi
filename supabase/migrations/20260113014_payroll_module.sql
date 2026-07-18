-- ============================================
-- MIGRATION 014: Payroll Module
-- ============================================

CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position TEXT NOT NULL DEFAULT 'Guru',
  phone TEXT,
  base_salary NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payroll_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  base_salary NUMERIC(12,2) NOT NULL DEFAULT 0,
  bonus NUMERIC(12,2) DEFAULT 0,
  deduction NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  paid BOOLEAN DEFAULT false,
  paid_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "school_select_employees" ON public.employees
  FOR SELECT USING (school_id IN (SELECT school_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "school_insert_employees" ON public.employees
  FOR INSERT WITH CHECK (school_id IN (SELECT school_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "school_update_employees" ON public.employees
  FOR UPDATE USING (school_id IN (SELECT school_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "school_delete_employees" ON public.employees
  FOR DELETE USING (school_id IN (SELECT school_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "dev_all_employees" ON public.employees
  FOR ALL USING (is_dev());

CREATE POLICY "school_select_payroll" ON public.payroll_records
  FOR SELECT USING (school_id IN (SELECT school_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "school_insert_payroll" ON public.payroll_records
  FOR INSERT WITH CHECK (school_id IN (SELECT school_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "school_update_payroll" ON public.payroll_records
  FOR UPDATE USING (school_id IN (SELECT school_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "school_delete_payroll" ON public.payroll_records
  FOR DELETE USING (school_id IN (SELECT school_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "dev_all_payroll" ON public.payroll_records
  FOR ALL USING (is_dev());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_employees_school ON public.employees(school_id);
CREATE INDEX IF NOT EXISTS idx_payroll_school ON public.payroll_records(school_id);
CREATE INDEX IF NOT EXISTS idx_payroll_employee ON public.payroll_records(employee_id);
