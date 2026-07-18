# SekolahRapi — Documentation

> Sistem manajemen sekolah all-in-one: keuangan, siswa, SPP, inventaris, payroll, pendaftaran online.
> Built by Arblok Digital.

---

## 1. Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS 3.4 |
| State | TanStack Query (server), Zustand (client), Dexie.js (offline) |
| Backend | Supabase (PostgreSQL + REST API + Auth + Realtime) |
| PWA | next-pwa (service worker, manifest, installable) |
| Chart | Recharts |
| Icons | Lucide React |
| Build | Vercel |

---

## 2. Roles

| Role | Who | Access |
|------|-----|--------|
| `dev` | Arblok (super admin) | All schools, approve schools, seed data, nuclear delete |
| `owner` | School owner/admin | Full CRUD on own school only |

No "admin" or "staff" role. Owner IS the admin.

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

---

## 4. Pipeline — Register to Dashboard

### 4.1 Register Owner
```
/register
├── Input: name, email, password
├── Supabase Auth: signUp (creates auth.users)
├── profiles: INSERT (role=owner, school_id=new_school)
├── schools: INSERT (status=pending, owner_id=user)
├── signIn (establish session)
└── Redirect → /pending-approval
```

### 4.2 Dev Approves School (Manual)
```sql
UPDATE schools SET status = 'active' WHERE id = '<school_id>';
```
Only dev can approve. This is intentional for monetization control.

### 4.3 Owner Login
```
/login
├── Input: email, password
├── Supabase Auth: signInWithPassword
├── Session stored in localStorage (Supabase auto-persist)
├── AuthProvider: fetchProfile → loads role, school_id
├── Dashboard layout: checks session → if no session → redirect /login
└── Owner sees full dashboard
```

### 4.4 Dashboard (Realtime)
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

## 5. Pipeline — Pendaftaran Online

### 5.1 Owner Shares Link
```
/enrollment
├── Shows: list of enrollment requests (all statuses)
├── Shows: shareable link → /register-student?school=<school_id>
├── Copy button → copies full URL to clipboard
└── Stats: Menunggu, Disetujui, Ditolak counts
```

### 5.2 Parent Submits Form
```
/register-student?school=<uuid>
├── Fetches school name from DB → displays "MI Borlong" (not UUID)
├── Form fields:
│   ├── Data Siswa: Nama, NIS, Kelas (dropdown), JK (dropdown), Alamat, Tanggal Lahir
│   └── Data Orang Tua: Nama, No. WA, Email, Pekerjaan
├── INSERT INTO enrollment_requests (status=pending)
└── Shows success page
```

### 4.3 Owner Reviews & Approves
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

## 6. Pipeline — Keuangan (Transactions)

### 6.1 Manual Transaction
```
/transactions → "Tambah Transaksi"
├── Input: type (income/expense), category, amount, description, date
├── INSERT INTO transactions
├── Auto-update dashboard (realtime subscription)
└── Categories seeded per school (SPP, Donasi, Gaji Guru, ATK, etc.)
```

### 6.2 Auto-Transaction from SPP
```
/spp → "Catat Pembayaran"
├── Dropdown: select student (fetched from DB)
├── Input: month, year, amount, paid_amount, status, method
├── INSERT INTO spp_payments
├── If status='paid':
│   └── INSERT INTO transactions (type='income', category='SPP', amount=paid_amount)
└── Auto-update dashboard
```

### 6.3 Auto-Transaction from Inventory
```
/inventory → "Tambah Barang"
├── Input: name, category, quantity, condition, price
├── INSERT INTO inventory_items
├── If purchase_price > 0:
│   └── INSERT INTO transactions (type='expense', category='ATK', amount=price*qty)
└── Auto-update dashboard
```

### 6.4 Auto-Transaction from Payroll
```
/payroll → "Generate Gaji" → "Bayar"
├── Generate: batch create payroll_records for all active employees
├── Mark paid: UPDATE payroll_records SET paid=true
├── If paid:
│   └── INSERT INTO transactions (type='expense', category='Gaji Guru', amount=total)
└── Auto-update dashboard
```

---

## 7. Pipeline — SPP (Sumbangan Pendidikan)

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

## 8. Pipeline — Inventaris

```
/inventory
├── Table: all items with name, category, qty, condition, price
├── Filter: by category (Furniture, Elektronik, ATK, etc.)
├── Search: by name
├── "Tambah Barang":
│   ├── Input: name, category, quantity, condition, location, purchase_price
│   └── Auto-create transaction (expense) if purchase_price > 0
├── Edit/Delete items
└── Condition tracking: Baik, Rusak Ringan, Rusak Berat, Hilang
```

---

## 9. Pipeline — Payroll (Penggajian)

```
/payroll
├── Tab "Karyawan": list employees + add/edit/delete
│   ├── Input: name, position, phone, email, base_salary
│   └── Status: active / inactive
├── Tab "Gaji": payroll records per month
│   ├── "Generate Gaji": batch create records for all active employees
│   ├── Records: base_salary + bonus - deduction = total
│   ├── Mark as paid → auto-create transaction (expense)
│   └── Filter: month + year
└── Auto-update dashboard when paid
```

---

## 10. Pipeline — Laporan

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

## 11. RLS (Row Level Security)

All tables have RLS enabled with permissive policies:

```sql
-- Pattern for all tables:
CREATE POLICY "allow_all" ON table_name FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (true);  -- or (auth.uid() IS NOT NULL)
```

- Authenticated users can CRUD their own school's data
- `school_id` filter in every query ensures data isolation
- Dev role bypasses all RLS via SECURITY DEFINER functions
- Public enrollment form uses anon INSERT policy

---

## 12. Realtime

Tables with Supabase Realtime enabled:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.students;
ALTER PUBLICATION supabase_realtime ADD TABLE public.spp_payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.enrollment_requests;
```

Dashboard subscribes via `supabase.channel()` → auto-refetch on any change.

---

## 13. PWA (Progressive Web App)

- Manifest: `/manifest.json` → app name, icons, display: standalone
- Icons: 192x192 + 512x512 (SR logo, indigo)
- Service Worker: auto-generated by next-pwa (workbox)
- Disabled in dev mode (`NODE_ENV === 'development'`)
- Active in production (Vercel deploy)
- Owner can install on phone → native-like app experience

---

## 14. File Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout + metadata + manifest
│   ├── globals.css             # Global styles + input-modern + dark theme
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
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
│   │   └── dev/admin/page.tsx  # Dev panel
│   ├── register-student/page.tsx  # Public enrollment form
│   └── pending-approval/page.tsx  # School pending status
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
│   ├── services/supabase/client.ts # Singleton Supabase client
│   └── types/index.ts
```

---

## 15. Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://bbymrmysmerazdkubptc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
```

---

## 16. Deploy

```bash
# Local dev
npm run dev          # Port 3000

# Production
npm run build        # Compile
npm run start        # Start production server

# Vercel
vercel deploy        # Auto-detect Next.js
```

---

## 17. Known Limitations & Future

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

---

*Last updated: July 2026*
*Built with ❤️ by Arblok Digital — Tasikmalaya*
