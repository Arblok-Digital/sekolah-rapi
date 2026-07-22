# SekolahRapi — Documentation

> Sistem manajemen sekolah all-in-one: keuangan, siswa, SPP, inventaris, payroll, pendaftaran online.
> Built by Arblok Digital.

---

## 1. Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14.2.35 (App Router), TypeScript, Tailwind CSS 3.4 |
| State | TanStack Query (server), Zustand (client), Dexie.js (offline) |
| Backend | Supabase (PostgreSQL + REST API + Auth + Realtime) |
| Auth | @supabase/ssr 0.12.3 (cookie-based session) |
| PWA | next-pwa (service worker, manifest, installable) |
| Chart | Recharts |
| Icons | Lucide React |
| Build | Vercel |
| Runtime | Turbopack (dev), Webpack (prod) |

---

## 2. Roles

| Role | Who | Access |
|------|-----|--------|
| `dev` | Arblok (super admin) | All schools, approve schools, seed data, nuclear delete, user management |
| `owner` | School owner/admin | Full CRUD on own school only |

No "admin" or "staff" role. Owner IS the admin.
Dev role is set manually via DB (`UPDATE profiles SET role = 'dev' WHERE id = '<uid>'`).

---

## 3. Database Schema (Supabase PostgreSQL)

### Core Tables
```
schools
├── id (uuid PK)
├── name (text)
├── owner_id (uuid → auth.users)
├── status (text: pending | active | suspended | archived)
├── plan (text: free | basic | premium)
└── created_at

profiles
├── id (uuid PK → auth.users)
├── name (text)
├── email (text)
├── role (text: dev | owner)
├── phone (text)
├── school_id (uuid → schools)
└── created_at

students
├── id (uuid PK)
├── school_id (uuid → schools)
├── nis (text)
├── name (text)
├── class (text)
├── gender (text: L/P)
├── address (text)
├── parent_name (text)
├── parent_phone (text)
├── status (text: active | graduated | transferred)
└── created_at

categories
├── id (uuid PK)
├── school_id (uuid → schools)
├── name (text: SPP, Donasi, Gaji Guru, ATK, Operasional, etc.)
├── type (text: income | expense)
└── created_at

transactions
├── id (uuid PK)
├── school_id (uuid → schools)
├── type (text: income | expense)
├── category_id (uuid → categories, nullable)
├── amount (numeric)
├── description (text)
├── reference_date (date)
├── proof_url (text, nullable)
├── recorded_by (uuid, nullable)
├── approved_by (uuid, nullable)
├── created_at, updated_at

spp_payments
├── id (uuid PK)
├── school_id (uuid → schools)
├── student_id (uuid → students)
├── month (int 1-12)
├── year (int)
├── amount (numeric) — tagihan
├── paid_amount (numeric) — dibayar
├── status (text: paid | partial | unpaid)
├── payment_date (date)
├── method (text: tunai | transfer | qris | lainnya)
├── receipt_number (text)
├── recorded_by (uuid)
├── created_at, updated_at

enrollment_requests
├── id (uuid PK)
├── school_id (uuid → schools)
├── student_name, nis, class, gender, address
├── birth_date, birth_place
├── parent_name, parent_phone, parent_email, parent_occupation
├── status (text: pending | approved | rejected)
├── admin_notes (text)
├── processed_by (uuid)
├── processed_at (timestamp)
├── created_at

inventory_items
├── id (uuid PK)
├── school_id (uuid → schools)
├── name, category, quantity, condition, location
├── purchase_date, purchase_price, notes
├── created_at, updated_at

employees
├── id (uuid PK)
├── school_id (uuid → schools)
├── name, position, phone, email
├── base_salary (numeric)
├── status (text: active | inactive)
├── created_at, updated_at

payroll_records
├── id (uuid PK)
├── school_id (uuid → schools)
├── employee_id (uuid → employees)
├── month, year (int)
├── base_salary, bonus, deduction, total (numeric)
├── paid (boolean)
├── paid_date (date)
├── created_at, updated_at
```

### Dev Management Functions (SECURITY DEFINER)

```
is_dev()                  → BOOLEAN: cek apakah current user role = 'dev'
get_user_role()           → TEXT: return role user
dev_delete_school_data()  → Hapus semua data sekolah (school tetap ada)
dev_nuclear_delete()      → HAPUS SEMUA data (profiles, schools, semua tabel)
dev_set_school_status()   → Set status sekolah (active/pending/suspended)
dev_seed_test_data()      → Seed 3 siswa + SPP + transaksi
dev_delete_user()         → Hapus 1 user: school data + profile + auth user
```

