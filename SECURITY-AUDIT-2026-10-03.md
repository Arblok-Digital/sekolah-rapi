# Security Audit — sekolah-rapi

- **Tanggal:** 2026-10-03
- **Scope:** repo `sekolah-rapi` (Next.js 14 App Router + Supabase), DB live `ertxywjnqqliqghtjycg`, deploy Vercel
- **Metode:** baca seluruh migrasi SQL (36 file), seluruh `src/`, `npm audit`, pemindaian `.next/static`, verifikasi silang manual terhadap temuan Critical
- **Mode:** mulanya read-only; perbaikan batch aman dieksekusi hari yang sama (lihat §9)
- **Status:** **C1 + C2 SUDAH DITUTUP** di DB live (migrasi `20261003002`); H2, H4, M3, M5, L7 sudah diperbaiki di kode; sisa: H1 (ikut C1), H3, H5, M1, M2, M4, M6, L1–L6

> Catatan: repo ini **publik** di GitHub. Riwayat git sudah diperiksa dan bersih (tidak ada secret yang pernah ter-commit).

---

## 1. Ringkasan

| Severity | Jumlah | Inti |
|---|---|---|
| 🔴 Critical | 2 | Jalur eskalasi privilège lewat INSERT `profiles` (role dev + masuk sekolah lain) |
| 🟠 High | 5 | RPC destruktif terbuka, bocor skema via error publik, Next.js CVE, middleware `/api`, gate status hanya di UI |
| 🟡 Medium | 6 | IDOR bergantung RLS, tak ada model role, tanpa CSP, rate limit bisa dibobol, cron lemah, FK tak diskop |
| 🔵 Low / Info | 7 | Grant anon, sync_queue, XSS latent, entropi no. kuitansi, dsb. |

**Yang sudah benar (ringkas):** RLS aktif di semua 12 tabel · git history bersih · service-role key tidak pernah masuk bundle browser · 16/17 fungsi `SECURITY DEFINER` sudah `SET search_path = ''` · middleware validasi session via `auth.getUser()` · semua Route Handler otorisasi sendiri · header HSTS/X-Frame-Options ada · view `financial_summary`/`spp_summary` sudah `security_invoker = true`.

---

## 2. 🔴 CRITICAL

### C1 — Pemalsuan `role = 'dev'` (eskalasi ke superadmin lintas tenant)

**Bukti:**
```sql
-- supabase/migrations/20260113011_fix_rls_register.sql:19-20
-- (diulang identik di 20260113012_dev_mode_enrollment.sql:120-121)
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());
```
- Penjaga privilège **hanya untuk UPDATE**: `20260802001_lock_profiles_privilege_columns.sql:41-43` → `BEFORE UPDATE OF role, school_id`.
- Verifikasi manual: **tidak ada `BEFORE INSERT` trigger di `profiles`** di seluruh migrasi; **tidak ada `CHECK` pada `profiles.role`** (`20260113002:7` → `role TEXT NOT NULL DEFAULT 'staff'` tanpa constraint).
- Rekomendasi `CHECK` pernah ditulis di `supabase/migrations/AUDIT_REPORT.md` item M-3 tapi **tidak pernah diimplementasi**.

**Eksploitasi:**
1. `POST /auth/v1/signup` → dapat JWT (confirm email **OFF**, `config.toml`).
2. `POST /rest/v1/profiles {"id":"<uid>","role":"dev"}` (pakai anon key + JWT).
3. `private.is_dev_user()` kini true → policy `Dev: full access ...` (`20260113012:99-196`) + `private.user_has_school()` selalu true (`20260801001:27-39`).

**Dampak:** baca/tulis **seluruh data semua sekolah**; menjalankan `dev_nuclear_delete()` (hapus semua data), `dev_delete_school_data`, `dev_delete_user`; mengakses API `/api/admin/*`.

**Dampak sederhana:** *"Satu akun gratis bisa naik jadi superadmin, lihat dan hapus seluruh isi aplikasi."*

---

### C2 — Menyusup ke sekolah lain saat INSERT profil

**Bukti:** kebijakan yang sama tidak mengikat `school_id`. Keanggotaan sepenuhnya ditentukan kolom itu:
```sql
-- 20260113010_rls_policies.sql:12-21
SELECT array_agg(school_id) FROM public.profiles WHERE id = auth.uid();
```
UUID sekolah bocor lewat link `/register-student?school=<uuid>` dan kelihatan di panel dev.

**Eksploitasi:** daftar → `POST /rest/v1/profiles {"school_id":"<uuid-sekolah-korban>"}` → jadi anggota penuh → CRUD siswa, SPP, transaksi, kategori sekolah itu.

