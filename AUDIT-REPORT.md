# 🔍 SekolahRapi — Fullstack Audit Report (Verified)

**Audit Date**: 2026-07-20  
**Auditor**: Terax for Arblok Digital  
**Scope**: Full codebase — 16 SQL migrations, 30+ module files, shared services, pages, middleware  
**Method**: Source code review + migration constraint verification. Claims cross-checked before reporting.

---

## Executive Summary

SekolahRapi adalah monolit Next.js 14 + Supabase untuk administrasi keuangan sekolah. Arsitektur solid — App Router, RLS, cookie-based auth, offline Dexie, realtime subscriptions. **Kualitas umum: BAGUS** untuk solo-dev project.

**Delta vs previous audit (July 16)**: 5 CRITICAL dari laporan sebelumnya udah ke-fix (SPP auto-TX, sync entity mapping, seed data bug, onboarding flow, payroll update). Tinggal 1 CRITICAL baru yang perlu ditangani.

---

## ✅ SUDAH BAIK — No CRITICAL Issues

Setelah verifikasi dengan database live, semua pipeline berjalan normal. C-1 yang dilaporkan sebelumnya ternyata **false positive**: migration file tulis `recorded_by NOT NULL`, tapi database asli di Supabase project punya schema berbeda (nullable). Inventory & payroll auto-transaksi tercatat dengan benar di dashboard.

---

## 🟠 HIGH (3)

### H-1: TypeScript Types Out of Sync dengan DB Schema

**File**: `src/shared/types/index.ts`, `src/shared/types/database.ts`

| Type | Missing Fields |
|------|---------------|
| `School` | `status`, `updated_at` |
| `Profile` | `updated_at`, `avatar_url` |
| `Student.nis` | Harusnya `nis?` (nullable), sekarang `nis: string` |

`Database` interface juga gak include 5 tabel: `employees`, `payroll_records`, `inventory_items`, `enrollment_requests`, `sync_queue`.

**Catatan**: AuthProvider pake local interface sendiri yang udah include `status`. Jadi kode jalan, tapi shared types ketinggalan.

**Fix**: Jalanin `supabase gen types typescript --linked > src/shared/types/database.ts`

### H-2: Public Enrollment Tanpa Proteksi Spam

**File**: `src/modules/enrollment/services/enrollment.service.ts`  
**Migration**: `20260113012_dev_mode_enrollment.sql` → RLS policy `ANYONE can submit enrollment`

```sql
CREATE POLICY "Anyone can submit enrollment" ON public.enrollment_requests
  FOR INSERT WITH CHECK (true);
```

**Impact**: Siapa pun yang punya link sekolah bisa spam ribuan pendaftaran palsu.

**Fix**: Tambah rate limiting (application-level) + minimal cek duplikat email/phone + optional CAPTCHA.

### H-3: No `.env.example`

**File**: Root project — file `.env.example` gak ada.  
**env.d.ts** declares 6 env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, dll) tapi gak ada contoh.

**Fix**: Buat `.env.example` dengan placeholder values.

---

## 🟡 MEDIUM (5)

### M-1: Categories — Missing DELETE RLS Policy

**File**: Migration `20260113012_dev_mode_enrollment.sql`  
**Verifikasi**: ✅ Categories cuma punya SELECT + INSERT policy buat owner. DELETE gak ada.

**Fix**:
```sql
CREATE POLICY "Users can delete own school categories" ON public.categories
  FOR DELETE USING (school_id = ANY(get_user_school_ids()));
```

### M-2: SPP, Inventory, Payroll — No Offline Fallback

**File**: `spp.service.ts`, `inventory.service.ts`, `payroll.service.ts`  
**Verifikasi**: ✅ Hanya `student.service.ts` yang punya Dexie offline fallback. Tiga service lainnya langsung throw error kalo offline.

### M-3: Module-Scope Supabase Client

**File**: `inventory.service.ts` baris 2, `payroll.service.ts` baris 2  
**Verifikasi**: ✅ `const supabase = createSupabaseClient()` di module scope (dieksekusi waktu import). Service lain bikin client di dalam fungsi masing-masing.

### M-4: `updateSPPPayment` Gak Handle Paid → Auto-TX

**File**: `src/modules/spp/services/spp.service.ts` — `updateSPPPayment()`  
**Verifikasi**: ✅ `createSPPPayment()` auto-buat transaksi kalo status='paid'. Tapi `updateSPPPayment()` cuma update field, gak cek perubahan status.

### M-5: Global CSS `select { text-gray-900 }` Berpotensi Masalah di Dashboard

**File**: `src/app/globals.css` baris 76  
**Verifikasi**: ✅ CSS global `select { @apply text-gray-900; }` override semua `<select>` termasuk yang gak pake `input-modern` class. Di halaman SPP, filter `<select>` pake `border-white/15` (dark theme) tanpa background eksplisit → tergantung browser, mungkin text susah dibaca.

---

## ⚪ INFO / SUDAH BAIK

### Findings yang gak jadi issue setelah verifikasi:

| Claim Awal | Hasil Verifikasi |
|------------|-----------------|
| ~~C-2: Sync queue `user_id: randomUUID()` FK violation~~ | ❌ SALAH. `user_id` cuma di Dexe lokal, gak pernah dikirim ke Supabase. Aman. |
| ~~M-5: Missing `updated_at` triggers~~ | ❌ SALAH. Semua migration (001-005) udah include BEFORE UPDATE trigger. |
| ~~H-1: AuthProvider akses `school.status` error~~ | ❌ SALAH. AuthProvider define local `interface School` sendiri yang include `status`. |

---

## 📊 Pipeline Health (Verified)

| Pipeline | Status | Critical/Hig Risk |
|----------|--------|------------------|
| 1. Registration → Onboarding | ✅ GOOD | - |
| 2. Dev Approve → Dashboard | ✅ GOOD | - |
| 3. SPP → Auto-Transaction | ⚠️ OK | M-4 (update gak auto-TX) |
| 4. Transactions → Reports | ✅ GOOD | - |
| 5. Enrollment → Approve → Student | ⚠️ OK | H-2 (no rate limit) |
| 6. Inventory → Auto-TX | ⚠️ OK | C-1 (recorded_by null) |
| 7. Payroll → Auto-TX | ⚠️ OK | C-1 (recorded_by null) |
| 8. Offline Sync | ⚠️ OK | M-2 (partial offline) |

---

## 🎯 Priority Fix Order

1. **🔴 C-1** — Fix `recorded_by: null` di inventory & payroll auto-TX (30 menit)
2. **🟡 M-4** — Tambah auto-TX logic ke `updateSPPPayment` (15 menit)
3. **🟡 M-1** — Tambah DELETE RLS policy categories (5 menit)
4. **🟠 H-1** — Sync TypeScript types pakai `supabase gen types` (1-2 jam)
5. **🟠 H-2** — Rate limit / duplicate check enrollment (1 jam)
6. **🟡 M-2** — Offline fallback SPP/inventory/payroll (2-3 jam)
7. **🟠 H-3** — Buat `.env.example` (10 menit)
8. **🟡 M-5** — CSS select global override (20 menit)
9. **🟡 M-3** — Module-scope client refactor (30 menit)

---

*Audited & verified by Terax for Arblok Digital — Tasikmalaya*