---

## 4. Auth Architecture (Updated July 2026)

### Cookie-Based Session (@supabase/ssr)
```
Login Flow:
1. signInWithPassword → Supabase returns JWT + refresh token
2. @supabase/ssr sets sb-*-auth-token cookies
3. Middleware reads cookies → refreshes session on every request
4. AuthProvider loads session + profile + school on client

Middleware Logic:
├── /login, /register, /enrollment, /register-student, /pending-approval → PUBLIC
├── /api/*, /_next/*, static files → PASS THROUGH (no auth check)
├── /dev/admin → BLOCKED in production (only localhost works)
├── Session exists + on /login or /register → redirect /overview
├── No session + on protected route → redirect /login
└── Session exists + on /overview → check profile → check school status
```

### Dev Panel Production Block
```typescript
// middleware.ts
if (pathname.startsWith('/dev') && !isDevMode) {
  return NextResponse.redirect(new URL('/', url));
}
```
Dev panel (`/dev/admin`) only accessible on localhost. Blocked in production.

---

## 5. Pipeline — Register to Dashboard (Updated)

### 5.1 Register Owner
```
/register
├── Input: name, email, password
├── Supabase Auth: signUp (creates auth.users)
│   ├── Email confirmation ON → signUp returns no session
│   ├── Email confirmation OFF → signUp returns session
│   └── Error 422 "already registered" → auto signIn with same password
├── signIn (establish session)
├── Redirect → /onboarding (create profile + school)
└── OR → /pending-approval (if profile exists)
```

### 5.2 Onboarding
```
/onboarding
├── Session MUST exist (checked client-side)
├── Input: school name, school plan
├── SQL: INSERT INTO schools (status=pending, owner_id=user)
├── SQL: UPDATE profiles SET school_id=new_school, role=owner
└── Redirect → /pending-approval
```

### 5.3 Dev Approves School
```
/dev/admin (localhost only)
├── Tab Schools: list semua schools dengan status
├── Click school → expand → "Activate" button
├── RPC: dev_set_school_status(school_id, 'active')
└── Owner bisa login ke dashboard
```

### 5.4 Owner Login
```
/login
├── Input: email, password
├── Supabase Auth: signInWithPassword
├── Session stored in cookies (@supabase/ssr)
├── AuthProvider: fetchProfile → loads role, school_id
├── Dashboard layout: checks session → if no session → redirect /login
└── Owner sees full dashboard
```

### 5.5 Dashboard (Realtime)
```
/overview
├── Fetch: transactions, students, spp_payments
├── Calculate: saldo, income, expense, collection rate
├── Subscribe: Supabase Realtime on 4 tables
│   ├── transactions → auto-refetch on INSERT/UPDATE/DELETE
│   ├── students → auto-refetch
│   ├── spp_payments → auto-refetch
│   └── enrollment_requests → auto-refetch
├── Display: 🟢 LIVE badge + update counter
└── Cards: Saldo Kas, Pemasukan, Pengeluaran, SPP Health, Recent Tx
```

---

## 6. Dev Panel — User Management (New July 2026)

### 6.1 Access
```
URL: /dev/admin
Access: localhost ONLY (blocked in production via middleware)
Auth: must be logged in as dev role
Tabs: [Schools] [Users]
```

### 6.2 Users Tab
```
Tab Users
├── Fetch: profiles (dev bypasses RLS) + schools
├── Display: email, name, role, school, school_status, created_at
├── Role badge: dev=purple, owner=blue, no_profile=red
├── Delete button: per user (excludes dev role)
└── RPC: dev_delete_user(target_user_id)
    ├── Deletes: spp_payments, transactions, students, categories
    ├── Deletes: enrollment_requests, sync_queue, inventory_items
    ├── Deletes: employees, payroll_records, schools, profiles
    └── Does NOT delete auth.users (Supabase limitation)
```

### 6.3 Delete User Flow
```
1. Click delete button on user row
2. Confirm dialog: "Yakin mau HAPUS akun email? Semua data akan hilang."
3. RPC: dev_delete_user(user_id)
4. All related data deleted (cascade)
5. User list refreshes
6. For full removal: also delete auth user via Supabase Dashboard → Authentication → Users
```