**Dampak sederhana:** *"Bisa ikut campur di keuangan sekolah lain: hapus tagihan, sisipkan transaksi palsu, laporan jadi kotor."*

---

## 3. 🟠 HIGH

| ID | Temuan | Bukti | Dampak | Status |
|---|---|---|---|---|
| H1 | Semua RPC destruktif `dev_*` di-`GRANT EXECUTE ... TO authenticated`, digembok hanya oleh `role` yang bisa dipalsukan (rantai dari C1) | `20260802002:243-255` | Begitu jadi dev: hapus semua data lewat 1 pemanggilan | ✅ ikut C1 (role dev tak bisa dipalsukan; keputusan: grant tidak dicabut) |
| H2 | **Pesan error Postgres mentah tampil di halaman publik** → oracle skema tanpa login | `enrollment.service.ts:32` → `register-student/page.tsx:69,141`; pola sama di `toast.tsx:55-63`, `login/page.tsx:28-31` | Enumerasi nama tabel/kolom/konstraint/kebijakan RLS | ✅ `toUserMessage()` di `shared/lib/safe-error.ts`, dipakai toast + semua titik tampil error |
| H3 | `next@14.2.35` = **1 critical** (DoS Image Optimizer `remotePatterns`) + ~20 high advisory. Jalur 14.2.x **terminal** (fix hanya di 15.5.24 / 16.3.x) | `package.json:28`, `npm audit` | Catatan: RCE Windows `CVE-2026-75604` hanya kena `next dev` di mesin ini (prod Vercel/Linux aman); AVIF RCE tak terpakai (format default webp) | ⏳ tunda (upgrade major = proyek sendiri) |
| H4 | `middleware.ts:14` meloloskan **semua `/api` tanpa cek session** | `src/middleware.ts:14` | Route handler baru bisa jadi publik tanpa sadar | ✅ pengecualian jadi hanya `/api/cron`; diverifikasi: `/api/admin/users` tanpa sesi → redirect `/login` |
| H5 | Sekolah `pending`/`rejected` hanya di-redirect di UI; **akses DB tetap jalan** (gate `status='active'` hanya dipakai fitur berbayar) | `AuthProvider.tsx:202-215` vs `20260113012:132-190` | Sekolah yang ditolak tetap bisa baca/tulis datanya | ⏳ tunda (blokir hanya `rejected`; `active` penuh mematikan onboarding) |

---

## 4. 🟡 MEDIUM

| ID | Temuan | Bukti | Dampak (bahasa awam) | Status |
|---|---|---|---|---|
| M1 | Semua `update/delete` di service hanya `.eq('id', id)` tanpa `school_id` — **RLS satu-satunya tameng**. Pre-read gagal pun diam-diam lanjut | `student.service.ts:119-124,125,143` · `transaction.service.ts:124,177` · `spp.service.ts:388,641` · `payroll.service.ts:39-48,131,243` · `inventory.service.ts:75-91` · `category.service.ts:106,140` | Aman selama RLS benar, tapi **cuma 1 lapis** — satu kebijakan salah ketik = tembus lintas sekolah | ⏳ tunda/review (sentuh banyak service) |
| M2 | Model role di app: `owner/staff/teacher` **tidak pernah dicek di server** (hanya `dev`) | grep `role === 'owner'` → 0 handler | Begitu ada akun karyawan, karyawan = pemilik (hapus siswa/gaji/tagihan) | ⏳ bagian dari fitur owner/admin yang akan dibangun |
| M3 | Tidak ada **Content-Security-Policy** | `next.config.mjs:20-33` (X-Frame-Options DENY, HSTS, nosniff sudah ada) | Satu XSS langsung jadi pencurian sesi login tanpa rem | ✅ `Content-Security-Policy-Report-Only` aktif; flip jadi `Content-Security-Policy` setelah yakin bersih |
| M4 | Rate limit bisa dibodohi: IP dari `x-forwarded-for` hop pertama + `Map` in-process; `/login` tanpa limit app | `rate-limit.ts:8,22-28` | Brute-force password tanpa batas | ⏳ tunda (butuh Vercel KV) |
| M5 | Cron cuma dilindungi header `x-vercel-cron` yang bisa dipalsukan; `CRON_SECRET` tidak pernah diisi | `api/cron/keepalive/route.ts:14-19` | Siapa saja bisa memicu query → bakar kuota | ✅ `CRON_SECRET` kini **wajib** bila diset; tanpa secret masih menerima header cron (kompatibilitas). **Aksi manual: isi `CRON_SECRET` di env Vercel** |
| M6 | FK anak tidak diskop sekolah (bayar `school_id=A` dengan `student_id` sekolah B) | `20260113012:150-154`, `20260113006:8` | Data keuangan nyambung ke siswa salah; bisa probing UUID lewat error FK | ⏳ tunda (butuh migrasi constraint lintas tabel) |

