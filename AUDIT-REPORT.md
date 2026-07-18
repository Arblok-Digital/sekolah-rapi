# 🔍 SekolahRapi — Full Pipeline & Business Logic Audit

**Date**: 2026-07-16  
**Scope**: 8 pipelines, all service files, hooks, types, migrations, DB schema  
**Severity Scale**: CRITICAL > HIGH > MEDIUM > LOW > INFO

---

## Executive Summary

Audited 33 module files, 11 shared files, and 14 SQL migrations across 8 business pipelines. Found **5 CRITICAL**, **6 HIGH**, **6 MEDIUM**, and **4 LOW/INFO** issues. Two core automation features (SPP→Transaction and stock deduction) are missing entirely. The onboarding page is a non-functional dead end. Multiple TypeScript types are out of sync with the database schema.

---

## CRITICAL Issues

### C-1: SPP Payments Do NOT Auto-Create Transactions
**Pipeline**: Pipeline 3 (SPP → Financial Tracking)  
**File**: `src/modules/spp/services/spp.service.ts` → `createSPPPayment()`  
**What's broken**: When an SPP payment is recorded as `paid`, NO corresponding record is created in the `transactions` table. The function only inserts into `spp_payments`.  
**Impact**: SPP payments do NOT appear in financial reports, summaries, or the dashboard balance. The entire SPP→finance pipeline is broken. Users must manually enter a duplicate transaction for every SPP payment — defeating the purpose of the module.  
**Suggested fix**: After successful SPP insert (when `status === 'paid'`), insert a corresponding `income` transaction:
```typescript
if (input.status === 'paid') {
  const { data: cat } = await supabase.from('categories')
    .select('id').eq('school_id', schoolId).eq('name', 'SPP').single();
  await supabase.from('transactions').insert({
    school_id: schoolId,
    type: 'income',
    category_id: cat?.id, // NOT NULL in DB
    amount: input.paid_amount,
    description: `SPP Bulan ${input.month}/${input.year}`,
    reference_date: input.payment_date || new Date().toISOString().split('T')[0],
    recorded_by: userId,
  });
}
```

---

### C-2: Sync Entity Table Name Mismatch
**Pipeline**: Pipeline 8 (Offline Sync)  
**File**: `src/modules/offline/services/sync.service.ts` line 16  
**What's broken**: The entity type is `'spp_payment'` (singular), but the actual Supabase table is `spp_payments` (plural). The sync service does `supabase.from(entity).insert(item.payload)` — this inserts into table `spp_payment` which does not exist.  
**Impact**: Any offline SPP payment will fail to sync back to Supabase. Data loss.  
**Suggested fix**: Add a mapping function:
```typescript
const TABLE_MAP: Record<string, string> = {
  transaction: 'transactions',
  student: 'students',
  spp_payment: 'spp_payments',
};
const tableName = TABLE_MAP[item.entity] || item.entity;
const { error } = await supabase.from(tableName).insert(item.payload);
```

---

### C-3: `category_id` NULL Violation in Auto-Transactions
**Pipeline**: Pipeline 6 (Inventory) & Pipeline 7 (Payroll)  
**Files**: `inventory.service.ts` line 32, `payroll.service.ts` line 52  
**What's broken**: Both services set `category_id: cat?.id || null`. But migration 005 defines `category_id UUID NOT NULL REFERENCES public.categories(id)`. If the category lookup fails (e.g., category not seeded yet), `null` violates the NOT NULL constraint → insert fails silently.  
**Impact**: Inventory purchases and payroll payments may silently fail to create transactions, breaking financial tracking.  
**Suggested fix**: Ensure categories exist before auto-transaction, or make category_id nullable in the migration, or add a fallback to create the category if missing.

---

