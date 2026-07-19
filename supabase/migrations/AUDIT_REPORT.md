# SekolahRapi — Supabase Migration Audit Report
**Date:** 2026-07-19  
**Migrations Audited:** 15 files (20260113001–20260718001)

---

## 🔴 CRITICAL (3 issues)

### C-1: Migration Ordering Violation — transactions FK to categories
- **File:** `20260113005_create_transactions.sql`, line 8
- **Issue:** `category_id UUID NOT NULL REFERENCES public.categories(id)` — but `categories` table is created in migration 006, which runs AFTER this migration. **Migration 005 will FAIL on a clean database.**
- **Fix:** Either swap migration 005 and 006 order, or make `category_id` nullable initially and add the FK constraint via ALTER TABLE in migration 006+.

### C-2: seed_school_categories() missing SECURITY DEFINER — breaks school creation
- **File:** `20260113011_fix_rls_register.sql`, lines 41-56
- **Issue:** The `seed_school_categories()` function is recreated without `SECURITY DEFINER`. After RLS is enabled on `categories` (migration 010/012), the AFTER INSERT trigger on `schools` will fail because: (1) user creates school, (2) trigger fires, (3) tries INSERT into `categories` with `school_id = NEW.id`, (4) RLS checks `get_user_school_ids()` but the user's profile doesn't yet have this school_id → **INSERT DENIED**.
- **Fix:** Add `SECURITY DEFINER` to the function:
  ```sql
  $$ LANGUAGE plpgsql SECURITY DEFINER;
  ```

### C-3: dev_delete_school_data() & dev_nuclear_delete() missing inventory/payroll tables
- **File:** `20260113012_dev_mode_enrollment.sql`, lines 221-266
- **Issue:** Both `dev_delete_school_data()` and `dev_nuclear_delete()` do NOT delete from `inventory_items`, `employees`, or `payroll_records`. After calling these functions, orphaned data remains in those tables.
- **Fix:** Add these deletes before the re-seed in `dev_delete_school_data()`:
  ```sql
  DELETE FROM public.payroll_records WHERE school_id = target_school_id;
  DELETE FROM public.employees WHERE school_id = target_school_id;
  DELETE FROM public.inventory_items WHERE school_id = target_school_id;
  ```
  And similarly in `dev_nuclear_delete()`.

---

## 🟠 HIGH (5 issues)

### H-1: Categories table missing UPDATE and DELETE RLS policies
- **File:** `20260113012_dev_mode_enrollment.sql`, lines 186-190
- **Issue:** After the RLS overhaul, `categories` has policies for Dev ALL, SELECT, and INSERT — but **NO UPDATE or DELETE policies** for school owners. Users cannot edit or remove their own categories.
- **Fix:** Add after line 190:
  ```sql
  CREATE POLICY "Users can update own school categories" ON public.categories
    FOR UPDATE USING (school_id = ANY(get_user_school_ids()));
  CREATE POLICY "Users can delete own school categories" ON public.categories
    FOR DELETE USING (school_id = ANY(get_user_school_ids()));
  ```

### H-2: dev_seed_test_data() — category mapping bug (Pembelian ATK uses Gaji Guru)
- **File:** `20260113012_dev_mode_enrollment.sql`, line 351-352
- **Issue:** The last transaction inserts "Pembelian ATK" (office supplies purchase) using `cat_gaji_id` (Gaji Guru / salary category) instead of the ATK category. There's no `cat_atk_id` variable declared.
- **Fix:** Add a variable and query:
  ```sql
  cat_atk_id UUID;
  -- In BEGIN block:
  SELECT id INTO cat_atk_id FROM public.categories WHERE school_id = target_school_id AND name = 'ATK' LIMIT 1;
  -- Line 352: change cat_gaji_id to COALESCE(cat_atk_id, cat_gaji_id)
  ```

### H-3: Financial summary VIEW — month column type mismatch with spp_summary
- **File:** `20260113008_create_financial_summary.sql`, line 7
- **Issue:** `financial_summary.month` is `DATE` (from `date_trunc(...)::date`), while `spp_summary.month` is `INTEGER` (from `spp_payments.month`). Frontend cannot JOIN these views on `month` without casting.
- **Fix:** Change line 7 to return INTEGER for consistency:
  ```sql
  EXTRACT(MONTH FROM t.reference_date)::integer AS month,
  ```
  And remove `EXTRACT(YEAR ...)` duplication since `year` can be derived from `month` context.

