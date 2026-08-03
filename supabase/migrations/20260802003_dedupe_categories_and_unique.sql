-- ============================================
-- MIGRATION: Deduplicate categories + unique constraint
-- ============================================
-- Fixes the category seeding race: both the DB trigger (20260113011) and the
-- onboarding flow inserted default categories, leaving schools with duplicate
-- rows. Duplicate rows broke .single() lookups in spp/payroll/inventory, which
-- silently skipped auto-created ledger entries (SPP income never hit the kas).

-- 1. Remove duplicate categories, keeping the preferred row per
--    (school_id, type, name): is_default=true first, then earliest created_at,
--    then lowest id. Rows referenced by transactions are never deleted.
WITH ranked AS (
  SELECT
    c.id,
    row_number() OVER (
      PARTITION BY c.school_id, c.type, c.name
      ORDER BY c.is_default DESC, c.created_at ASC, c.id ASC
    ) AS rn
  FROM public.categories c
)
DELETE FROM public.categories c
USING ranked r
WHERE c.id = r.id
  AND r.rn > 1
  AND NOT EXISTS (SELECT 1 FROM public.transactions t WHERE t.category_id = c.id);

-- 2. Prevent future duplicates from the auto-create paths (SPP/Gaji Guru/ATK).
ALTER TABLE public.categories
  ADD CONSTRAINT categories_school_type_name_key UNIQUE (school_id, type, name);