### C-4: `dev_seed_test_data` Has Column Mapping Bug
**Pipeline**: Dev Admin / Test Data Seeding  
**File**: Migration 012, line 351  
**What's broken**: The last transaction insert is:
```sql
(target_school_id, 'expense', 200000, 'Pembelian ATK', '2026-07-10', auth.uid())
```
Columns: `school_id, type, category_id, amount, description, reference_date, recorded_by`  
So `200000` is passed as `category_id` (UUID type!) and `'Pembelian ATK'` as `amount`. This will throw a type error and **rollback the entire seed function**.  
**Impact**: The dev "Seed Test Data" button in the admin panel will always fail. No test data can be seeded.  
**Suggested fix**: Change to:
```sql
(target_school_id, 'expense', cat_gaji_id, 200000, 'Pembelian ATK', '2026-07-10', auth.uid());
```

---

### C-5: Sync Queue `user_id` Violates FK Constraint
**Pipeline**: Pipeline 8 (Offline Sync)  
**File**: `src/modules/students/services/student.service.ts` line 76  
**What's broken**: When creating an offline student, the sync queue item is created with `user_id: ''` (empty string). The `sync_queue` table requires `user_id UUID NOT NULL REFERENCES auth.users(id)`. An empty string is not a valid UUID and violates the FK constraint.  
**Impact**: Student creation via offline mode will queue a sync item that can never be synced (FK violation on server).  
**Suggested fix**: Pass the actual user ID from the current session, or make the offline student creation accept a userId parameter.

---

## HIGH Issues

### H-1: Onboarding Page Is a Dead End (No-Op)
**Pipeline**: Pipeline 1 (Registration)  
**File**: `src/app/onboarding/page.tsx` lines 137-143  
**What's broken**: The `handleSubmit` function is a fake:
```typescript
const handleSubmit = async () => {
  if (!validateStep(currentStep)) return;
  setIsSubmitting(true);
  await new Promise(r => setTimeout(r, 1500)); // Just waits 1.5s
  setIsSubmitting(false);
  setCompleted(true); // Shows "success" screen
};
```
No Supabase calls. No auth user, school, or profile is created.  
**Impact**: If a user gets redirected to `/onboarding` (e.g., after email confirmation with no profile), completing the wizard does nothing. They see a success screen but have no profile, no school, and will be stuck in a redirect loop.  
**Suggested fix**: Implement the full registration flow: `signUp` → create school → create profile → redirect to dashboard.

---

### H-2: Registration Hardcodes `status: 'active'` for Production
**Pipeline**: Pipeline 1 (Registration)  
**File**: `src/app/(auth)/register/page.tsx` line 58  
**What's broken**: The code comments state `"Dev: auto-active. Change to 'pending' for production"` but the status is hardcoded to `'active'`.  
**Impact**: In production, new schools skip the pending-approval flow entirely. There is no vetting/approval process for new signups.  
**Suggested fix**: Change to `status: 'pending'` and add an environment-based toggle.

---

### H-3: TypeScript Types Missing Database Columns
**Pipeline**: All Pipelines (Type Safety)  
**File**: `src/shared/types/index.ts`  
**What's broken**:
- `School` interface is missing `status` (added in migration 012) and `updated_at` (migration 001)
- `Profile` interface is missing `updated_at` (migration 002) and `avatar_url` (migration 012)
- `Student.nis` is `string` (required) but DB column is `TEXT` (nullable)

**Impact**: TypeScript won't recognize `school.status` when accessed (e.g., in AuthProvider), leading to type errors or runtime undefined access.  
**Suggested fix**: Update interfaces to match migrations:
```typescript
interface School { /* ... */ status: 'pending' | 'active' | 'suspended' | 'archived'; updated_at?: string; }
interface Profile { /* ... */ updated_at?: string; avatar_url?: string; }
interface Student { /* ... */ nis?: string; }
```

---

### H-4: `Database` Interface Missing 5 Tables/Views
**Pipeline**: All Pipelines (Type Safety)  
**File**: `src/shared/types/database.ts`  
**What's broken**: The `Database` interface only defines 7 tables. Missing from the interface:
- `employees` (migration 014)
- `payroll_records` (migration 014)
- `inventory_items` (migration 013)
- `enrollment_requests` (migration 012)
- `sync_queue` (migration 007)
- `financial_summaries` view (migration 008)