### H-4: spp_payments missing UNIQUE constraint — allows duplicate records
- **File:** `20260113004_create_spp_payments.sql`
- **Issue:** No UNIQUE constraint on `(school_id, student_id, month, year)`. Application can accidentally create multiple payment records for the same student/month/year.
- **Fix:** Add after line 25:
  ```sql
  ALTER TABLE public.spp_payments ADD CONSTRAINT uq_spp_student_month_year 
    UNIQUE (school_id, student_id, month, year);
  ```

### H-5: dev_delete_user() doesn't remove auth.users record
- **File:** `20260718001_dev_delete_user.sql`
- **Issue:** Function deletes from all public tables but does NOT delete the auth user (`auth.users`). This leaves orphaned auth accounts that can still sign in.
- **Fix:** Add at the end:
  ```sql
  -- Requires service_role key; auth.admin API is needed
  -- SELECT auth.admin.delete_user(target_user_id);
  -- OR: document that auth user deletion must be done via Supabase dashboard
  ```
  Alternatively, add a comment noting this requires admin API call from backend.

---

## 🟡 MEDIUM (8 issues)

### M-1: spp_payments.status missing CHECK constraint
- **File:** `20260113004_create_spp_payments.sql`, line 12
- **Issue:** `status TEXT NOT NULL DEFAULT 'unpaid'` — no CHECK constraint. App uses 'paid', 'unpaid', 'partial' but invalid values can be inserted.
- **Fix:** Add:
  ```sql
  CHECK (status IN ('unpaid', 'partial', 'paid'))
  ```

### M-2: students.status and students.gender missing CHECK constraints
- **File:** `20260113003_create_students.sql`, lines 10, 14
- **Issue:** Both `gender` and `status` are free TEXT with no validation. Expected values: gender = ('Laki-laki', 'Perempuan'), status = ('active', 'inactive', 'graduated', 'transferred').
- **Fix:**
  ```sql
  gender TEXT CHECK (gender IN ('Laki-laki', 'Perempuan', '')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated', 'transferred'))
  ```

### M-3: profiles.role missing CHECK constraint
- **File:** `20260113002_create_profiles.sql`, line 7
- **Issue:** `role TEXT NOT NULL DEFAULT 'staff'` — no CHECK constraint. App uses 'dev', 'owner', 'staff', 'teacher'.
- **Fix:** Add:
  ```sql
  CHECK (role IN ('dev', 'owner', 'staff', 'teacher'))
  ```

### M-4: students missing UNIQUE constraint on (school_id, nis)
- **File:** `20260113003_create_students.sql`
- **Issue:** No unique constraint on `(school_id, nis)`. Duplicate student IDs can be created for the same school.
- **Fix:** Add:
  ```sql
  ALTER TABLE public.students ADD CONSTRAINT uq_students_school_nis 
    UNIQUE (school_id, nis);
  ```

### M-5: inventory_items missing updated_at trigger
- **File:** `20260113013_inventory_module.sql`, line 16-17
- **Issue:** Table has `updated_at TIMESTAMPTZ DEFAULT now()` column but NO trigger to auto-update it. All other tables with `updated_at` have a trigger.
- **Fix:** Add trigger:
  ```sql
  CREATE TRIGGER inventory_items_updated_at_trigger
    BEFORE UPDATE ON public.inventory_items
    FOR EACH ROW EXECUTE FUNCTION update_inventory_updated_at();
  -- (requires creating the update function first)
  ```

### M-6: employees table missing updated_at trigger
- **File:** `20260113014_payroll_module.sql`, lines 13-14
- **Issue:** Has `updated_at` column but no trigger.
- **Fix:** Same pattern as other tables — create function + trigger.

### M-7: payroll_records missing updated_at column entirely
- **File:** `20260113014_payroll_module.sql`, line 30
- **Issue:** Table only has `created_at`, no `updated_at`. If payroll records are ever edited (e.g., marking as paid), there's no audit trail.
- **Fix:** Add `updated_at TIMESTAMPTZ DEFAULT now()` column + trigger.

