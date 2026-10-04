# SekolahRapi Knowledge Pack (auto-generated)

> Kompilasi dokumen .ai/* + marketing untuk AI assistant chat. Jangan membaca source code mentah kecuali diminta.



---

## README.md

# Cara Pakai RAG SekolahRapi

## Untuk Pemilik Proyek

Saat ganti model AI, kirim instruksi ini:

> Baca `RAG.md` dulu. Ikuti peta baca hemat token, cek task aktif, verifikasi source sebelum klaim atau edit, dan update handoff setelah selesai.

Tidak perlu menempel seluruh dokumentasi ke chat. Model membuka konteks sesuai tugas.

## Untuk AI Baru

Urutan boot:

1. Baca `RAG.md`.
2. Baca `.ai/TASKS.md`.
3. Baca satu atau dua dokumen domain yang ditunjuk router.
4. Jalankan `git status --short` sebelum edit.
5. Baca source target dan dependensinya; jangan mengandalkan ringkasan saja.
6. Kerjakan scope terkecil yang memenuhi acceptance criteria.
7. Jalankan validasi relevan.
8. Update `.ai/TASKS.md` dan tambahkan entri `.ai/CHANGELOG.md`.

## Aturan Retrieval

- Jangan muat semua file `.ai` jika tugas sederhana.
- Gunakan pencarian file/simbol sebelum membaca file panjang.
- Cari detail yang tidak diringkas di RAG di file `.ai` yang ditunjuk router, lalu cek kembali ke source.
- Perlakukan `AUDIT-REPORT.md` sebagai snapshot historis, bukan status mutakhir.
- Materi `marketing/` adalah draft copy, bukan bukti fitur.

## Aturan Update

- Ubah `PRODUCT-TRUTH.md` jika status fitur/klaim berubah.
- Ubah `ARCHITECTURE-MAP.md` jika route, module, schema, atau alur auth berubah.
- Ubah `BUSINESS-MARKETING.md` hanya jika owner menetapkan offer/ICP/CTA baru.
- Catat keputusan permanen di `DECISIONS.md`, bukan hanya di chat.
- Jangan menyimpan transcript panjang. Tulis hasil, alasan, file, validasi, dan next step.


---

## PRODUCT-TRUTH.md

# Product Truth Matrix

Tanggal snapshot: 2026-08-01. Verifikasi ulang jika source berubah.

## Fakta Inti

| Area | Status | Fakta dan batasan | Sumber utama |
|---|---|---|---|
| Platform | `VERIFIED` | Web app administrasi sekolah, Next.js + Supabase | `package.json`, `src/app/` |
| Multi-tenant sekolah | `VERIFIED` | Tabel domain memakai `school_id`; migration menyediakan RLS | `supabase/migrations/20260113010_rls_policies.sql` |
| Auth | `VERIFIED` | Cookie session via Supabase SSR; middleware refresh user | `src/middleware.ts`, `src/shared/providers/AuthProvider.tsx` |
| Siswa | `VERIFIED` | CRUD, import Excel, pencarian/tabel | `src/modules/students/` |
| SPP | `VERIFIED` | Pencatatan pembayaran dan status pembayaran | `src/modules/spp/` |
| Kas/transaksi | `VERIFIED` | Pemasukan, pengeluaran, kategori, riwayat | `src/modules/transactions/` |
| Pendaftaran online | `VERIFIED` | Form publik dan review owner tersedia | `src/app/register-student/page.tsx`, `src/modules/enrollment/` |
| Inventaris | `VERIFIED` | Modul, service, hook, page, migration tersedia | `src/modules/inventory/`, migration `013` |
| Payroll | `VERIFIED` | Modul, service, hook, page, migration tersedia | `src/modules/payroll/`, migration `014` |
| Laporan | `VERIFIED` | Route laporan tersedia; cek isi sebelum menyebut jenis laporan spesifik | `src/app/(dashboard)/reports/page.tsx` |
| Realtime | `VERIFIED` | Digunakan untuk pembaruan data tertentu | `src/app/(dashboard)/overview/page.tsx` |
| Offline | `PARTIAL` | Dexie/sync tersedia, tetapi fallback tidak merata di semua modul | `src/modules/offline/`, `src/modules/students/services/student.service.ts` |
| PWA | `VERIFIED` | Manifest dan next-pwa dependency/config tersedia | `public/manifest.json`, `next.config.mjs` |
| Role | `PARTIAL` | Docs, types, constants, dan implementasi tidak konsisten | `src/shared/types/index.ts`, `src/shared/constants/index.ts`, `RAG.md` |
| Plan/entitlement | `VERIFIED` | Registry canonical, UI/route UX gate, service preflight, serta enforcement RLS/RPC tersedia; aktivasi pembayaran masih manual melalui Dev Admin/API terpercaya | `src/shared/entitlements/`, `src/shared/services/plan-guard.ts`, migration `20260801001` dan `20260801002` |
| Dev admin | `VERIFIED` | Route ada dan diblokir middleware di production | `src/app/(dashboard)/dev/admin/page.tsx`, `src/middleware.ts` |

## Guardrails Klaim Publik

### Boleh Diklaim

- Administrasi siswa, SPP, kas/transaksi, pendaftaran, inventaris, dan payroll dalam satu web app.
- Data sekolah dipisahkan menggunakan `school_id` dan kebijakan RLS tersedia.
- Import siswa dari Excel, jika copy tidak menjanjikan format apa pun tanpa batas.
- Dashboard dan pembaruan realtime untuk alur yang memang berlangganan perubahan.
- PWA/offline-ready dengan keterangan bahwa cakupan offline masih terbatas.

### Wajib Pakai Batasan

- Gunakan "offline-ready untuk alur tertentu", bukan "tetap semua bisa dipakai tanpa internet".
- Gunakan "RLS membantu memisahkan akses data sekolah", bukan "100% aman".
- Gunakan "laporan operasional/keuangan yang tersedia", lalu sebut jenis hanya setelah membuka page laporan.
- Harga, durasi, setup, support, dan refund harus mengikuti keputusan owner terbaru.

### DO NOT CLAIM

- `100% offline` atau seluruh modul dapat input/sync offline.
- `5 role aktif`, multi-user role lengkap, atau permission matrix matang.
- `Multi sekolah dan cabang` untuk satu owner tanpa bukti alur UI dan entitlement.
- Sertifikasi keamanan, compliance, atau "sesuai standar privasi pendidikan".
- Verifikasi dokumen pendaftaran jika hanya input data tanpa upload/verification flow.
- Neraca, arus kas, laba rugi, audit-ready, atau PDF custom tanpa verifikasi page dan output aktual.
- Gratis selamanya/tanpa biaya lisensi jika offer aktif adalah pilot berbayar.
- Jumlah pelanggan, rating, testimoni, penghematan, atau persentase hasil tanpa data nyata.

## Konflik yang Harus Diselesaikan

| Konflik | Status saat ini |
|---|---|
| Docs lama menyebut `dev/owner`; shared types/constants menyebut role lain | Belum dinormalisasi; jangan klaim 5 role |
| Docs lama menyebut plan `free/basic/premium`; registry canonical memakai `free/basic/pro/lifetime` | Resolved di registry; docs legacy tetap harus ditinjau sebelum dijadikan referensi |
| Audit lama menyebut `.env.example` tidak ada | Sudah stale; file sekarang ada |
| Marketing menyebut 100% offline | Bertentangan dengan implementasi parsial |
| Pricing membatasi fitur per plan | Resolved melalui registry, route/service UX, dan enforcement Supabase RLS/RPC |

## Klasifikasi Plan 2026-08-01

Klasifikasi ini sudah diterapkan di registry, navigation, route UX, service preflight, dan database/RPC. Aktivasi pembayaran tetap manual; browser tidak boleh self-upgrade.

| Plan | Job utama | Fitur pembeda |
|---|---|---|
| Free | Mencoba pencatatan administrasi dasar | Siswa, SPP, kas dasar, 1 pengguna, kategori terbatas |
| Basic | Menjalankan operasional dan pelaporan rutin | Laporan operasional/keuangan, ekspor dan import Excel, kategori kas tanpa batas |
| Pro | Menghilangkan bottleneck penerimaan dan memberi visibilitas owner | Pendaftaran siswa online, dashboard owner realtime/mobile, payroll, inventaris, support dan onboarding prioritas |

Database utama tetap cloud-hosted di Supabase agar akses lintas perangkat dan realtime bekerja. Penyimpanan lokal/Dexie adalah lapisan offline terbatas, bukan sumber data utama atau pengganti database cloud.


---

## ARCHITECTURE-MAP.md

# Architecture Map

## Batas Sistem

- Frontend dan server routing: Next.js App Router di `src/app/`.
- Feature domain: `src/modules/<domain>/` berisi components/hooks/services/types.
- Shared infrastructure: `src/shared/`.
- Database/auth/realtime: Supabase; schema versioned di `supabase/migrations/`.
- Offline: Dexie dan sync queue di `src/modules/offline/`.

## Route Map

Sumber kebenaran visibility route: `src/shared/constants/public-paths.ts` (dipakai bersama oleh middleware dan AuthProvider).

Public indexable:

- `/` landing page, `/pricing`.
- Marketing prefixes: `/fitur`, `/solusi`, `/panduan`, plus planned `/blog`, `/tentang`, `/kontak`, `/keamanan-data`, `/kebijakan-privasi`, `/syarat-ketentuan` (otomatis publik via prefix, tanpa allowlist manual).

Public noindex:

- `/login`, `/register` auth.
- `/register-student` formulir pendaftaran publik.

Protected/dashboard:

- `/overview`, `/students`, `/spp`, `/transactions`, `/reports`.
- `/enrollment`, `/inventory`, `/payroll`.
- `/audit` (riwayat kas/audit cashflow), `/categories` (manager kategori).
- `/onboarding`, `/pending-approval`, `/rejected`.
- `/dev/admin` hanya non-production menurut middleware (redirect di NODE_ENV=production).

API:

- `src/app/api/admin/users/route.ts`.
- `src/app/api/admin/delete-user/route.ts`.
- `src/app/api/admin/schools/[schoolId]/route.ts`.
- `src/app/api/cron/keepalive/route.ts` (keepalive anti-pause Supabase, jadwal via `vercel.json`).

## Module Pattern

Umumnya page memanggil hook TanStack Query, hook memanggil service, service berinteraksi dengan Supabase. Types domain berada dekat modul. Jangan menaruh business logic baru langsung di page jika pola service/hook sudah tersedia.

## Auth Flow

1. Browser login/register melalui Supabase Auth.
2. `@supabase/ssr` menyimpan session cookie.
3. `src/middleware.ts` memanggil `auth.getUser()` untuk refresh/validasi.
4. User tanpa session diarahkan ke `/login` untuk route non-public.
5. `AuthProvider` memuat profile dan school untuk context client.

Catatan: middleware hanya memeriksa user/session, bukan seluruh authorization domain. RLS tetap menjadi lapisan wajib.

## Database Map

Migration berurutan membuat:

- Core: schools, profiles, students, spp_payments, transactions, categories.
- Supporting: sync_queue, financial_summary, default categories, RLS.
- Later modules: enrollment, inventory, payroll, dev user deletion, rejected status.

Sebelum DDL:

1. Baca migration terkait dan migration setelahnya.
2. Bandingkan dengan database live jika akses tersedia.
3. Buat migration baru; jangan mengedit migration lama yang sudah diterapkan.
4. Audit RLS dan foreign key untuk semua operasi baru.

## Source of Truth Rules

- Schema live lebih kuat dari migration jika ditemukan drift; drift harus dicatat dan diperbaiki dengan migration baru.
- Generated DB types seharusnya mengikuti schema live, tetapi file saat ini diketahui dapat stale.
- Interface lokal yang berbeda bukan bukti schema berbeda.
- UI/copy bukan bukti enforcement permission atau plan.

## Validation

- Minimum code change: `npm run lint`, `npm run typecheck`, `npm run test` (Vitest), dan `npm run build` jika memungkinkan.
- Test folders: `tests/unit`, `tests/integration`, `tests/e2e`.
- Untuk perubahan DB, jalankan advisor/security check jika tool Supabase tersedia.


---

## BUSINESS-MARKETING.md

# Business and Marketing Context

## Positioning

SekolahRapi membantu pengelola sekolah swasta/madrasah merapikan administrasi operasional yang tersebar di buku, chat, dan spreadsheet: data siswa, SPP, kas, pendaftaran, inventaris, dan payroll.

## Acquisition Strategy

Status: `PLANNED`; implementasi bertahap mengikuti `.ai/ORGANIC-GROWTH-ROADMAP.md`.

- Organic-first karena belum ada budget ads: SEO, AEO, GEO, konten edukasi, distribusi komunitas, dan founder-led demo.
- Homepage menjelaskan positioning; halaman fitur/solusi menangkap commercial intent; panduan menangkap informational intent.
- Konten harus memindahkan calon buyer ke langkah relevan: artikel → fitur/solusi → pricing/demo → onboarding/pilot.
- Ukur impression, CTR, lead WhatsApp/demo, registrasi berkualitas, pilot, dan pelanggan aktif; traffic saja bukan success metric.
- Tidak ada jaminan ranking/citation AI dan tidak boleh membuat statistik traffic, testimonial, atau social proof palsu.

## ICP Awal

- Owner/yayasan, kepala sekolah, atau bendahara sekolah swasta dan madrasah kecil-menengah.
- Masih mengandalkan pencatatan manual atau spreadsheet terpisah.
- Mengalami tunggakan sulit dilacak, laporan lambat, data ganda, dan handoff admin yang tidak rapi.
- Membutuhkan onboarding praktis, bukan sekadar software self-service.

## Offer Aktif untuk Landing Page Berikutnya

Status: `PLANNED`, keputusan kerja untuk redesign; konfirmasi owner sebelum publish/deploy.

- Pilot 30 hari: Rp299.000.
- Termasuk setup awal, bantuan import data, dan onboarding remote.
- CTA utama: jadwalkan demo 20 menit / konsultasi via WhatsApp.
- CTA sekunder: lihat bagaimana sistem bekerja atau login untuk pengguna existing.
- Jangan gunakan "gratis selamanya" sebagai janji utama.

## Message Hierarchy

1. Hook masalah: pendaftar tercecer di chat/kertas dan owner harus menunggu rekap untuk mengetahui uang masuk-keluar.
2. Hasil: pendaftaran masuk melalui form online dan owner dapat melihat aktivitas kas terbaru tanpa menunggu rangkuman manual.
3. Fondasi: administrasi siswa, SPP, kas, laporan, inventaris, dan payroll tetap terhubung dalam satu sistem.
4. Trust: transparan tentang batasan, onboarding oleh manusia, dan pemisahan data berbasis RLS.
5. CTA: demo singkat, lalu pilot terarah.

## Landing Page Guardrails

- Conversion-first, mobile-first, cepat, dan tidak terasa sebagai template AI generik.
- Gunakan bahasa Indonesia natural dan spesifik; hindari superlatif kosong.
- Jangan membuat logo pelanggan, testimonial, statistik, rating, atau badge palsu.
- Mockup wajib diberi konteks "contoh tampilan" jika angkanya bukan data nyata.
- Jangan membuat link ke route yang tidak ada (`/docs`, `/about`, `/blog`, dan sejenisnya) tanpa implementasi.
- Metadata, canonical, Open Graph, FAQ, dan structured data harus sesuai konten aktual.
- SEO/GEO/AEO: jawab pertanyaan buyer secara langsung, gunakan heading jelas, FAQ faktual, dan entity naming konsisten.
- Landing page tidak memuat payment widget atau direct checkout. CTA diarahkan ke demo, pricing, register, atau kontak.
- Billing langganan SekolahRapi adalah domain terpisah dari pembayaran SPP siswa dan ditempatkan di area akun setelah onboarding bila sudah diotomasi.

## Search Intent Map

| Intent | Contoh query | Target page type |
|---|---|---|
| Problem-aware | cara merapikan administrasi sekolah | Panduan/solution page |
| Feature-aware | aplikasi pembayaran SPP sekolah | Feature pillar |
| Commercial | aplikasi administrasi sekolah swasta | Homepage/solution/pricing |
| Operational | contoh buku kas atau rekap tunggakan SPP | Panduan praktis |
| Branded | SekolahRapi, harga SekolahRapi | Homepage/pricing |

Keyword masih hipotesis sampai ada data Search Console atau riset buyer. Jangan membuat banyak halaman tipis hanya untuk variasi keyword.

## Organic Conversion Path

```text
Search/community content
  → guide, feature, or solution page
  → contextual CTA to demo/pricing
  → register and onboarding
  → assisted pilot
  → manual payment link/invoice or future in-app billing
```

Checkout tidak menjadi elemen landing page. Saat billing otomatis belum tersedia, pembayaran/aktivasi tetap melalui jalur manual yang terverifikasi.

## Kata Kunci Awal

- aplikasi administrasi sekolah
- aplikasi pembayaran SPP sekolah
- aplikasi keuangan sekolah swasta
- software manajemen madrasah
- pencatatan kas dan SPP sekolah
- pendaftaran siswa online

Kata kunci adalah hipotesis awal, bukan hasil volume-search research.

## CTA dan Kontak

- Nomor WA terlihat di pricing saat snapshot: `+6289508053795`.
- Sebelum publish, konfirmasi nomor, format link `wa.me`, jam respons, dan template pesan.
- Jangan menyimpan data calon pelanggan ke layanan baru tanpa persetujuan owner.


---

## DECISIONS.md

# Decision Log

Gunakan format: tanggal, keputusan, alasan, dampak. Jangan menghapus keputusan lama; tandai superseded.

## 2026-08-01 - RAG Lokal Berbasis Markdown

- Keputusan: context AI disimpan sebagai Markdown versioned di repo, bukan vector database eksternal.
- Alasan: murah, portable antar model, dapat ditinjau via Git, dan tidak menambah layanan/dependency.
- Dampak: setiap AI wajib membaca `RAG.md` dan memperbarui handoff setelah tugas substansial.

## 2026-08-01 - Source Code Menang atas Copy

- Keputusan: database/source code adalah sumber fakta teknis; docs lama dan marketing tidak boleh dipakai sebagai bukti tunggal.
- Alasan: ditemukan konflik role, plan, offline, environment, dan fitur.
- Dampak: klaim publik memakai label confidence dan truth matrix.

## 2026-08-01 - Retrieval Hemat Token

- Keputusan: `RAG.md` menjadi router; model tidak perlu membaca semua docs pada setiap sesi.
- Alasan: owner sering mengganti model gratis dengan context limit terbatas.
- Dampak: dokumen dibagi berdasarkan domain dan dijaga ringkas.

## 2026-08-01 - Arah Offer Landing Page

- Status: `PLANNED`, perlu konfirmasi sebelum publish.
- Keputusan kerja: arahkan CTA ke demo 20 menit dan pilot 30 hari Rp299.000 termasuk setup/import/onboarding remote.
- Alasan: offer terarah lebih kredibel daripada janji gratis selamanya untuk buyer sekolah.
- Dampak: landing/pricing lama tidak boleh dianggap pricing source of truth sampai owner mengunci offer.

## 2026-08-01 - Pendaftaran dan Dashboard Owner sebagai Nilai Inti Pro

- Keputusan: pendaftaran siswa online dan dashboard owner realtime yang mobile-friendly ditempatkan pada plan Pro.
- Alasan: keduanya menyelesaikan bottleneck utama sekolah lintas pengguna dan membutuhkan alur publik, kontrol akses, koneksi cloud, serta realtime.
- Dampak: Free difokuskan untuk mencoba administrasi dasar; Basic untuk operasional dan pelaporan; Pro untuk akuisisi siswa dan visibilitas owner.
- Batasan: keputusan ini baru klasifikasi komersial. Entitlement belum enforced end-to-end dan wajib dibuat sebelum plan berbayar diaktifkan otomatis.

## 2026-08-01 - Cloud sebagai Database Utama

- Keputusan: Supabase PostgreSQL tetap menjadi database utama; database tidak wajib berada di komputer sekolah.
- Alasan: dashboard owner lintas lokasi, akses mobile, dan realtime membutuhkan sumber data cloud yang konsisten.
- Dampak: RLS, backup, audit akses, retensi data, dan recovery menjadi bagian operasional wajib. Dexie hanya digunakan sebagai cache/offline terbatas.

## 2026-08-01 - Entitlement sebagai Enforcement Database

- Keputusan: registry TypeScript menjadi source of truth UI, sedangkan Supabase menjadi enforcement terpercaya melalui plan CHECK, trigger anti-perubahan browser, helper entitlement `SECURITY DEFINER`, RLS, dan RPC.
- Kebijakan downgrade: data lama pada feature berbayar tetap dapat dibaca oleh user tenant yang sah, tetapi create/update/delete ditolak setelah plan turun.
- Pendaftaran publik: hanya sekolah `active` dengan plan Pro/Lifetime yang dapat menerima submission; submission memakai RPC dengan status selalu `pending` dan tidak mengembalikan policy SELECT anon.
- Alasan: hidden sidebar/client guard dapat dilewati; tenant boundary dan entitlement harus tetap berlaku pada direct request/Supabase call.
- Dampak: migration `20260801001_plan_entitlements.sql` dan hardening lifecycle `20260801002_lock_school_entitlement_lifecycle.sql` sudah diterapkan ke project terkonfirmasi `bbymrmysmerazdkubptc`. Aktivasi plan/status tetap manual melalui jalur server `service_role` setelah caller diverifikasi sebagai dev; browser hanya dapat membuat sekolah `free/pending` dan tidak dapat mengubah lifecycle state.

## 2026-08-03 - Organic-first dan Roadmap Terpisah

- Status: `PLANNED` untuk implementasi; keputusan dokumentasi aktif.
- Keputusan: akuisisi awal difokuskan pada SEO, AEO, GEO, konten bermanfaat, distribusi organik, dan founder-led demo karena belum ada budget ads.
- Alasan: homepage conversion-first saja belum membentuk search footprint; dibutuhkan technical foundation, pillar pages, topic clusters, trust, dan measurement loop.
- Dampak: detail disimpan di `.ai/ORGANIC-GROWTH-ROADMAP.md`; `RAG.md` tetap router ringkas agar retrieval hemat token.

## 2026-08-03 - Checkout Tidak Berada di Landing Page

- Keputusan: landing page mengarahkan ke demo, pricing, register, atau kontak; payment/checkout langganan SekolahRapi ditempatkan setelah buyer memahami paket, idealnya di area akun setelah onboarding.
- Alasan: penjualan saat ini masih high-consideration dan founder-led; checkout di landing page menambah kompleksitas sebelum offer, legal entity, dan volume tervalidasi.
- Boundary: pembayaran langganan SekolahRapi dan pembayaran SPP siswa adalah dua bounded context yang tidak boleh berbagi tabel/service/status ambigu.
- Dampak: aktivasi saat ini tetap manual melalui server terverifikasi. Otomasi berikutnya wajib memakai server-side checkout, webhook signed dan idempotent, audit trail, serta aktivasi entitlement berdasarkan event terpercaya—bukan redirect browser.


---

## PRICING-ENTITLEMENT-PIPELINE.md

# Pricing and Entitlement Pipeline

## Source of truth

`src/shared/entitlements/index.ts` is the canonical registry. It defines:

- plan IDs: `free`, `basic`, `pro`, `lifetime`;
- feature IDs and the minimum plan for each feature;
- display label and annual price;
- `hasFeature()` and `normalizePlan()` used by the application.

Do not create a second application/UI plan matrix in a page or module. The SQL helper must mirror
the registry because PostgreSQL is the trusted boundary; treat that mirror as deployment code and
update it in the same change whenever a feature minimum plan changes.
When pricing changes, update the registry first, then update the public pricing copy if needed.

## Runtime pipeline

1. `schools.plan` is read by `AuthProvider` after login.
2. `AuthProvider` normalizes the value and exposes `plan`, `canUse(feature)`, and `isDev`.
3. `Sidebar` keeps paid features discoverable, marks unavailable links as locked with `canUse`, and sends them to the gated route.
4. `src/app/(dashboard)/layout.tsx` wraps feature routes with `EntitlementGate`; direct navigation shows an upgrade prompt.
5. Mutating services call `assertSchoolFeature(schoolId, feature)` for fast UX feedback; this is not a security boundary.
6. Supabase migrations `20260801001_plan_entitlements.sql` and `20260801002_lock_school_entitlement_lifecycle.sql` are the trusted enforcement layer: plan CHECK, browser plan/status lifecycle trigger, `private.school_has_feature`, tenant-aware RLS, and feature RPCs.
7. Paid data is read-only after downgrade: authenticated tenant members may read existing inventory/payroll/enrollment data, while paid mutations are blocked by RLS/RPC.
8. Public enrollment uses `public.submit_enrollment(UUID, JSONB)` only. It validates active Pro/Lifetime entitlement, forces `pending`, and is executable by anon/authenticated without exposing anon SELECT.

## Feature map

| Feature | Free | Basic | Pro/Lifetime |
| --- | --- | --- | --- |
| Dashboard, siswa, SPP, kas | Yes | Yes | Yes |
| Laporan, import siswa | No | Yes | Yes |
| Pendaftaran online, realtime owner dashboard, payroll, inventaris | No | No | Yes |

## Change protocol for agents

- Search and modify the registry before touching pricing UI.
- Keep feature IDs stable; labels may change without changing IDs.
- Add a guard to every new write/mutation service for a paid feature.
- Add the route to `getRouteFeature()` and the sidebar entry with the same feature ID.
- Mirror feature minimum-plan changes in `private.school_has_feature()` in a new migration; application checks never replace database enforcement.
- Document migrations and billing/entitlement changes in `.ai/CHANGELOG.md` and update `.ai/TASKS.md`.
- Validate with `npm run lint` and `npm run build`.

## Current billing limitation

The database stores the selected plan in `schools.plan`, but payment activation is still operational/manual. A future billing integration must update this field through a trusted server/webhook path; never let the browser self-upgrade a school.

### Manual activation flow for operators

1. Finish the commercial negotiation and verify payment outside the application.
2. Sign in with the protected `dev` role and open `/dev/admin`.
3. Expand the target school, choose the paid plan from **Plan yang dibayar client**, then use **Approve + Aktifkan Plan** for a pending school or **Simpan Plan** for an active school.
4. The browser sends the choice to `PATCH /api/admin/schools/[schoolId]`; it does not update `schools` directly.
5. The API verifies the bearer session and confirms `profiles.role = dev`, then uses the server-only `SUPABASE_SERVICE_ROLE_KEY` client to change `schools.plan/status`.
6. On the next profile refresh/login, navigation and route UX follow the new plan; database RLS/RPC remains the final enforcement boundary.

In short: negotiation/payment verification → dev dropdown → trusted API → plan/status update → entitlement applied. Never expose the service-role key or replace this flow with a browser-side table update.

## Deployment and verification

- Both migrations were applied on 2026-08-01 to confirmed project `bbymrmysmerazdkubptc`; local and remote migration histories match through `20260801002`.
- Remote smoke checks confirmed the active Free school resolves `reports`, `student_import`, `enrollment`, `realtime_dashboard`, `payroll`, and `inventory` as unavailable, while direct anon enrollment is rejected by RLS. No production rows were inserted or modified.
- `schools.plan` and `schools.status` are lifecycle state. Browser inserts are restricted to `free/pending`; browser updates cannot change either value. The dev admin route changes lifecycle state only through a server-side `service_role` client after verifying the caller's `profiles.role = dev`.
- The development bypass is intentional: `private.is_dev_user()` permits feature access for the dev role, but normal users remain subject to plan and tenant checks.

### Advisor review (2026-08-01)

- Security advisor: 43 findings (`2 ERROR`, `41 WARN`) across the existing schema. Five entitlement RPC warnings are intentional SECURITY DEFINER entry points whose function bodies validate tenant and entitlement: anon `submit_enrollment`, plus authenticated `submit_enrollment`, `approve_enrollment`, `reject_enrollment`, and `import_students`. Review: https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable and https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable.
- Performance advisor: 154 findings (`154 INFO/WARN`) across the existing schema, dominated by 139 existing multiple-permissive-policy warnings. The entitlement-adjacent item is a missing covering index for `enrollment_requests.processed_by`: https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys.
- Existing advisor debt is not treated as fixed by this entitlement change. The intentional RPC exceptions must be re-reviewed whenever function bodies or grants change.

---

## ORGANIC-GROWTH-ROADMAP.md

# Organic Growth Roadmap

> Roadmap SEO, AEO, GEO, AI crawler, content, conversion, dan batas arsitektur billing SekolahRapi. Dokumen ini adalah rencana kerja; item berlabel `PLANNED` tidak boleh diklaim sudah aktif.

## 1. Tujuan dan Prinsip

### Goal

Membangun mesin akuisisi organik berbiaya rendah untuk menjangkau owner/yayasan, kepala sekolah, dan bendahara sekolah swasta atau madrasah kecil-menengah tanpa bergantung pada iklan berbayar.

### Prinsip

1. Produk dan klaim publik harus mengikuti `.ai/PRODUCT-TRUTH.md`.
2. Konten harus menjawab masalah operasional nyata, bukan mengejar keyword dengan halaman tipis.
3. Landing page membangun pemahaman dan kepercayaan; checkout tidak ditempatkan di landing page.
4. Pembayaran langganan SekolahRapi harus terpisah dari domain pembayaran SPP siswa.
5. Traffic bukan hasil akhir. Ukur impression, CTR, engagement, lead WhatsApp/demo, registrasi berkualitas, pilot, dan pelanggan aktif.
6. Jangan membuat testimoni, rating, statistik pelanggan, studi kasus, author credential, atau klaim ranking palsu.

## 2. Istilah Kerja

- **SEO (Search Engine Optimization):** memastikan halaman dapat dirayapi, dipahami, dan relevan untuk pencarian tradisional.
- **AEO (Answer Engine Optimization):** menyusun jawaban langsung, faktual, dan mudah diekstrak untuk featured snippets atau answer engines.
- **GEO (Generative Engine Optimization):** memperjelas entity, fakta, konteks, dan sumber agar sistem generatif dapat memahami dan mengutip produk secara tepat.
- **AI crawler readiness:** kebijakan crawler yang eksplisit, konten server-rendered dan dapat diakses, struktur semantik, sitemap, serta sumber ringkas seperti `llms.txt`.

Tidak ada optimasi yang menjamin ranking, citation, atau inclusion pada jawaban AI.

## 3. Baseline Audit 2026-08-03

### `VERIFIED` — Sudah Ada

- Homepage publik tersedia di `src/app/page.tsx` dengan title, description, canonical, Open Graph, Twitter card, dan schema `SoftwareApplication`.
- Root landing di `src/app/landing-page.tsx` menjadi satu alur conversion utama: hero spesifik, masalah, solusi terhubung, cara mulai, use case, FAQ, dan CTA WhatsApp.
- Root memakai `MarketingLayout`, header, dan footer yang sama dengan halaman pendalaman sehingga pengguna tidak berpindah ke sistem landing yang terasa terpisah.
- Bahasa homepage berorientasi pada masalah pendaftaran, visibilitas kas, dan administrasi sekolah tanpa statistik, testimoni, atau klaim performa yang tidak terbukti.
- Pillar dan supporting routes aktif meliputi `/fitur`, empat halaman fitur, `/solusi`, dua halaman solusi, `/panduan`, artikel panduan statis, dan `/pricing`.
- Internal links membentuk jalur root → fitur/solusi/panduan/pricing; checkout tetap tidak ditempatkan pada root.
- `robots.txt`, `sitemap.xml`, `llms.txt`, dan `manifest.json` aktif dan merespons HTTP 200 pada production build lokal.
- Route marketing utama dan satu artikel panduan terverifikasi merespons HTTP 200 tanpa login.
- Landing page tidak memuat payment widget atau checkout.
- Entitlement plan sudah memiliki fondasi TypeScript, service guard, UI gate, dan enforcement database/RPC; aktivasi lifecycle plan tetap melalui jalur server terverifikasi.

### `PARTIAL` — Ada tetapi Belum Cukup

- Metadata homepage cukup untuk fondasi awal; kelengkapan metadata global, OG image default, creator/publisher, dan konsistensi seluruh route masih perlu diaudit berkala.
- Schema hanya membentuk `SoftwareApplication`; entity graph Organization/WebSite, breadcrumb, article, dan halaman turunan belum tersedia.
- FAQ ada di homepage, tetapi structured data FAQ belum didokumentasikan sebagai aktif.
- Topic cluster sudah memiliki fondasi pillar dan panduan, tetapi jumlah serta kedalaman konten belum cukup untuk membentuk coverage organik yang matang.
- Homepage conversion-first sudah didukung feature pages, solution pages, dan content hub; trust pages dan bukti pilot nyata belum tersedia.
- Verifikasi mobile visual penuh masih memerlukan viewport perangkat nyata atau browser automation yang dapat mengubah viewport; implementasi header mobile sudah memiliki menu, state aksesibel, dan breakpoint `md`.

### `PLANNED` — Belum Aktif

- `noindex` konsisten untuk auth, onboarding, dashboard, dev/admin, dan status akun.
- Reusable JSON-LD entity graph dan schema halaman turunan.
- Halaman tentang, kontak, keamanan data, privasi, dan syarat ketentuan.
- Author/reviewer nyata, tanggal publish/update yang dikelola editorial, dan perluasan topic clusters.
- Search Console, Bing Webmaster Tools, analytics ringan, dan conversion event tracking.
- Automated SaaS billing/checkout, payment webhook, invoice, billing history, dan billing portal.

## 4. Target Information Architecture

Struktur ini menggabungkan route aktif dan target lanjutan. Route fitur, solusi, panduan, dan pricing sudah aktif; trust/legal routes masih target.

```text
/
├── /fitur
│   ├── /fitur/pendaftaran-siswa-online
│   ├── /fitur/keuangan-sekolah
│   ├── /fitur/pembayaran-spp
│   └── /fitur/laporan-sekolah
├── /solusi
│   ├── /solusi/sekolah-swasta
│   └── /solusi/madrasah
├── /panduan
│   └── /panduan/[slug]
├── /pricing
├── /tentang
├── /kontak
├── /keamanan-data
├── /kebijakan-privasi
└── /syarat-ketentuan
```

### Aturan Route

- Marketing route harus crawlable tanpa autentikasi.
- Auth, onboarding, dashboard, dev/admin, dan halaman status akun harus `noindex`.
- Middleware perlu memakai boundary/pola public marketing yang tidak mengharuskan perubahan allowlist untuk setiap artikel baru.
- Sitemap hanya memuat canonical public pages yang layak diindeks.
- Halaman tipis, duplikat, filter, query state, preview, dan private pages tidak masuk sitemap.

## 5. Search Intent dan Topic Clusters

Kata kunci berikut adalah hipotesis awal. Validasi dengan data Search Console, autocomplete, People Also Ask, forum/komunitas sekolah, dan percakapan calon pelanggan.

### Cluster A — Administrasi Sekolah

- aplikasi administrasi sekolah
- administrasi sekolah swasta
- cara merapikan data administrasi sekolah
- format administrasi sekolah

Pillar: `/solusi/sekolah-swasta` atau panduan administrasi sekolah.

### Cluster B — Keuangan dan Kas

- aplikasi keuangan sekolah swasta
- cara membuat laporan keuangan sekolah sederhana
- pencatatan kas masuk dan keluar sekolah
- contoh buku kas sekolah

Pillar: `/fitur/keuangan-sekolah`.

### Cluster C — SPP

- aplikasi pembayaran SPP sekolah
- contoh format pembayaran SPP siswa
- cara merekap tunggakan SPP
- pencatatan kas dan SPP sekolah

Pillar: `/fitur/pembayaran-spp`.

### Cluster D — Pendaftaran Siswa

- pendaftaran siswa online
- formulir pendaftaran siswa baru online
- cara mengelola data calon siswa
- proses penerimaan siswa sekolah swasta

Pillar: `/fitur/pendaftaran-siswa-online`.

### Cluster E — Madrasah

- software manajemen madrasah
- aplikasi administrasi madrasah
- pencatatan keuangan madrasah

Pillar: `/solusi/madrasah`; copy wajib tetap sesuai fitur produk yang terverifikasi dan tidak menyiratkan integrasi khusus Kemenag bila tidak ada.

## 6. Prioritas Konten Awal

1. Cara membuat laporan keuangan sekolah sederhana.
2. Contoh format pembayaran SPP siswa.
3. Cara mengelola pendaftaran siswa baru online.
4. Administrasi sekolah swasta yang perlu dirapikan.
5. Cara bendahara sekolah mencatat kas masuk dan keluar.
6. Template rekap tunggakan SPP.
7. Perbedaan rekap kas sekolah dan rekap pembayaran SPP.
8. Checklist serah terima administrasi bendahara sekolah.

Setiap artikel harus:

- menjawab intent utama dalam paragraf awal;
- memakai heading deskriptif, contoh, checklist, atau langkah yang benar-benar membantu;
- menghubungkan ke pillar page dan artikel terkait;
- memiliki CTA kontekstual ke demo/pricing, bukan hard sell berulang;
- memiliki author/reviewer nyata, tanggal publish/update, dan sumber bila relevan;
- tidak menjadikan konten hasil AI mentah sebagai bukti pengalaman.

## 7. Internal Linking dan Conversion Journey

### Internal Linking

```text
Homepage → feature/solution pillar
Pillar → supporting guides
Guide → related guide + relevant feature
All public content → pricing/demo/contact where contextually relevant
```

- Gunakan anchor text deskriptif dan natural.
- Tambahkan breadcrumb pada halaman turunan.
- Hindari orphan pages dan footer link spam.
- Artikel tidak boleh hanya dibuat untuk mengulang keyword menuju landing page.

### Conversion Journey

```text
Organic query
  → guide / feature / solution page
  → pricing or WhatsApp demo
  → register and school onboarding
  → pilot / assisted setup
  → in-app billing when available
```

Untuk fase founder-led saat ini:

```text
Landing/content → WhatsApp demo → pilot → invoice/payment link manual → server-side activation
```

## 8. Technical SEO, AEO, GEO, dan AI Crawler Plan

### Fase 1 — Technical Foundation

Status: `IN PROGRESS`; crawler endpoints dan route marketing utama sudah aktif, audit index policy serta metadata global masih dilanjutkan.

- [x] Tambahkan `src/app/robots.ts`.
- [x] Tambahkan `src/app/sitemap.ts`.
- [x] Tambahkan `public/llms.txt`; `llms-full.txt` hanya jika dapat dijaga akurat.
- Lengkapi root metadata dengan `metadataBase`, title template, publisher/creator, OG defaults, dan robots defaults.
- Tambahkan metadata unik dan canonical untuk setiap halaman publik.
- Terapkan `noindex` pada seluruh private/app utility surfaces.
- Perbaiki viewport accessibility; jangan mematikan browser zoom.
- Rapikan middleware agar marketing routes selalu publik dan dashboard tetap terlindungi.
- Audit broken links, status code, redirects, duplicate canonical, image dimensions, font, JS cost, dan Core Web Vitals.

Acceptance criteria:

- Marketing routes merespons tanpa login dan tidak terblokir crawler.
- Private routes tidak muncul dalam indeks.
- Robots dan sitemap valid serta hanya mencerminkan route aktual.
- Canonical konsisten pada host produksi.
- Typecheck, lint, test relevan, dan production build lulus atau kegagalan didokumentasikan.

### Fase 2 — Entity, Structured Data, dan Trust

Status: `PLANNED`.

- Buat helper JSON-LD reusable.
- Bentuk entity graph `Organization`, `WebSite`, dan `SoftwareApplication` memakai `@id` konsisten.
- Gunakan `BreadcrumbList` pada halaman turunan.
- Gunakan `FAQPage` hanya untuk FAQ yang benar-benar tampil dan sesuai kebijakan search engine.
- Gunakan `Article` pada konten editorial dengan author/reviewer nyata.
- Buat halaman tentang, kontak, keamanan data, privasi, dan syarat.
- Tambahkan bukti pilot/studi kasus hanya setelah ada izin dan data nyata.

Acceptance criteria:

- Schema valid dan sesuai konten visible.
- Tidak ada rating, review, statistik, compliance, atau customer claim tanpa bukti.
- Nama brand, URL, logo, kontak, dan deskripsi entity konsisten.

### Fase 3 — Pillar Pages dan Knowledge Hub

Status: `IN PROGRESS`; layout, pillar utama, hub, template panduan, internal links, dan CTA sudah aktif. Perluasan konten dan editorial trust masih berjalan.

- [x] Buat marketing layout reusable.
- [x] Implementasikan halaman fitur dan solusi berdasarkan intent.
- [x] Implementasikan `/panduan` dan template artikel.
- [x] Bangun fondasi cluster awal dan internal links dua arah.
- [x] Sediakan navigasi, related content, breadcrumb, dan CTA kontekstual.
- [ ] Perluas cluster menjadi 5–8 artikel berkualitas dengan author/reviewer nyata dan proses refresh.

Acceptance criteria:

- Setiap page memiliki intent, title, H1, description, canonical, dan CTA unik.
- Tidak ada route marketing mati atau placeholder yang diindeks.
- Konten mengutamakan usefulness dan fakta, bukan volume halaman.

### Fase 4 — Distribution dan Measurement

Status: `PLANNED`.

- Verifikasi Google Search Console dan Bing Webmaster Tools.
- Submit sitemap dan pantau coverage/indexing.
- Pasang analytics ringan dengan consent yang sesuai.
- Track CTA WhatsApp, demo, pricing view, registration start, onboarding complete, dan pilot conversion.
- Distribusikan ulang konten ke kanal organik dengan canonical/source link yang jelas.
- Review bulanan berdasarkan query, impression, CTR, engaged sessions, leads, dan conversions.

Acceptance criteria:

- Owner dapat membedakan traffic informasional, commercial intent, dan lead.
- Keputusan konten berikutnya berbasis query/lead aktual, bukan asumsi volume semata.
- Tidak ada tracking data pribadi baru tanpa persetujuan dan dokumentasi.

## 9. Billing SaaS Boundary

### Keputusan

Checkout/payment langganan SekolahRapi tidak ditempatkan di landing page. Landing page mengarahkan ke demo, pricing, register, atau contact. Billing berada setelah user memahami paket, idealnya dalam area akun seperti `/settings/billing` atau `/billing`.

### Jangan Campurkan Dua Domain

- **SPP siswa:** uang yang dibayar siswa/orang tua kepada sekolah; domain operasional sekolah.
- **Billing SaaS:** uang yang dibayar sekolah kepada SekolahRapi; domain komersial platform.

Keduanya tidak boleh memakai service, tabel, event, invoice, status, atau istilah database yang ambigu.

### Target Flow

```text
Pricing/demo
  → register/onboarding
  → choose plan in account
  → server creates checkout/payment request
  → provider payment
  → verified idempotent webhook
  → server updates subscription/order
  → entitlement activation
  → billing status/history visible to owner
```

### Fase 5 — Billing Automation

Status: `PLANNED`; dikerjakan setelah offer, legal entity, onboarding, entitlement, dan kebutuhan volume tervalidasi.

- Kunci pricing, trial/pilot, renewal, grace period, cancellation, refund, dan manual override policy.
- Pilih provider setelah membandingkan biaya, settlement, invoice/payment link, webhook, dan operasional legal entity.
- Buat bounded context billing, misalnya `src/modules/billing/`.
- Definisikan tabel seperti billing customer, subscription/order, payment attempt/event, invoice, dan webhook receipt tanpa hardcode ID provider.
- Buat server-side checkout/payment creation.
- Verifikasi signature webhook, simpan event idempotency, dan tangani retry/out-of-order event.
- Aktivasi entitlement hanya dari server setelah status terpercaya; redirect browser bukan bukti pembayaran.
- Sediakan status, invoice/receipt, renewal, failure recovery, dan audit trail.
- Pertahankan jalur manual terverifikasi sebagai fallback operasional.

Acceptance criteria:

- Tidak ada secret provider di client.
- Payment redirect tidak dapat mengaktifkan plan.
- Webhook replay tidak menduplikasi order atau aktivasi.
- Billing tenant terisolasi dan perubahan entitlement tercatat.
- Domain SPP tidak berubah akibat integrasi billing SaaS.

## 10. Prioritas Eksekusi

| Prioritas | Pekerjaan | Dampak | Dependency |
|---|---|---|---|
| P0 | Robots, sitemap, noindex, middleware boundary, metadata foundation | Crawl/index safety | Host produksi/canonical |
| P0 | Trust dan claim audit | Mencegah misinformasi | Product truth |
| P1 | Feature/solution pillar pages | Menangkap commercial intent | Marketing layout |
| P1 | Knowledge hub + 5–8 artikel berkualitas | Topical coverage | Editorial owner/reviewer |
| P1 | Search Console, Bing, CTA measurement | Feedback loop | Domain access |
| P2 | Case study nyata dan distribution loop | Trust/conversion | Pilot dan izin customer |
| P3 | Automated billing | Scale monetization | Offer/legal/volume validated |

## 11. Definition of Done Organic Foundation

- Semua route publik aktual crawlable dan tercantum secara tepat di sitemap.
- Semua private/app utility route memiliki policy `noindex` yang konsisten.
- Canonical, metadata, entity naming, dan structured data konsisten.
- Minimal satu pillar page per intent bisnis prioritas tersedia sebelum memperbanyak artikel.
- Internal links membentuk jalur homepage → pillar → guide → conversion.
- Search Console/Bing dan event conversion memberi feedback yang dapat dipakai.
- Semua klaim konten mengikuti truth matrix dan tidak menjanjikan ranking.
- Landing page tetap bebas checkout; billing SaaS tetap bounded context terpisah.

## 12. Review Cadence

- Mingguan saat implementasi: broken routes, indexing blockers, content status, dan leads.
- Bulanan setelah live: query, impressions, CTR, indexed pages, conversions, dan content refresh.
- Per kuartal: positioning, topic clusters, offer, pricing, trust evidence, dan kebutuhan billing automation.
- Setiap perubahan substansial wajib memperbarui `.ai/TASKS.md` dan `.ai/CHANGELOG.md`.


---

## TASKS.md

# Task Tracker

## Completed: Mobile/PWA Bug Fixes (Laporan, Kas, Logout, SPP sync Overview)

Goal: memperbaiki 4 bug laporan user PWA dan menyamakan semua agregasi SPP dengan dashboard Overview sebagai sumber kebenaran.

- [x] Laporan: kartu statistik responsif dan tabel bisa scroll horizontal tanpa angka masuk/keluar terpotong.
- [x] Kas: modal transaksi scrollable di HP, tombol Simpan terjangkau; kolom kategori menampilkan nama, bukan UUID.
- [x] Logout: tombol Keluar di header sticky untuk layar <lg (selalu terlihat di PWA).
- [x] SPP summary: outstanding = siswa aktif − bayar/angsuran bulan ini (identik Overview); collection rate mengikuti.
- [x] Tab Tunggakan: basis bulan (ikuti filter halaman), siswa tanpa tagihan ikut tampil sebagai belum bayar.
- [x] WIP user yang belum di-commit dipertahankan; lint, typecheck, 7/7 test, dan build lulus.

## Completed: Pro Positioning and Full-stack README

Goal: menempatkan bottleneck pendaftaran online dan visibilitas owner sebagai nilai inti Pro, sekaligus mendokumentasikan arsitektur aktual SekolahRapi.

- [x] Free, Basic, dan Pro diklasifikasikan berdasarkan job-to-be-done sekolah.
- [x] Pendaftaran online dan dashboard owner realtime/mobile ditempatkan pada Pro.
- [x] Supabase Cloud ditetapkan sebagai database utama; Dexie tetap cache/offline terbatas.
- [x] Root `README.md` menjelaskan stack, alur, module, auth, tenant, database, realtime, plan, setup, dan batasan.
- [x] Gap entitlement plan dicatat jujur sebagai backlog sebelum pembayaran otomatis.

## Completed: Dashboard Form Contrast Audit

Goal: memastikan semua field input manual dan konten pada permukaan putih tetap terbaca setelah dashboard memakai tema gelap.

- [x] Form siswa, pendaftar, SPP, transaksi, inventaris, payroll, dan filter laporan diaudit.
- [x] Input, select, textarea, placeholder, option, date control, autofill, focus, dan disabled state memiliki warna eksplisit.
- [x] Aturan hanya di-scope ke `dashboard-shell`, sehingga auth, onboarding, landing, dan form publik tidak terpengaruh.
- [x] Konten legacy pada card/modal `bg-white` tidak lagi mewarisi warna teks putih dari body.
- [x] Production build dan type-check lulus; tersisa satu warning hook offline lama.

## Completed: App Visual Redesign

Goal: menyelaraskan auth, onboarding, dan dashboard utama dengan identitas visual landing page tanpa mengubah alur bisnis.

- [x] Login, register, dan onboarding memakai auth shell bersama.
- [x] Sidebar, header dashboard, dan overview memakai palet hijau-krem SekolahRapi.
- [x] State loading/sukses onboarding tetap mempertahankan alur Supabase lama.
- [x] Production build dan type-check lulus; tersisa satu warning hook offline lama.

## Completed: Redesign Landing Page

Goal: membuat landing page SekolahRapi yang conversion-first, mobile-first, SEO/GEO/AEO-ready, dan hanya memakai klaim terverifikasi.

Acceptance criteria:

- [x] Hero menyebut buyer, masalah, hasil, mekanisme, dan CTA dengan jelas.
- [ ] Offer pilot dan CTA telah dikonfirmasi owner sebelum publish.
- [x] Tidak ada link mati atau bukti sosial palsu pada landing page.
- [x] Semua klaim landing page mengikuti status pada `.ai/PRODUCT-TRUTH.md`.
- [x] Metadata, OG, canonical, dan structured data ditambahkan.
- [x] `npm run lint` dan `npm run build` lulus; tersisa satu warning hook offline lama.

## Completed: RAG Lokal

Status: selesai; dipakai sebagai context router untuk task berikutnya.

Goal: membuat context system ringkas agar model AI yang berganti dapat bekerja tanpa halusinasi dan tanpa context dump mahal.

- [x] Entry point `RAG.md` dan dokumen `.ai/` tersedia.
- [x] Truth matrix, architecture map, business context, dan current state tersedia.
- [x] Protokol boot, update, decision log, changelog, dan prompt reusable tersedia.
- [x] Referensi path dan pola secret divalidasi.
- [x] Hasil akhir dan cara pakai disampaikan ke owner.

## Backlog Teknis

- [x] Buat entitlement registry tunggal dan enforcement plan pada navigation, route, service, serta database/RPC.
- [x] Tetapkan downgrade read-only untuk data feature berbayar; mutation diblokir oleh RLS/RPC.
- [x] Batasi public enrollment pada sekolah active Pro/Lifetime melalui RPC tervalidasi.
- [x] Tambahkan unit test untuk normalizePlan, matrix feature, downgrade, dan nested route/query matching.
- [x] Terapkan migration entitlement/lifecycle ke Supabase target terkonfirmasi dan jalankan smoke test serta advisors.
- [ ] Triage advisor debt existing: security-definer view/search-path/function grants, multiple permissive policies, dan index `enrollment_requests.processed_by`.
- Normalisasi role ke satu source of truth dan permission matrix yang teruji.
- Sinkronkan TypeScript database types dengan schema live.
- Proteksi spam/duplikasi public enrollment.
- Tambahkan audit log status pendaftaran dan consent privasi.
- Audit dan lengkapi offline behavior.
- Verifikasi auto-transaction pada update SPP paid.
- Tambah test scripts dan coverage untuk alur kritis.

## Roadmap Organic Growth

Goal: membangun akuisisi organik SEO/AEO/GEO yang terukur tanpa ads, dengan klaim faktual dan conversion path menuju demo/pilot.

Detail dan acceptance criteria: `.ai/ORGANIC-GROWTH-ROADMAP.md`.

### Fase 1 — Technical Foundation

- [x] Tambahkan robots, sitemap, `llms.txt`, canonical halaman utama, dan metadata route marketing.
- [ ] Lengkapi/audit metadata defaults global, OG image, creator/publisher, dan canonical seluruh route publik.
- [ ] Terapkan `noindex` pada auth, onboarding, dashboard, dev/admin, dan status akun.
- [x] Pastikan route marketing/content utama crawlable tanpa autentikasi.
- [ ] Audit Core Web Vitals, broken links menyeluruh, redirect, duplicate canonical, dan index policy private routes.

### Fase 2 — Entity dan Trust

- [ ] Buat JSON-LD entity graph Organization, WebSite, SoftwareApplication, dan breadcrumb reusable.
- [ ] Implementasikan halaman tentang, kontak, keamanan data, privasi, dan syarat ketentuan.
- [ ] Tambahkan author/reviewer dan bukti pilot hanya bila identitas, izin, dan datanya nyata.

### Fase 3 — Organic Content Architecture

- [x] Buat marketing layout serta pillar pages fitur/solusi prioritas dengan identitas cream/green yang konsisten.
- [x] Jadikan `/` satu conversion journey terstruktur; supporting routes tetap menjadi pendalaman SEO, bukan landing terpisah.
- [x] Buat knowledge hub `/panduan` dengan template artikel, breadcrumb, related links, dan CTA kontekstual.
- [ ] Lengkapi cluster awal menjadi 5–8 artikel berkualitas dengan author/reviewer nyata.
- [x] Verifikasi production build, route utama, dan crawler endpoints; semua target pemeriksaan merespons HTTP 200.

### Fase 4 — Measurement dan Distribution

- [ ] Verifikasi Google Search Console dan Bing Webmaster Tools, lalu submit sitemap.
- [ ] Pasang analytics ringan dan event CTA/demo/register dengan consent yang sesuai.
- [ ] Review query, impression, CTR, lead, dan conversion secara bulanan.

### Fase 5 — Billing SaaS Terpisah

- [ ] Kunci offer, pricing, lifecycle subscription, refund/cancellation, legal entity, dan provider.
- [ ] Buat bounded context billing yang terpisah dari domain pembayaran SPP.
- [ ] Implementasikan server-side checkout, webhook signed+idempotent, invoice/history, dan activation audit.
- [ ] Tempatkan billing setelah onboarding di area akun; jangan menaruh checkout di landing page.


---

## CHANGELOG.md

# AI Handoff Changelog

Tuliskan entri terbaru di atas. Maksimal ringkas: hasil, file, validasi, blocker, next step.

## 2026-09-22 - Mobile/PWA Bug Fixes (Laporan, Kas, Logout, SPP sync Overview)

- Hasil: 4 bug laporan user PWA diperbaiki; semua perbaikan disamakan basis datanya dengan dashboard Overview.
- Laporan (`src/app/(dashboard)/reports/page.tsx`): kartu stat jadi `grid-cols-1 sm:grid-cols-3` (tidak overflow di layar sempit), tabel Laporan Bulanan & Rekap SPP dibungkus `overflow-x-auto` + `whitespace-nowrap` sehingga angka masuk/keluar tidak lagi terpotong dan bisa scroll horizontal.
- Kas (`src/app/(dashboard)/transactions/page.tsx`, `TransactionTable.tsx`): modal tambah/edit transaksi kini `overflow-y-auto` + `max-w-md my-auto` sehingga tombol Simpan (utamanya Pengeluaran) dapat dijangkau di PWA; kolom Kategori menampilkan nama kategori asli, bukan UUID terpotong.
- Logout (`DashboardShell.tsx`): tombol Keluar (ikon LogOut) ditambahkan di header sticky, tampil pada layar `<lg`, sehingga opsi logout selalu terlihat di PWA tanpa harus scroll.
- SPP sync Overview (`spp.service.ts`, `useSPP.ts`, `spp/page.tsx`, `TunggakanTable.tsx`, `spp.types.ts`): `getSPPSummary` sekarang menghitung outstanding = total siswa aktif − siswa bayar/angsuran bulan ini (identik formula Overview); tab Tunggakan kini berbasis bulan (mengikuti filter halaman, default bulan ini) dan menyertakan siswa aktif tanpa tagihan (`no_bill`) supaya tidak 'hilang'.
- WIP user yang belum di-commit (bulk billing SPP, TunggakanTable, filter klas, migration unique bill, import siswa) dipertahankan dan dibangun di atasnya.
- Validasi: `npm run lint`, `npm run typecheck`, 7/7 `npm run test`, dan `npm run build` (49 halaman) lulus.
- Next: QA visual PWA pada viewport/perangkat nyata; offline-first terbatas masih relevan — createTransaction saat offline menulis ke Dexie dan baru muncul di list setelah sinkron Supabase (belum digabung saat baca).

## 2026-08-03 - Unified Root Landing and Organic Route Validation

- Hasil: `/` dikonsolidasikan menjadi satu conversion journey berbasis panduan CRO Kai—hero spesifik → pain → solusi terhubung → cara mulai → use case → FAQ → final CTA—dengan supporting routes tetap menjadi pendalaman SEO.
- UX: root sekarang memakai shared `MarketingLayout`, header, dan footer cream/green; duplikasi shell dihapus dan checkout/payment tetap tidak muncul pada root.
- File aplikasi: `src/app/landing-page.tsx`, `src/app/page.tsx`; dokumentasi status disinkronkan di `.ai/ORGANIC-GROWTH-ROADMAP.md`, `.ai/TASKS.md`, dan `.ai/CHANGELOG.md`.
- Validasi kode: `npm run typecheck`, `npm run lint`, 7/7 unit tests, dan `npm run build` lulus; 49 halaman statis dihasilkan. Warning Vitest terkait future native config loader tetap non-blocking.
- Validasi runtime: full-page root desktop dan `/fitur`, `/solusi`, `/panduan`, `/pricing` diperiksa pada production server lokal tanpa console error; route utama, satu slug panduan, `robots.txt`, `sitemap.xml`, `llms.txt`, dan `manifest.json` merespons HTTP 200.
- Catatan: browser verifikasi memakai viewport tetap 900×600; struktur responsive/mobile menu ditinjau dari implementasi, tetapi visual perangkat mobile penuh tetap perlu QA pada viewport/perangkat nyata.
- Next: audit index policy private routes dan metadata global, perluas panduan menjadi 5–8 artikel dengan author/reviewer nyata, lalu aktifkan Search Console/Bing dan event conversion.

## 2026-08-03 - Organic Growth and Billing Boundary Roadmap

- Hasil: audit SEO/AEO/GEO dan AI crawler diterjemahkan menjadi roadmap fase technical foundation, entity/trust, content architecture, measurement, dan billing automation.
- Keputusan: organic-first tanpa ads; landing page tetap conversion surface tanpa checkout; billing SaaS dipisahkan dari domain pembayaran SPP.
- File: `.ai/ORGANIC-GROWTH-ROADMAP.md`, `RAG.md`, `.ai/BUSINESS-MARKETING.md`, `.ai/TASKS.md`, `.ai/DECISIONS.md`, `.ai/CHANGELOG.md`.
- Safety: item belum aktif diberi label `PLANNED`; metadata homepage yang sudah ada tidak disalahartikan sebagai organic architecture yang lengkap.
- Validasi: documentation links, status labels, dan Git diff diperiksa; tidak ada kode aplikasi atau migration yang diubah.
- Next: implementasikan Fase 1 technical SEO sebelum memperbanyak halaman/artikel; billing automation tetap fase terakhir setelah offer/onboarding tervalidasi.

## 2026-08-01 - Landing Hero Problem-first

- Hasil: pesan 3 detik pertama dipusatkan pada pendaftaran yang tercecer dan owner yang menunggu rekap kas; administrasi siswa, SPP, kas, laporan, inventaris, dan payroll tetap menjadi fondasi produk.
- Copy safety: memakai “pantau uang masuk-keluar/aktivitas terbaru”, bukan klaim laporan arus kas akuntansi formal; angka mockup tetap berlabel ilustrasi.
- File: `src/app/landing-page.tsx`, `src/app/page.tsx`, `.ai/PRICING-ENTITLEMENT-PIPELINE.md`.
- Operasional plan: flow negosiasi → dropdown Dev Admin → API terverifikasi → update server-only kini terdokumentasi eksplisit untuk agen berikutnya.
- Validasi: `npm run lint`, `npx tsc --noEmit`, dan `npm run build` lulus; hanya warning existing `src/modules/offline/hooks/useOfflineSync.ts:49`.

## 2026-08-01 - Plan Entitlement Enforcement

- Hasil: registry canonical memakai `minimumPlan`; pricing tidak lagi menduplikasi tier detail; route matching mendukung nested path dan query.
- Enforcement: migration `supabase/migrations/20260801001_plan_entitlements.sql` menambah CHECK plan, helper entitlement, RLS read-only saat downgrade, RPC enrollment/import/approve/reject, dan mutation gates payroll/inventory; `20260801002_lock_school_entitlement_lifecycle.sql` mengunci browser insert ke `free/pending` dan melarang browser mengubah plan/status.
- Public enrollment: insert langsung digantikan RPC `submit_enrollment`; hanya sekolah active Pro/Lifetime yang diterima dan status dipaksa `pending`.
- File: `src/shared/entitlements/index.ts`, `src/app/pricing/page.tsx`, `src/modules/enrollment/services/enrollment.service.ts`, `src/app/(dashboard)/reports/page.tsx`, `src/app/api/admin/schools/[schoolId]/route.ts`, dua migration `2026080100*.sql`, dan `tests/unit/entitlements.test.ts`.
- Validasi lokal: `npm run test:entitlements` lulus 3/3, `npx tsc --noEmit` lulus, dan `npm run build` lulus; warning existing `src/modules/offline/hooks/useOfflineSync.ts:49` tetap ada.
- Status remote: kedua migration sudah diterapkan ke project terkonfirmasi `bbymrmysmerazdkubptc`; migration history lokal/remote sinkron. Smoke test read-only membuktikan matrix Free dan RLS anon enrollment; tidak ada row produksi yang dibuat/diubah.
- Advisors: security 43 findings dan performance 154 findings; exception SECURITY DEFINER RPC entitlement dinilai intentional dengan validasi internal. Debt existing dan remediation URL dicatat di `.ai/PRICING-ENTITLEMENT-PIPELINE.md`.

## 2026-08-01 - Pro Positioning and Architecture README

- Hasil: Free difokuskan untuk validasi, Basic untuk operasional rutin, dan Pro untuk pendaftaran online serta dashboard owner realtime/mobile bersama payroll dan inventaris.
- File: `src/app/pricing/page.tsx`, `README.md`, `.ai/PRODUCT-TRUTH.md`, `.ai/DECISIONS.md`, `.ai/TASKS.md`.
- Arsitektur: Supabase Cloud ditetapkan sebagai database utama untuk akses mobile dan realtime; Dexie hanya cache/offline terbatas.
- Safety: pricing diklasifikasikan secara komersial, tetapi tidak diklaim sudah enforced; entitlement end-to-end menjadi next step wajib.
- Recovery: error chunk dev berasal dari konflik writer pada `.next`; proses dev dihentikan dan cache dibangun ulang secara bersih.
- Validasi: `npm run lint` dan `npm run build` lulus; hanya tersisa warning existing `useOfflineSync.ts:49`.

## 2026-08-01 - Dashboard Form Contrast Fix

- Hasil: teks ketikan dan nilai field pada seluruh modul dashboard kembali terbaca; permukaan putih legacy juga mendapat warna teks gelap yang eksplisit.
- File: `src/shared/components/Layout/DashboardShell.tsx`, `src/app/globals.css`.
- Scope: siswa/import, pendaftar, SPP, transaksi, inventaris, payroll, laporan; mencakup input/select/textarea, placeholder, option, date, autofill, focus, dan disabled state.
- Safety: aturan dibatasi oleh `.dashboard-shell`, sehingga landing, auth, onboarding, dan pendaftaran publik tidak berubah.
- Validasi: `npm run build` lulus; warning existing `useOfflineSync.ts:49` tetap non-blocking.

## 2026-08-01 - Auth and Dashboard Redesign

- Hasil: visual aplikasi diselaraskan dengan landing page melalui auth shell bersama, onboarding baru, sidebar/header hijau, dan overview dashboard yang diperbarui.
- File: `src/shared/components/Auth/AuthShell.tsx`, `src/app/login/page.tsx`, `src/app/register/page.tsx`, `src/app/onboarding/page.tsx`, `src/shared/components/Layout/DashboardShell.tsx`, `src/shared/components/Layout/Sidebar.tsx`, `src/app/(dashboard)/overview/page.tsx`.
- Behavior: alur Supabase auth, pembuatan sekolah/profil/kategori, realtime dashboard, dan navigasi tetap dipertahankan.
- Validasi: `npm run build` lulus termasuk lint dan type-check; tersisa warning existing `useOfflineSync.ts:49` tentang dependency hook.
- Next: audit visual browser pada data nyata dan lanjutkan penyelarasan halaman publik pendaftaran/persetujuan bila masuk scope berikutnya.

## 2026-08-01 - Landing Page Redesign

- Hasil: landing page conversion-first selesai; visual baru mobile-first dengan hero, pain points, fitur, cara kerja, FAQ, pilot CTA, dan sticky WhatsApp CTA.
- File: `src/app/landing-page.tsx`, `src/app/page.tsx`; perubahan pengguna di `src/middleware.ts`, `src/shared/components/Layout/Sidebar.tsx`, dan `src/app/pricing/` dipertahankan.
- SEO: metadata halaman, canonical, Open Graph, Twitter card, dan `SoftwareApplication` JSON-LD ditambahkan.
- Safety: tidak memakai testimoni/statistik sosial palsu; angka dashboard diberi label ilustrasi. Harga/offer pilot tidak dipatok di halaman karena masih perlu konfirmasi owner.
- Validasi: `npm run lint` lulus dengan satu warning existing di `src/modules/offline/hooks/useOfflineSync.ts:49`; `npm run build` lulus; halaman `/` merespons HTTP 200.
- Next: owner konfirmasi offer pilot dan nomor WhatsApp sebelum publish; audit visual browser jika diperlukan.

## 2026-08-01 - RAG Validation

- Hasil: validasi path konkret di `RAG.md` dan `.ai/` berhasil; wildcard `.ai/*` dan template `<domain>` memang disengaja.
- Security: pattern scan tidak menemukan credential-like values atau secret nyata.
- Worktree: perubahan pengguna yang sudah ada tetap tidak tersentuh.
- Next: owner dapat memakai `RAG.md` sebagai entry point; task berikutnya adalah landing page conversion-first.

## 2026-08-01 - RAG Foundation

- Hasil: membuat context router dan knowledge base lokal untuk pergantian model AI.
- File: `RAG.md`, seluruh dokumen awal di `.ai/`.
- Fakta penting: role/plan/copy masih konflik; offline parsial; worktree memiliki edit pengguna.
- Safety: tidak mengubah landing page, middleware, sidebar, pricing, migration, atau `.env`.
- Validasi: path dan secret scan masih harus dijalankan setelah file dibuat.
- Next: validasi RAG, lalu lanjut task landing page hanya setelah membaca diff pengguna.


---

## PROMPTS.md

# Prompt Ringkas untuk Model AI

## Boot Standar

```text
Baca RAG.md dulu. Ikuti peta baca hemat token, lalu baca TASKS. Jangan menebak fakta; verifikasi source target, cek git status, jangan timpa edit user, dan update TASKS + CHANGELOG setelah selesai.
```

## Lanjut Task Aktif

```text
Baca RAG.md, .ai/TASKS.md, dan changelog terbaru. Kerjakan hanya task Active/Next yang saya sebut. Jelaskan blocker, jalankan validasi relevan, lalu buat handoff ringkas.
```

## Coding

```text
Baca RAG.md dan .ai/ARCHITECTURE-MAP.md. Cari source terkait sebelum merencanakan. Pertahankan pola page -> hook -> service, audit auth/RLS bila menyentuh data, jangan edit migration lama, dan jangan ubah file di luar scope.
```

## Landing Page/Marketing

```text
Baca RAG.md, .ai/PRODUCT-TRUTH.md, dan .ai/BUSINESS-MARKETING.md. Buat copy conversion-first tanpa klaim DO NOT CLAIM, bukti sosial palsu, atau link mati. Konfirmasi offer/kontak yang belum VERIFIED sebelum publish.
```

## Audit Anti-Halusinasi

```text
Bandingkan klaim yang saya berikan dengan .ai/PRODUCT-TRUTH.md dan source code. Tampilkan temuan berdasarkan severity, sertakan path sumber, tandai VERIFIED/PARTIAL/PLANNED/DO NOT CLAIM, dan jangan memperbaiki sebelum saya minta.
```

## Handoff Sebelum Limit Habis

```text
Context hampir habis. Jangan mulai perubahan baru. Update .ai/TASKS.md dan .ai/CHANGELOG.md dengan hasil, file yang disentuh, validasi, blocker, keputusan, dan next command/step agar model berikutnya bisa lanjut.
```


---

## FOUNDER.md

# Founder - Arblok Digital

> `CONFIDENCE: PARTIAL` — fakta diambil dari JSON-LD resmi https://arblok-digital.vercel.app/ (situs perusahaan). Cerita personal belum ada sumbernya, jangan mengarang.

## Informasi Dasar
- Nama: **Ardi** (nama yang dipakai di situs; kemungkinan besar "Ardi Jobin" dari slug LinkedIn `ardi-jobin-455446380` — sebut lengkap hanya jika user yang konfirmasi)
- Peran: **Founder ARBLOK Digital** (tercantum di JSON-LD situs: `"founder": {"@type":"Person","name":"Ardi"}`)
- Lokasi: Tasikmalaya, Jawa Barat, Indonesia
- Email: ardiblokchine@gmail.com
- WhatsApp / kontak: +6289508053795 (https://wa.me/6289508053795)

## Sosial Media
- LinkedIn: https://www.linkedin.com/in/ardi-jobin-455446380
- Instagram: https://www.instagram.com/arblokd/
- TikTok: https://www.tiktok.com/@ardiblokchine
- Facebook: https://web.facebook.com/profile.php?id=61591871531409

## Konteks Peran
- ARBLOK Digital adalah studio perangkat lunak tempat Ardi menjadi founder.
- Keahlian yang tercantum di situs (knowsAbout): sistem penjualan & persediaan, administrasi sekolah, pelayanan dokumen, alur persetujuan, website & portal informasi, otomatisasi pekerjaan berulang.
- Produk unggulan untuk sekolah: **SekolahRapi** (aplikasi administrasi sekolah dari Arblok Digital).

## Cerita Singkat
> `CONFIDENCE: PARTIAL` — versi ringkas dari deskripsi perusahaan di situs. Belum ada biografi personal publik.

Ardi membangun ARBLOK Digital, studio perangkat lunak di Tasikmalaya, dengan fokus membuat sistem khusus (bukan template) untuk usaha, sekolah, dan instansi — dengan pendekatan: pahami pekerjaan sehari-hari → pilih satu masalah prioritas → uji versi pertama bersama pengguna → jalankan dan dampingi. Salah satu hasilnya adalah SekolahRapi.

## Catatan untuk AI
- Nama lengkap: JANGAN menebak. Pakai "Ardi, founder ARBLOK Digital" saja.
- Cerita personal (perjalanan karier, tahun berdiri detail, prestasi): JANGAN mengarang — kalau ditanya, arahkan ke WhatsApp kontak resmi.
- Kontak selalu arahkan ke WA +6289508053795 atau email resmi.
- Bahasa Indonesia, tone ramah-profesional-praktis.


---

## ARBLOK-DIGITAL.md

# Profil Perusahaan - ARBLOK Digital

> `CONFIDENCE: VERIFIED` — diambil dari JSON-LD + konten https://arblok-digital.vercel.app/

## Identitas
- Nama: **ARBLOK Digital** (alternate: Arblok Digital)
- Deskripsi: studio perangkat lunak dari Tasikmalaya yang membantu usaha, sekolah, dan instansi membuat sistem untuk pencatatan, pelayanan, serta alur persetujuan.
- Alamat: Tasikmalaya, Jawa Barat, Indonesia
- Situs: https://arblok-digital.vercel.app
- Telepon/WA: +6289508053795 · Email: ardiblokchine@gmail.com

## Layanan (Offer Catalog resmi)
1. **Sistem Penjualan dan Persediaan** — mencatat transaksi, perubahan stok, dan ringkasan yang dapat diperiksa.
2. **Sistem Administrasi Sekolah** — pencatatan pembayaran, data siswa, kelas, dan status administrasi (= SekolahRapi).
3. **Sistem Pelayanan dan Persetujuan** — formulir pengajuan, tahap pemeriksaan, dan riwayat keputusan.
4. **Website dan Portal Informasi** — menjelaskan layanan, menerima permintaan, menyediakan informasi.

## FAQ Resmi (dari situs Arblok)
- **Berapa biaya pembuatan website/aplikasi?** — Fleksibel: paket Starter/MVP terjangkau untuk UMKM hingga sistem enterprise. Tidak ada budget terlalu kecil; diskusi via WhatsApp.
- **Apa itu zero-cost hosting?** — Aplikasi terhubung langsung ke database cloud dengan Row Level Security (RLS), tanpa server backend 24/7 → biaya hosting bisa Rp 0 untuk beban kerja UMKM normal.
- **Berapa lama proses pembuatan?** — Landing/company profile 1-3 minggu; sistem khusus (kasir, sekolah, kelurahan) 1-3 bulan. Timeline jelas saat konsultasi.
- **Bisa custom fitur setelah selesai?** — Bisa. Arsitektur Monorepo (NPM Workspaces) bikin modifikasi cepat dan murah.
- **Ada garansi setelah peluncuran?** — Ya, paket maintenance fleksibel + pelatihan tim agar bisa kelola mandiri.
- **Apa itu Arblok Digital?** — Studio perangkat lunak dari Tasikmalaya untuk usaha, sekolah, dan instansi.
- **Masalah seperti apa yang bisa dibahas?** — Pencatatan penjualan/stok terpisah, administrasi sekolah sulit dipantau, pengajuan dokumen lambat, pekerjaan berulang rawan terlewat.
- **Bagaimana memulai?** — Kirim gambaran singkat pekerjaan yang merepotkan via WhatsApp; pembicaraan awal untuk memahami masalah, pengguna, dan prioritas.

## Cara Kerja (4 langkah, dari situs)
1. Pahami pekerjaan sehari-hari.
2. Pilih satu masalah prioritas.
3. Uji versi pertama bersama pengguna.
4. Jalankan dan dampingi.

## Klaim Utama (situs)
- **0%** potongan transaksi (untuk solusi POS/toko sendiri — konteks UMKM, bukan SekolahRapi).
- **100%** hak milik data & pelanggan.
- **24/7** akses realtime dari HP.


---

## MARKETING



### artikel-iklan-sekolahrapi.md

# 📢 ARTIKEL IKLAN — SEKOLAH RAPI

> **Untuk kebutuhan sosial media (WA Blast, Instagram, Facebook), bro bisa copy-paste per bagian.**
> Semua konten udah ready-to-use, tinggal lu tentuin platform dan targetnya.

---

## 🅰️ VERSI PANJANG — POSTINGAN BLOG / FEED IG / LINKEDIN

---

### **Hilangkan Pusing Administrasi Sekolah dengan Satu Dashboard!**

Sebagai pengelola sekolah swasta, pasti lu pernah ngalamin ini:

- 💸 **Ribet ngitung SPP siswa satu per satu** — apalagi yang nunggak setengah semester
- 📋 **Data keuangan sekolah kacau** — pemasukan, pengeluaran, gaji guru campur aduk di buku catatan
- 📝 **Pendaftaran siswa baru masih manual** — ortu datang ke sekolah bawa fotokopian KTP, antre, formulir hilang
- 📦 **Inventaris sekolah gak ke-track** — meja, kursi, laptop hilang entah ke mana
- 👨‍🏫 **Gaji karyawan pusing sendiri** — ngitung kehadiran, potongan, bonus manual

**Masalah klasik yang bikin kepala sekolah & operator stres tiap bulan.**

---

### 🎯 Solusi: **SEKOLAH RAPI**

Satu platform all-in-one yang ngerjain semua administrasi keuangan & operasional sekolah — **dari SPP, kas, inventaris, sampai pendaftaran online** — dalam satu dashboard premium yang rapi, real-time, dan bisa diakses dari HP mana pun.

---

### 🔥 Fitur Unggulan

#### 1️⃣ 📊 Dashboard Real-Time
Semua data penting dalam satu layar: saldo kas, pemasukan/pengeluaran bulan ini, jumlah siswa aktif, collection rate SPP, dan alert tunggakan. **Auto-refresh tanpa perlu refresh halaman.**

#### 2️⃣ 💰 Manajemen SPP Otomatis
Catat pembayaran SPP per siswa per bulan. Langsung tahu siapa aja yang lunas, siapa yang nunggak, dan berapa total yang terkumpul. **Gak perlu ngecek buku tabungan satu-satu.**

#### 3️⃣ 📝 Pendaftaran Online + Approval Flow
Ortu bisa daftarin anaknya langsung dari HP — isi data siswa, upload dokumen. Admin sekolah tinggal **approve/reject dari dashboard**. Siswa langsung terdaftar otomatis setelah disetujui. **Zero kertas, zero antrean.**

#### 4️⃣ 💳 Kas Masuk/Keluar
Catat semua pemasukan (SPP, uang gedung, donasi) dan pengeluaran (beli ATK, bayar listrik, maintenance) dengan kategori yang jelas. **Tahu duit sekolah kemana aja.**

#### 5️⃣ 📦 Inventaris Sekolah
Track semua aset sekolah — dari kursi kelas sampai laptop lab. 8 kategori (Furniture, Elektronik, ATK, Olahraga, Lab, Perpustakaan, dll.) dengan status kondisi barang. **Gak ada lagi barang hilang gak jelas.**

#### 6️⃣ 👨‍🏫 Penggajian Karyawan
Data guru & staff lengkap dengan jabatan dan gaji pokok. Generate slip gaji bulanan otomatis — tinggal tandai yang udah dibayar. **Gak perlu ngitung manual pake Excel.**

#### 7️⃣ 📈 Laporan Keuangan Bulanan
Grafik pemasukan vs pengeluaran per bulan, rekap SPP, collection rate — semua otomatis. **Buat laporan untuk yayasan tinggal screenshot.**

#### 8️⃣ 📱 Offline-Ready (PWA)
Jaringan jelek? Kuota abis? **Tetep bisa akses.** Data disimpan lokal dan otomatis sync saat online kembali. Bisa dipasang di HP kayak aplikasi native.

---

### 💎 Kenapa Pilih Sekolah Rapi?

| Masalah Lama | Setelah Pakai Sekolah Rapi |
|--------------|---------------------------|
| SPP manual, sering salah catat | Auto-track, tahu persis siapa nunggak |
| Pendaftaran tumpukan kertas | Online dari HP ortu, approve 1 klik |
| Laporan keuangan bikin migren | Auto-generated, tinggal screenshot |
| Inventaris hilang gak jelas | Semua aset terdata dengan kondisi |
| Gaji guru pusing itung manual | Generate slip gaji bulanan otomatis |
| Data berceceran di Excel, buku, WA | Semua dalam satu dashboard |

---

### 🏗️ Dibangun dengan Teknologi Modern

- **Next.js 14** — Cepat, SEO-friendly, modern
- **Supabase** — Database real-time, aman dengan Row Level Security
- **Tailwind CSS** — Tampilan premium dark-mode, nyaman di mata
- **PWA (Progressive Web App)** — Bisa diinstall di HP, offline-ready
- **Dexie.js** — Data tetep bisa diakses meskipun offline

---

### 💬 Testimoni (Contoh)

> *"Dulu tiap akhir bulan saya stres ngitung SPP satu-satu. Sekarang tinggal buka dashboard, semuanya keliatan — siapa yang bayar, siapa yang nunggak. Collection rate naik 40% dalam 2 bulan."*
> — **Kepala Sekolah, SMP Swasta di Tasikmalaya**

---

### 🚀 Mulai Gratis Sekarang

**SEKOLAH RAPI** — Administrasi Keuangan & Operasional Sekolah
🌐 *platform #1 buat sekolah swasta Indonesia yang mau beralih ke digital*

**Kunjungi:** [Link Landing Page]
**Daftar Gratis:** [Link Register]

> *"Lebih Rapi, Lebih Cepat, Lebih Hemat Waktu"*

---

## 🅱️ VERSI PENDEK — WA BLAST / STATUS / CAPTION IG

---

### 📌 **Opsi 1: WA Blast Langsung ke Kepala Sekolah/Yayasan (140 karakter)**

> *"Hilangkan pusing administrasi sekolah! 🏫✨ Kelola SPP, pendaftaran online, kas, inventaris, & gaji guru dalam satu dashboard premium. Offline-ready, real-time, dari HP bisa. Daftar gratis ➡️ [link]"*

---

### 📌 **Opsi 2: WA Blast Narasi (300-400 karakter)**

> *"Pusing tiap akhir bulan ngitung SPP siswa satu-satu? 😩*
>
> *Kenalin **SEKOLAH RAPI** — aplikasi administrasi keuangan & operasional sekolah all-in-one.*
>
> ✅ SPP auto-track — tahu siapa nunggak & collection rate real-time
> ✅ Pendaftaran online dari HP ortu — zero kertas
> ✅ Kas, inventaris, penggajian — semua dalam satu dashboard
> ✅ Offline-ready — jaringan jelek tetap jalan
> ✅ Dark mode premium — enak dipandang mata
>
> *Cocok buat SD/SMP/SMA swasta yang mau beralih ke digital.*
>
> *Daftar gratis sekarang 👇*
> *[link landing page]"*

---

### 📌 **Opsi 3: Instagram Reels / Tiktok Caption**

**Headline:** Bosen administrasi sekolah masih manual? 🥱

**Body:**
Sekolah Rapi solusinya — dari SPP, pendaftaran online, sampai laporan keuangan, semua otomatis dalam satu dashboard. Gak perlu Excel, gak perlu buku catatan, gak perlu stres.

Fitur lengkap:
- SPP auto-track & tunggakan
- Pendaftaran online (ortu daftar dari HP)
- Kas masuk/keluar jelas
- Inventaris & penggajian
- Laporan keuangan auto-generated
- Offline-ready (PWA)

Cocok buat sekolah swasta yang pengen naik kelas secara digital. Daftar gratis!

#SekolahRapi #AdministrasiSekolah #DigitalisasiSekolah #SPPOnline #PendaftaranOnline #ManajemenSekolah #EdTechIndonesia #ArblokDigital

---

### 📌 **Opsi 4: Facebook Post Panjang**

**🏫 BUAT KEPALA SEKOLAH & OPERATOR SEKOLAH: Sudah saatnya sekolah lu naik kelas secara digital!**

Kita tahu sendiri — administrasi sekolah swasta itu rumit. SPP, pendaftaran, kas, inventaris, gaji guru... semua harus beres tiap bulan. Tapi realita di lapangan? Masih banyak sekolah yang pake Excel campur buku catatan campur WA. Hasilnya? Data kacau, berantakan, stres sendiri.

**Sekarang ada solusinya: SEKOLAH RAPI**

Satu platform all-in-one yang dirancang khusus buat kebutuhan sekolah swasta Indonesia. Bukan software asing yang susah diadaptasi, bukan template Excel yang harus diotak-atik.

**Apa aja fiturnya?**
1. **Dashboard real-time** — semua data penting dalam satu layar
2. **Manajemen SPP** — catat bayar, auto-track tunggakan, collection rate
3. **Pendaftaran online** — ortu daftar dari HP, admin tinggal approve
4. **Kas & inventaris** — semua pemasukan/pengeluaran terdata rapi, aset sekolah ke-track
5. **Penggajian** — generate slip gaji bulanan otomatis
6. **Laporan keuangan** — auto-generated, tinggal cetak

**Bonus:** Offline-ready! Jaringan jelek di daerah tetep bisa akses. Pasang di HP kayak aplikasi native.

**Yang paling penting: DAFTAR GRATIS!**

Gak perlu bayar di muka. Coba dulu, rasain sendiri bedanya.

👉 [Link Daftar Gratis]

*Sekolah Rapi — by Arblok Digital*
*Lebih Rapi, Lebih Cepat, Lebih Hemat Waktu*

---

## 🅲 VERSI TEASER — BUAT LEAD MAGNET / PRE-SALE

---

### **1️⃣ Teaser: "3 Masalah Administrasi Sekolah yang Bikin Kepala Sekolah Stres"**

1. **SPP Nunggak Gak Ketahuan** — siswa bayar setengah, guru catat di kertas, data hilang. Ujung-ujungnya pemasukan sekolah gak jelas.
2. **Pendaftaran Berantakan** — formulir hilang, data ortu gak lengkap, berkas numpuk di meja.
3. **Laporan Keuangan Manual** — tiap bulan harus ngitung ulang dari nol, sering beda antara catatan bendahara dan yayasan.

**Solusi:** SEKOLAH RAPI — satukan semua administrasi sekolah dalam satu dashboard digital premium. Gak perlu ribet, gak perlu takut data hilang.

**[Daftar Gratis ➡️]**

---

### **2️⃣ Teaser: "Gaji Guru 5 Juta, Tiap Bulan Ngitung Manual?"**

Ironis ya? Guru digaji jutaan, tapi administrasinya masih manual. Sekolah punya puluhan siswa, data SPP masih pake Excel. Kepala sekolah pusing tiap akhir bulan.

Padahal, dengan investasi **Rp0 (GRATIS)** untuk daftar, lu udah bisa nikmatin:
- Tracking SPP real-time
- Pendaftaran online
- Laporan keuangan otomatis
- Inventaris rapi

**Jangan biarin administrasi sekolah jadi beban. Digitalisasi itu murah, yang mahal itu stress.**

👉 [Mulai Gratis]

---

## 📋 STRATEGI PENGIRIMAN

| Platform | Versi | Waktu Terbaik |
|----------|-------|---------------|
| WA Blast Kepala Sekolah | Opsi 1 atau 2 | Senin-Kamis, jam 09:00-11:00 |
| WA Blast Operator/TU | Opsi 2 | Siang jam 12:00-14:00 |
| Instagram Feed | Opsi A (versi pendek) | Sore jam 16:00-18:00 |
| Instagram Story | Opsi 1 (180 karakter) | Malam jam 19:00-21:00 |
| Facebook Group (Sekolah/Operator) | Opsi 4 atau Opsi A | Sore jam 15:00-17:00 |
| LinkedIn | Opsi A (dengan link sekolah) | Siang jam 12:00-13:00 |
| Email marketing | Opsi A + PDF brosur | Pagi jam 08:00-10:00 |

---

> **Catatan:** Ganti `[link]`, `[Link Landing Page]`, `[Link Register]`, dan `[Link Daftar Gratis]` dengan URL yang sesuai ya bro! Juga bisa ditambahin screenshot/foto dashboard SekolahRapi biar makin meyakinkan.


### tiktok-carousel-sekolahrapi.md

# 🎠 TIKTOK CAROUSEL — SEKOLAH RAPI (5 SLIDE READY-TO-POST)

> **Workflow:** Generate background gambar pake Gemini → Overlay teks pake Canva/PPT (5 menit)
> Kenapa? AI image generators jelek nulis teks Indonesia. Mending gambar doang, teks di-layer manual.

---

## 🎨 SLIDE 1 — HOOK: "Pusing Administrasi Sekolah?"

### Background Prompt (for Gemini):
```
A realistic documentary-style photo of a school administration room in an Indonesian junior high school. The room feels chaotic — a wooden desk covered with scattered paper documents, a thick black ledger book, sticky notes on the monitor edge, a pile of student report cards, and a half-empty glass of tea. The wall is the typical Indonesian school green-and-white color. A metal filing cabinet in the corner. Fluorescent ceiling light, midday, slightly dim. No people. The atmosphere says "overwhelming paperwork." Photo-style, realistic, no dramatic filters. Indonesian school setting authentic — think ceramic floor, old wooden desk, dust on the shelf.
```

### Teks Overlay (copy paste di Canva/PPT):
```
⚠️
PUSING ADMINISTRASI SEKOLAH?
SPP, pendaftaran, kas, inventaris, gaji guru...
semua masih manual? 😩
```

**Font suggestion:** Inter Bold / Montserrat Bold — putih dengan shadow

---

## 🎨 SLIDE 2 — MASALAH: "SPP Nunggak Gak Ketahuan"

### Background Prompt (for Gemini):
```
A realistic close-up shot of a school administrator's hands flipping through a thick worn-out ledger book with handwritten columns of student names and payment amounts. The book is open on a wooden desk. A calculator, a red pen, and a cup of cold coffee are beside it. The hands are female, with simple nail polish, wearing a plain white shirt sleeve. Soft fluorescent light from above. The book pages are yellowed and some corners are folded. Indonesian school office setting. Documentary style, candid, no posing. The photo should feel like "this is what every end-of-month looks like" — tired and repetitive.
```

### Teks Overlay:
```
❌ SPP nunggak gak ketahuan
❌ Collection rate tebak-tebakan
❌ Laporan bulanan bikin migren

Masih manual = makin berantakan
```

---

## 🎨 SLIDE 3 — SOLUSI: "SEKOLAH RAPI"

### Background Prompt (for Gemini):
```
A realistic over-the-shoulder shot from behind a person in a batik shirt sitting at a wooden desk in a school office. The person is looking at a laptop screen showing a clean dark-mode dashboard with green and purple accents — financial data and student lists visible. The screen has a subtle glow. The background shows a bookshelf with neatly arranged school binders. Soft natural afternoon light from a window. The desk has a closed ledger book pushed to the side corner — symbolizing the old way is no longer needed. The atmosphere is calm and productive. No dramatic elements, just a real efficient school office moment.
```

### Teks Overlay:
```
✅ SEKOLAH RAPI
Satu dashboard untuk SEMUA

💰 SPP auto-track + tunggakan
📝 Pendaftaran online dari HP
📊 Laporan keuangan otomatis
📱 Offline-ready (PWA)
```

**Bold highlight:** "SEKOLAH RAPI" pake gradient indigo-to-purple

---

## 🎨 SLIDE 4 — TESTIMONI / HASIL

### Background Prompt (for Gemini):
```
A realistic photo of a male school principal in his 50s, wearing a white shirt and a peci (Indonesian Muslim cap), standing in front of a desk with a laptop. He has a calm satisfied expression, arms crossed casually. Behind him is a clean whiteboard with some strategic notes, and a wall with framed certificates and a photo of the school building. The room is orderly — a bookshelf, a small Indonesian flag, a potted plant. Bright natural morning light. The atmosphere says "this school is managed well." Professional but not stiff. Real Indonesian school principal look — not a model. Documentary style portrait. No dramatic shadows or effects.
```

### Teks Overlay:
```
"Dulu tiap akhir bulan stres.
Sekarang tinggal buka dashboard,
semua keliatan."

— Kepala Sekolah, SMP Swasta Tasikmalaya

📈 Collection rate naik drastis
⏱️ Waktu administrasi turun 70%
```

---

## 🎨 SLIDE 5 — CTA: "Daftar Gratis"

### Background Prompt (for Gemini):
```
A realistic wide shot of a clean and organized Indonesian school office. A wooden desk with a laptop showing a dashboard, a monitor on a side table, neatly arranged student binders on a shelf, a small potted snake plant, and a framed school photo on the wall. The room has a whiteboard with the words "visi & misi" visible. Bright morning sunlight streams through a window with green curtains. The overall atmosphere is professional, calm, and modern — the "after" picture of digital transformation. An Indonesian school setting that looks well-managed but still authentic, not like a corporate office. Photo-style, realistic.
```

### Teks Overlay:
```
🎯 SIAP BIKIN SEKOLAH LU LEBIH RAPI?

Daftar GRATIS sekarang 👇
[Link Register]

SEKOLAH RAPI
by Arblok Digital
Lebih Rapi, Lebih Cepat, Lebih Hemat Waktu
```

---

## 📐 UKURAN TIKTOK CAROUSEL

| Setting | Value |
|---------|-------|
| **Aspect ratio** | 9:16 (1080 × 1920 px) |
| **Format** | PNG / JPG |
| **Text area** | Safe zone: 80% tengah (biar gak kegesper tombol TikTok) |
| **Font** | Sans-serif bold (Inter, Montserrat, Poppins) |
| **Text color** | Putih (#FFFFFF) + shadow hitam |
| **Highlight** | Gradien ungu (#7c5cff → #22c98e) buat keyword |

---

## 🛠️ WORKFLOW CEPAT (15 MENIT)

```
Step 1: Generate 5 background images → Gemini (copy prompt dari atas)
Step 2: Buka Canva.com → Pilih "TikTok Post (1080×1920)"
Step 3: Upload 5 gambar → Taruh sebagai background
Step 4: Tambah teks overlay (copy dari atas) → Atur font & ukuran
Step 5: Download per slide → Upload ke TikTok sebagai carousel
```

**Kalo gak punya Canva:** Bisa pake PowerPoint — 
- Slide size: 9:16 
- Insert gambar full screen
- Text box di atasnya
- Export sebagai PNG per slide

---

> **Catatan:** Kalo lu mau gue bantu langsung overlay teks-nya pake HTML/CSS & screenshot, gue bisa bikin file HTML siap render tinggal screenshot. Mau?