**Impact**: Supabase client calls to these tables lose type safety. `createSupabaseAdmin` wraps `Database` type but the missing tables make the type incomplete.  
**Suggested fix**: Add all table definitions to `Database.Tables`.

---

### H-5: Payroll Auto-Transaction Only on Create, Not Update
**Pipeline**: Pipeline 7 (Payroll)  
**File**: `src/modules/payroll/services/payroll.service.ts` → `updatePayroll()`  
**What's broken**: When `createPayroll` is called with `paid: true`, it auto-creates a transaction. But `updatePayroll` has no such logic — if a record is created as `paid: false` and later updated to `paid: true`, NO transaction is created.  
**Impact**: Payroll payments marked as paid after creation don't appear in financial reports.  
**Suggested fix**: In `updatePayroll`, check if `input.paid` is being set to `true` and create a transaction.

---

### H-6: No Stock Deduction Function in Inventory
**Pipeline**: Pipeline 6 (Inventory)  
**File**: `src/modules/inventory/services/inventory.service.ts`  
**What's broken**: The inventory service only has `getInventory`, `createInventory`, `updateInventory`, `deleteInventory`. There is no `deductStock` or `useStock` function. The `quantity` field exists but can only be changed through generic `updateInventory`.  
**Impact**: No automatic stock deduction when items are "used". No audit trail for stock changes. The description "auto-deduct stock → auto-create transactions" is not implemented.  
**Suggested fix**: Add a `deductStock(inventoryId, quantity, userId)` function that decrements quantity and optionally creates a transaction.

---

## MEDIUM Issues

### M-1: Inventory & Payroll Have No Offline Fallback
**Pipeline**: Pipeline 6 & 7  
**Files**: `inventory.service.ts`, `payroll.service.ts`  
**What's broken**: Only `student.service.ts` and `transaction.service.ts` have Dexie (IndexedDB) offline fallback. Inventory and payroll services fail immediately on network errors.  
**Impact**: Offline inventory/payroll operations crash instead of queuing for sync.  
**Suggested fix**: Add the same Dexie fallback pattern used in `student.service.ts`.

---

### M-2: SPP Service Has No Offline Fallback
**Pipeline**: Pipeline 3  
**File**: `src/modules/spp/services/spp.service.ts`  
**What's broken**: SPP payments have no Dexie offline fallback. The Dexie schema includes an `spp_payments` table, but the service never writes to it.  
**Impact**: SPP recording fails completely when offline.  
**Suggested fix**: Add offline fallback to `createSPPPayment` similar to `createStudent`.

---

### M-3: Module-Scope Supabase Client Instantiation
**Pipeline**: All (architecture)  
**Files**: `inventory.service.ts` line 5, `payroll.service.ts` line 4  
**What's broken**: Both files create the Supabase client at module scope (`const supabase = createSupabaseClient()`) instead of inside each function. All other services create the client inside each function.  
**Impact**: If the client is created before env vars are loaded (SSR edge case), it could fail. Inconsistent with the rest of the codebase.  
**Suggested fix**: Move client creation inside each function, consistent with `spp.service.ts` and others.

---

### M-4: Categories Missing DELETE RLS Policy
**Pipeline**: RLS / Security  
**File**: Migration 012  
**What's broken**: The RLS overhaul in migration 012 creates SELECT and INSERT policies for categories but NO DELETE policy. Users can create custom categories but never delete them.  
**Impact**: Users who accidentally create duplicate categories cannot remove them.  
**Suggested fix**: Add:
```sql
CREATE POLICY "Users can delete own school categories" ON public.categories
  FOR DELETE USING (school_id = ANY(get_user_school_ids()));
```

---