### M-8: payroll_records delete order in dev_delete_user is reversed
- **File:** `20260718001_dev_delete_user.sql`, lines 19-20
- **Issue:** `employees` is deleted (line 19) BEFORE `payroll_records` (line 20). Due to ON DELETE CASCADE, `payroll_records` rows are already gone by line 20. While not an error, the correct order for manual deletes should be child-first.
- **Fix:** Swap lines 19-20: delete `payroll_records` before `employees`.

---

## 🔵 LOW (5 issues)

### L-1: Missing index on spp_payments.recorded_by
- **File:** `20260113004_create_spp_payments.sql`
- **Issue:** `recorded_by UUID NOT NULL REFERENCES auth.users(id)` has no index. If queries filter by who recorded payments, this will be slow.
- **Fix:** Add:
  ```sql
  CREATE INDEX IF NOT EXISTS idx_spp_recorded_by ON public.spp_payments(recorded_by);
  ```

### L-2: Missing index on transactions.recorded_by
- **File:** `20260113005_create_transactions.sql`
- **Issue:** Same as L-1 — `recorded_by` FK has no index.
- **Fix:** Add:
  ```sql
  CREATE INDEX IF NOT EXISTS idx_transactions_recorded_by ON public.transactions(recorded_by);
  ```

### L-3: RLS policy style inconsistency between migrations
- **Files:** Migration 012 vs 013/014
- **Issue:** Migration 012 uses `school_id = ANY(get_user_school_ids())` helper function. Migrations 013 and 014 use inline subquery `school_id IN (SELECT school_id FROM public.profiles WHERE id = auth.uid())`. Functionally equivalent but inconsistent.
- **Fix:** Standardize on `get_user_school_ids()` for all tables.

### L-4: dev_delete_user() missing cleanup for enrollment_requests via student cascade
- **File:** `20260718001_dev_delete_user.sql`
- **Issue:** `enrollment_requests` delete uses `school_id IN (SELECT id FROM schools WHERE owner_id = target_user_id)` — correct. But the function also misses the `inventory_items` → `employees` → `payroll_records` chain (already noted in C-3).

### L-5: sync_queue table has no RLS policies in migration 010
- **File:** `20260113010_rls_policies.sql`
- **Issue:** `sync_queue` RLS is enabled here (not in this file actually — migration 010 only enables RLS on students/spp_payments/transactions/categories). The sync_queue RLS is handled later in migration 012. Not a bug but the gap is confusing.

---

## 📋 Summary Table

| Severity | Count | Status |
|----------|-------|--------|
| 🔴 CRITICAL | 3 | Blocks clean DB setup, breaks school creation, orphaned data |
| 🟠 HIGH | 5 | Data integrity / category bugs / type mismatch |
| 🟡 MEDIUM | 8 | Missing constraints, triggers, audit columns |
| 🔵 LOW | 5 | Indexes, style inconsistency |
| **Total** | **21** | |

---

## ✅ What Works Well

1. **Trigger pattern** — `updated_at` triggers are consistently applied on core tables (schools, profiles, students, spp_payments, transactions)
2. **Helper functions** — `is_dev()`, `get_user_role()`, `get_user_school_ids()` are well-designed
3. **Dev mode architecture** — SECURITY DEFINER functions with role checks are solid
4. **Indexes** — Foreign keys generally have corresponding indexes
5. **RLS overhaul (migration 012)** — Clean slate approach with comprehensive policy recreation is good practice
6. **Enrollment requests** — Well-structured table with proper status lifecycle

---

## 🔧 Recommended Fix Order

1. **Fix C-1** (swap migrations 005/006) — prevents total failure
2. **Fix C-2** (add SECURITY DEFINER to seed function) — prevents school creation failure  
3. **Fix C-3** (add missing tables to delete functions) — prevents orphaned data
4. **Fix H-1** (add UPDATE/DELETE RLS for categories) — restores category management
5. **Fix H-2** (fix ATK category mapping) — data correctness in dev seeds
6. **Fix H-3** (fix financial_summary month type) — frontend compatibility
7. **Fix H-4** (add UNIQUE on spp_payments) — data integrity
8. **Fix M-1 to M-8** — constraint and trigger completeness
9. **Fix L-1 to L-5** — performance and consistency polish