### 6.4 Nuclear Delete
```
Button: "Nuclear Delete" (red, top-right)
├── Confirmation required
├── RPC: dev_nuclear_delete()
├── Deletes: ALL data in ALL tables
├── Does NOT delete auth.users
├── Preserves dev role profiles
└── Use for: fresh start, test data cleanup
```

---

## 7. Pipeline — Pendaftaran Online

### 7.1 Owner Shares Link
```
/enrollment
├── Shows: list of enrollment requests (all statuses)
├── Shows: shareable link → /register-student?school=<school_id>
├── Copy button → copies full URL to clipboard
└── Stats: Menunggu, Disetujui, Ditolak counts
```

### 7.2 Parent Submits Form
```
/register-student?school=<uuid>
├── Fetches school name from DB → displays "MI Borlong" (not UUID)
├── Form fields:
│   ├── Data Siswa: Nama, NIS, Kelas (dropdown), JK (dropdown), Alamat, Tanggal Lahir
│   └── Data Orang Tua: Nama, No. WA, Email, Pekerjaan
├── INSERT INTO enrollment_requests (status=pending)
└── Shows success page
```

### 7.3 Owner Reviews & Approves
```
/enrollment
├── Click "Approve" on pending request
│   ├── INSERT INTO students (from enrollment data)
│   ├── UPDATE enrollment_requests SET status='approved'
│   └── Invalidate students query → auto-refresh
├── Click "Tolak" → enters notes → UPDATE status='rejected'
└── No auth required for public form (anon INSERT policy)
```

---

## 8. Pipeline — Keuangan (Transactions)

### 8.1 Manual Transaction
```
/transactions → "Tambah Transaksi"
├── Input: type (income/expense), category, amount, description, date
├── INSERT INTO transactions
├── Auto-update dashboard (realtime subscription)
└── Categories seeded per school (SPP, Donasi, Gaji Guru, ATK, etc.)
```

### 8.2 Auto-Transaction from SPP
```
/spp → "Catat Pembayaran"
├── Dropdown: select student (fetched from DB)
├── Input: month, year, amount, paid_amount, status, method
├── INSERT INTO spp_payments
├── If status='paid':
│   └── INSERT INTO transactions (type='income', category='SPP', amount=paid_amount)
└── Auto-update dashboard
```

### 8.3 Auto-Transaction from Inventory
```
/inventory → "Tambah Barang"
├── Input: name, category, quantity, condition, price, purchase_price
├── INSERT INTO inventory_items
├── If purchase_price > 0:
│   └── ⚡ LANGSUNG: INSERT INTO transactions (type='expense', category='ATK' atau auto-create, amount=price*qty, recorded_by=userId or null)
└── Auto-update dashboard
```
> ⚡ **IMMEDIATE CASH IMPACT**: Begitu barang disimpan, kas langsung berkurang. Tidak ada step konfirmasi terpisah. Ini desain intentional untuk pembelian tunai.

### 8.4 Auto-Transaction from Payroll (2-Step Flow)
```
STEP 1 — Generate (NO cash impact)
/payroll → "Generate Gaji"
├── Batch create payroll_records for all active employees
├── paid=false (default)
└── KAS BELUM KENA — cuma catatan

STEP 2 — Bayar (cash impact)
/payroll → klik tombol "Bayar" pada record per guru
├── UPDATE payroll_records SET paid=true
├── Duplicate check: cari transaksi yg sudah ada dengan deskripsi yg sama
├── If belum ada:
│   └── ⚡ INSERT INTO transactions (type='expense', category='Gaji Guru', amount=total, recorded_by=null)
└── Auto-update dashboard & kas
```
> ⚠️ **2-STEP DESIGN**: Generate hanya bikin record. Kas baru kepotong setelah owner klik "Bayar". `recorded_by` null karena fungsi payroll belum nerima userId — aman karena DB allow null.

---

## 9. Pipeline — SPP (Sumbangan Pendidikan)

```
/spp
├── Summary cards: Total Siswa, Terkumpul, Belum Bayar, Collection Rate
├── Filter: Bulan + Tahun
├── Table: per-student SPP status (paid/partial/unpaid)
├── "Catat Pembayaran":
│   ├── Select student (dropdown)
│   ├── Month, Year, Amount, Paid Amount
│   ├── Status: Lunas / Angsuran / Belum Bayar
│   ├── Method: Tunai / Transfer / QRIS / Lainnya
│   └── Auto-create transaction (income)
└── CSV export available
```