### M-5: FinancialSummary VIEW Type Mismatch
**Pipeline**: Pipeline 4 (Reports)  
**Files**: Migration 008 vs `src/shared/types/index.ts`  
**What's broken**:
1. VIEW defines `month` as `date_trunc('month', t.reference_date)::date` — a DATE type. TS type expects `month: number`.
2. TS type expects `spp_collected` and `spp_outstanding` columns. The VIEW only provides `total_income`, `total_expense`, `balance`.

**Impact**: Queries to the `financial_summary` view won't match the TypeScript type. `spp_collected` and `spp_outstanding` are always undefined.  
**Suggested fix**: Add SPP subqueries to the VIEW and cast month to integer.

---

### M-6: Duplicate `getCategories` Function
**Pipeline**: Pipeline 4  
**Files**: `transaction.service.ts` line 91, `category.service.ts` line 6  
**What's broken**: `getCategories` exists in both files with different return types and signatures. `transaction.service.ts` returns `{ id, name, type }[]` while `category.service.ts` returns `Category[]`.  
**Impact**: Confusion about which to import. The `useTransactions` hook imports from `category.service.ts` while `TransactionForm` may use either.  
**Suggested fix**: Keep `getCategories` only in `category.service.ts` and re-export from `transaction.service.ts`.

---

## LOW / INFO Issues

### L-1: No TODO/FIXME/HACK Comments
**Impact**: None. Code appears intentionally complete (though some features are actually missing as noted above).

---

### L-2: Server-Client Re-Exports Browser Client
**File**: `src/shared/services/supabase/server-client.ts`  
**What**: Acknowledged in comments that it re-exports the browser client due to auth-helpers type conflicts. Works but server-side auth is weak.  
**Impact**: Any server component using this client relies on localStorage session, which is only available in the browser.

---

### L-3: Overview Page Date Filtering with ISO Strings
**File**: `src/app/(dashboard)/overview/page.tsx` lines 76-84  
**What**: Filters transactions using `.gte('reference_date', monthStart)` where `monthStart` is `new Date(...).toISOString()`. The DB column is `DATE` type, not `TIMESTAMPTZ`. Supabase should handle the comparison, but timezone differences between client and server could cause off-by-one-day issues.  
**Impact**: Potential edge case where transactions at month boundaries appear in wrong month.

---

### L-4: `useOfflineSync` Hook Missing `triggerSync` in Effect Dependencies
**File**: `src/modules/offline/hooks/useOfflineSync.ts` line 49  
**What**: The second `useEffect` calls `triggerSync` but lists only `[status.pending, status.isSyncing]` as dependencies. While this works in practice (function is recreated each render), it violates the exhaustive-deps rule and could confuse linters.  
**Impact**: Minor React best practices violation. Functionally safe.

---

## Pipeline-by-Pipeline Status

| Pipeline | Status | Key Issue |
|----------|--------|-----------|
| 1. Registration → Profile → School → Pending | ⚠️ PARTIAL | Onboarding is no-op (H-1); status hardcoded active (H-2) |
| 2. Dev Approve → Active → Dashboard Access | ✅ WORKING | Dev admin panel fully functional |
| 3. Students → SPP → Tracking → Auto-TX | ❌ BROKEN | SPP doesn't auto-create transactions (C-1) |
| 4. Manual Transactions → Reports | ✅ WORKING | Duplicate getCategories (M-6) |
| 5. Enrollment → Approve → Student | ✅ WORKING | End-to-end functional |
| 6. Inventory → Deduct → Auto-TX | ⚠️ PARTIAL | No stock deduction (H-6); TX category_id can be null (C-3) |
| 7. Payroll → Auto-TX | ⚠️ PARTIAL | TX only on create, not update (H-5); category_id null (C-3) |
| 8. Offline → Sync → Online | ❌ BROKEN | Sync entity name wrong (C-2); user_id empty (C-5); no offline for SPP/inventory/payroll (M-1/M-2) |

---

## Files Created

- `AUDIT-REPORT.md` — This report (created at project root)

## Files Modified

- None (read-only audit)

## Issues Encountered

- None — all files were accessible and readable.