---

## 5. 🔵 LOW / INFO

- **L1** `GRANT SELECT ON payroll_items TO anon` (`20260909006:26`) — satu kebijakan longgar dari bocor.
- **L2** `sync_queue` policy hanya `user_id = auth.uid()` tanpa `school_id` (`20260113012:213-214`).
- **L3** Sebagian policy migrasi `012` tidak pakai `TO authenticated` (aman karena `auth.uid()` null utk anon, tapi kurang rapi).
- **L4** `get_user_school_ids()` tanpa `SET search_path` (injakan `pg_temp`).
- **L5** `dangerouslySetInnerHTML` + `JSON.stringify` tanpa escape `</script>` — latent, konten masih statis (`src/app/page.tsx:41`, `panduan/[slug]/page.tsx:115`).
- **L6** Nomor kuitansi 4 digit entropi rendah (`receipt/types.ts:42-50`) — belum berbahaya karena tidak ada endpoint lookup.
- **L7** `.env.example` masih mencontoh format key JWT lama (aslinya `sb_publishable_`/`sb_secret_`); `.gitignore` baris `.env*` juga menimpa `.env.example`.
- **Info** `AUDIT-REPORT.md` (root) sudah basi: klaim "No CRITICAL" sudah tidak berlaku; temuan M-3 (CHECK role) persis akar C1 dan belum pernah diperbaiki.

---

## 6. ✅ Yang sudah dikerjakan dengan benar

1. RLS aktif di **semua 12 tabel**; tidak ada `DISABLE ROW LEVEL SECURITY`, tidak ada `USING (true)` yang tersisa; setiap `DROP POLICY` selalu diganti lebih ketat.
2. **Riwayat git bersih** — diverifikasi lintas seluruh ref: 0 JWT / `sk_live` / `ghp_` / private key / `.env.local`.
3. **Service-role key tidak pernah nyangkut di bundle browser** (discan `.next/static`, 0 kemunculan); semua pemakaian di Route Handler setelah verifikasi JWT + cek role.
4. 16/17 fungsi `SECURITY DEFINER` sudah `SET search_path = ''` + `REVOKE FROM PUBLIC`.
5. Middleware validasi session via `auth.getUser()` (bukan decode cookie) + allowlist publik terpusat (`public-paths.ts`).
6. Semua API route otorisasi sendiri, beberapa bahkan client request-scoped (`schools/[schoolId]/route.ts:41-48`).
7. `submit_enrollment` dihardening: batas 200 char, field wajib, dedupe 10 menit, `status` dipaksa `pending`.
8. `REVOKE ALL ON schools FROM anon` + grant kolom sempit `schools(id, name)` (`20260909003`).
9. Tidak ada `console.log` di `src/`; API route mengembalikan pesan generik dan mencatat detail di server.
10. Kuitansi dibagikan sebagai PNG via Web Share API — tidak ada link/token yang bisa ditebak.

---

## 7. Rencana perbaikan + dampak ke flow

### Batch aman (TIDAK mengubah flow registrasi / approval / dev)

| Prioritas | Fix | Dampak flow |
|---|---|---|
| **P0** | Migrasi: `CHECK (role ...)` + `BEFORE INSERT` trigger di `profiles` (tolak role non-default & `school_id` bukan milik sendiri; bypass `service_role`/`postgres`/`is_dev_user()`) → **tutup C1 + C2** | **Tidak berubah** — register & onboarding selalu buat sekolah dulu (`owner_id` sendiri) lalu profil `role:'owner'` (`register/page.tsx:80-100`, `onboarding/page.tsx:65-80`), jadi tetap lolos |
| **P1** | Map error Supabase ke pesan generik di boundary service → tutup H2 | Pesan error jadi lebih sopan; detail pindah ke console/server |
| **P1** | Hapus pengecualian `/api` di middleware **dengan tetap mengecualikan `/api/cron`**; isi `CRON_SECRET` di env Vercel → tutup H4 + M5 | Tidak berubah (asal cron tetap dikecualikan) |
| **P2** | Tambah `.eq('school_id', …)` pada semua update/delete service + fail-loud saat pre-read null → perkuat M1 | Internal saja, UI tak berubah |
| **P2** | CSP mode **`Report-Only`** dulu → M3 | Tidak memaksa, jadi tak ada risiko |

**Keputusan sadar (tidak di-revoke):** RPC `dev_*` tetap `GRANT EXECUTE ... TO authenticated` — panel dev memanggilnya langsung dari browser (`dev/admin/page.tsx:144-184`), dan begitu C1 tertutup `role='dev'` mustahil dipalsukan. Fungsi juga sudah cek `is_dev_user()` di dalam SQL.