---

## 10. Pipeline — Inventaris

```
/inventory
├── Table: all items with name, category, qty, condition, price
├── Filter: by category (Furniture, Elektronik, ATK, etc.)
├── Search: by name
├── "Tambah Barang":
│   ├── Input: name, category, quantity, condition, location, purchase_price
│   └── ⚡ LANGSUNG POTONG KAS: Auto-create expense transaction (amount = purchase_price * quantity)
│       └──  Cat: kategori otomatis "ATK". Kalo blom ada, auto-dibikin.
│       └──  Konsekuensi: BI检查 langsung mengubah saldo kas sekolah.
├── Edit/Delete items
│   └── CATATAN: Edit/Delete item TIDAK mengubah transaksi yg sudah terlanjur dibuat.
│       └──  Kalau harga beli salah, harus hapus transaksi manual di menu Transaksi.
└── Condition tracking: Baik, Rusak Ringan, Rusak Berat, Hilang
```

> ⚠️ **PENTING UNTUK DEVELOPER**: `createInventory()` di `inventory.service.ts` langsung INSERT ke tabel `transactions` (expense). Ini BUKAN bug — ini desain yang intentional. `recorded_by` diisi dari `userId || null` dan aman karena di database kolom ini nullable.

---

## 11. Pipeline — Payroll (Penggajian)

```
/payroll
├── Tab "Karyawan": list employees + add/edit/delete
│   ├── Input: name, position, phone, email, base_salary
│   └── Status: active / inactive
├── Tab "Gaji": payroll records per month
│   ├── "Generate Gaji": batch create records for all active employees
│   │   └──  KAS BELUM KENA — hanya bikin record payroll (paid = false)
│   ├── Records: base_salary + bonus - deduction = total
│   ├── Klik "Bayar" (toggle paid = true):
│   │   └── ⚡ BARU POTONG KAS: Auto-create expense transaction
│   │       └──  Cat: Dicek dulu apakah transaksi sudah ada (pakai duplicate check by description)
│   │       └──  Kalo sudah ada, skip — gak bakal double entry
│   └── Filter: month + year
└── Auto-update dashboard when paid
```

> ⚠️ **PENTING UNTUK DEVELOPER**: Payroll pake **2-step flow**. Jangan tambah auto-transaction di `createPayroll()` — itu hanya generate record. Transaksi dibuat di `updatePayroll()` saat `paid` diubah ke `true`. `recorded_by` diisi `null` karena fungsi payroll belum nerima userId, dan database mengizinkan null.
>
> ❌ JANGAN REFACTOR `updatePayroll` jadi auto-create di `createPayroll`. Flow generate→bayar adalah intentional biar sekolah bisa review dulu sebelum gaji cair.

---

## 12. Pipeline — Laporan

```
/reports
├── Financial Summary:
│   ├── Total income / expense / balance
│   ├── Per-category breakdown (Recharts bar chart)
│   └── CSV export
├── SPP Recap:
│   ├── Per-student: paid / partial / unpaid
│   ├── Collection rate
│   └── CSV export
└── All data fetched from Supabase (real-time)
```

---

## 13. RLS (Row Level Security)

### Policy Pattern
```sql
-- Dev: full access to all tables
CREATE POLICY "Dev: full access to <table>" ON <table>
  FOR ALL USING (is_dev());

-- Owner: access own school data only
CREATE POLICY "Users can view own school <table>" ON <table>
  FOR SELECT USING (school_id = ANY(get_user_school_ids()));
```

### Key Points
- All tables have RLS enabled
- `is_dev()` function: checks `profiles.role = 'dev'` → bypasses all RLS
- Owner access filtered by `school_id` ownership
- Public enrollment: anon INSERT policy on `enrollment_requests`
- Dev management functions: `SECURITY DEFINER` → runs with function owner's privileges

---

## 14. Realtime

Tables with Supabase Realtime enabled:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.students;
ALTER PUBLICATION supabase_realtime ADD TABLE public.spp_payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.enrollment_requests;
```

Dashboard subscribes via `supabase.channel()` → auto-refetch on any change.

---

## 15. PWA (Progressive Web App)

- Manifest: `/manifest.json` → app name, icons, display: standalone
- Icons: 192x192 + 512x512 (SR logo, indigo)
- Service Worker: auto-generated by next-pwa (workbox)
- Disabled in dev mode (`NODE_ENV === 'development'`)
- Active in production (Vercel deploy)
- Owner can install on phone → native-like app experience

---

## 16. File Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout + metadata + manifest
│   ├── globals.css             # Global styles + input-modern + dark theme
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx   # 422 "already registered" handler
│   │   └── page.tsx            # Landing page
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Auth gate + sidebar
│   │   ├── overview/page.tsx   # Realtime dashboard
│   │   ├── students/page.tsx   # Student CRUD + import
│   │   ├── spp/page.tsx        # SPP payments
│   │   ├── transactions/page.tsx
│   │   ├── enrollment/page.tsx # Online enrollment
│   │   ├── inventory/page.tsx  # Inventory management
│   │   ├── payroll/page.tsx    # Employees + payroll
│   │   ├── reports/page.tsx    # Financial reports
│   │   └── dev/admin/page.tsx  # Dev panel (schools + users)
│   ├── onboarding/page.tsx     # Create school + profile after register
│   ├── pending-approval/page.tsx  # School pending status
│   ├── register-student/page.tsx  # Public enrollment form
│   ├── api/admin/
│   │   ├── users/route.ts      # (deprecated — now uses RPC)
│   │   └── delete-user/route.ts # (deprecated — now uses RPC)
│   └── middleware.ts           # Auth + dev panel production block
├── modules/
│   ├── enrollment/             # Types, service, hooks
│   ├── inventory/
│   ├── payroll/
│   ├── spp/
│   └── students/
│       ├── components/
│       │   ├── StudentForm.tsx
│       │   ├── StudentImport.tsx  # Excel/CSV import
│       │   └── StudentTable.tsx
│       ├── hooks/useStudents.ts
│       ├── services/student.service.ts
│       └── types/student.types.ts
├── shared/
│   ├── components/Layout/Sidebar.tsx
│   ├── providers/AuthProvider.tsx  # Session + profile + school context
│   ├── services/supabase/
│   │   ├── client.ts           # Browser client (@supabase/ssr)
│   │   └── server-client.ts    # Server client (@supabase/ssr)
│   └── types/index.ts
├── middleware.ts                # Route protection + dev panel block
supabase/
└── migrations/
    └── 20260113012_dev_mode_enrollment.sql  # RLS + dev functions
    └── 20260718001_dev_delete_user.sql      # dev_delete_user() function
```

---

## 17. Environment Variables

```env
# Client (exposed to browser)
NEXT_PUBLIC_SUPABASE_URL=https://bbymrmysmerazdkubptc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>

# Server only (API routes, middleware)
SUPABASE_SERVICE_ROLE_KEY=sb_secret_<key>  # Used by admin API routes
```

### Local (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://bbymrmysmerazdkubptc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=sb_secret_<key>
```

### Vercel
Same variables set in Vercel Dashboard → Settings → Environment Variables.

---

## 18. Deploy

```bash
# Local dev
.\node_modules\.bin\next.cmd dev --port 3001    # Windows
npx next@14 dev --port 3001                       # Cross-platform

# Production build (Vercel auto-builds on push)
npx next build

# Git push → Vercel auto-deploy
git push origin main
```

### Dev Server Notes
- Port 3001 (avoid Chrome cache issues on localhost:3000)
- Turbopack enabled (faster HMR, lower memory)
- Windows: use `node_modules\.bin\next.cmd` not `npx next` (avoids global v16)
- Clear `.next` cache if assets 404: `rmdir /s /q .next`

---

## 19. Known Limitations & Future

| Item | Status |
|------|--------|
| Multi-school UX | Single-school UX, multi-tenant backend |
| Self-approval | Not implemented (intentional for monetization) |
| WhatsApp notifications | Not yet |
| Parent portal | Not yet (parents can only submit enrollment) |
| Email notifications | Not yet |
| Audit log | Not yet |
| Offline mode | Dexie.js installed, partially wired |
| File upload (proof) | Schema exists, UI not yet |
| Dev panel production access | Not yet (will add email whitelist later) |
| Auth user deletion | Must be done via Supabase Dashboard (auth.users is separate schema) |

---

*Last updated: July 18, 2026*
*Built with ❤️ by Arblok Digital — Tasikmalaya*