### Tunda (mengubah flow / proyek terpisah)

1. **Enforce peran owner/staff/teacher** — butuh keputusan desain "karyawan boleh ngapain". Belum ada akun staff, jadi tanpa dampak hari ini.
2. **Gate `status`** — blokir hanya `rejected` (pending tetap boleh isi data onboarding). `status='active'` penuh akan menghentikan onboarding.
3. **Upgrade Next 14 → 15.5.24 / 16.3.x** — semver-major (async `params`, dsb) + plugin PWA. Proyek sendiri.
4. **Rate limit login** — pilih backend (Vercel KV/Upstash); berpotensi men-throttle user yang lupa password.

---

## 8. Verifikasi temuan utama

Diperiksa manual oleh pemeriksa utama (bukan hanya hasil agen):

- `SELECT` policy `profiles` dari 2 file migrasi → dikonfirmasi `WITH CHECK (id = auth.uid())` saja.
- Grep `BEFORE INSERT` di seluruh `supabase/migrations/` → tidak ada yang menyentuh `profiles`.
- Grep `CHECK.*role` → tidak ada constraint pada `profiles.role`.
- `npm audit` → `critical=1 (next), high=20, moderate=3`.
- Scan `.next/static` terhadap nilai `SUPABASE_SERVICE_ROLE_KEY` → 0 kemunculan.
- Baca `register/page.tsx` & `onboarding/page.tsx` → urutan sekolah → profil terkonfirmasi.

---

## 9. Catatan eksekusi (2026-10-03, hari yang sama)

### P0 — migrasi `supabase/migrations/20261003002_lock_profile_insert.sql` (SUDAH DI-APPLY ke DB live)

Isi: `CHECK (role IN ('owner','admin','staff','teacher','dev'))` + `BEFORE INSERT` trigger `private.prevent_profile_insert_escalation()` (SECURITY DEFINER, `search_path=''`). Bypass hanya `service_role` / `session_user='postgres'` / dev nyata; selain itu wajib role diizinkan **dan** `schools.owner_id = auth.uid()`.

**PoC SEBELUM fix (live):** signup akun baru → `POST /rest/v1/profiles {role:"dev"}` → **201**, lalu `GET /schools` membaca **3 sekolah milik orang lain**. Jalur UPDATE sudah aman sejak awal (400 `Role profil hanya dapat diubah melalui jalur admin tepercaya`) → bypass `postgres` tidak kepakai untuk request browser.

**PoC SESUDAH fix (live):**
- `role:"dev"` → **400** `Role tidak diizinkan`
- `school_id` milik sekolah lain → **400** `Hanya pemilik sekolah yang boleh menambah pengguna di sekolahnya`
- registrasi normal (sekolah dulu → profil `owner`) → **201** (flow pendaftaran utuh)
- owner mencoba buat profil `admin` untuk uid lain → **403 RLS** → butuh route backend `service_role` (rencana fitur admin)

**Bersih-bersih:** 4 user uji `audit-*@example.com` + 1 sekolah uji dihapus; DB kembali persis 4 user / 4 profil asli.

### Batch kode (belum di-commit)

| Fix | File |
|---|---|
| H2 — sanitasi pesan error | `src/shared/lib/safe-error.ts` (baru), `ui/toast.tsx`, `login/register/onboarding/register-student`, `spp/audit/categories/students/page.tsx`, `useStudents.ts`, `useTransactions.ts`, `StudentImport.tsx`, `TransactionHistory.tsx`, `PaymentForm.tsx`, `useOfflineSync.ts`, `ErrorBoundary.tsx` |
| H4 — middleware `/api` | `src/middleware.ts:14` → hanya `/api/cron` yang lolos |
| M5 — cron auth | `src/app/api/cron/keepalive/route.ts` (CRON_SECRET prioritas), `.env.example`, `src/shared/types/env.d.ts` |
| M3 — CSP Report-Only | `next.config.mjs` |

**Verifikasi:** `typecheck` ✓ · `lint` ✓ (0) · `test` 7/7 ✓ · `build` 49/49 halaman ✓ · runtime: `/` & `/login` 200 · `/overview` & `/api/admin/users` tanpa sesi → redirect `/login` · `/api/cron/keepalive` tanpa header 401, dengan `x-vercel-cron:1` 200 · header `Content-Security-Policy-Report-Only` terpasang.

**Aksi manual tersisa:** (1) isi `CRON_SECRET` di env Vercel, (2) commit + push batch ini.

---

*Audit ini basi setiap kali ada perubahan kebijakan RLS atau dependency. Jalankan ulang setelah upgrade Next.js dan setelah setiap migrasi RLS.*
