# SekolahRapi Knowledge Pack (auto-generated)

> Kompilasi dokumen .ai/* + panduan + marketing untuk AI assistant chat. Jangan membaca source code mentah kecuali diminta.



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

## 2026-10-04 — Mobile: Chat Gak Nutup Tombol Simpan + Scroll Kartu

- Laporan (Arblok, via HP): floating chat "Tanya Arblok" (`z-[90]`) lebih tinggi dari SEMUA modal (`z-50`) → pill/panel-nya nutupin area bawah modal transaksi, tombol Simpan gak bisa diklik; juga nimpa aksi kartu siswa.
- `TanyaArblok`: konteks **dashboard → `z-[45]`** (di bawah semua modal/drawer `z-50`, ReceiptModal `z-70`, toast `z-100`, bottom-nav `z-50`) — pas modal kebuka, chat ketutup backdrop & gak bisa ngeblokir. Landing/general tetap `z-[90]`.
- FAB mobile = **bubble ikon saja** (teks "Tanya Arblok" `hidden sm:inline`, px-3) — jejak lebih kecil. Landing mobile: FAB diangkat `bottom-[6.5rem] sm:bottom-5` biar gak numpuk sama tombol WA FAB (`z-50`).
- `PaymentForm` modal: outer `fixed inset-0` → `items-start + overflow-y-auto + sm:items-center` + modal `my-auto` (pola modal Kas) — form panjang/keyboard HP bisa di-scroll sampai tombol Simpan; backdrop jadi `fixed` biar tetap nutup waktu scroll.
- `StudentFinanceCard` drawer: `overscroll-contain` di aside (gak chain ke body) + body `pb-[max(1.5rem,env(safe-area-inset-bottom))]` (aman dari home indicator iPhone).
- Validasi: `typecheck`, `lint`, `vitest 7/7`.

## 2026-10-04 — Satu Jalur Pembayaran: Kartu Siswa

- Keputusan owner: pembayaran cukup lewat **kartu keuangan siswa** — hilangkan dua-format (form edit = total vs + Cicilan = tambahan) yang membingungkan admin.
- `PaymentTable`: tombol **Edit dihapus** dari tabel `/spp` — rute edit = klik baris → kartu → pensil. Kuitansi & Hapus tetap. Prop `onEdit` dihapus.
- `PaymentForm` mode edit: label "Dibayar" → **"Total Dibayar (semua cicilan)"** + helper "untuk menerima uang baru pakai + Cicilan di kartu". Mode create tetap "Dibayar (Rp)" (pembayaran pertama — tanpa ambiguitas).
- Tombol "Catat Pembayaran" (baris baru) tetap ada — gak ada ambiguitas total/tambahan di baris baru.
- Validasi: `typecheck`, `lint`, `vitest 7/7`.

## 2026-10-04 — Tombol "+ Cicilan" + Riwayat Cicilan di Kartu Siswa

- Konteks: admin salah paham — ubah "Dibayar" 200rb→500rb (edit total) padahal mau NAMBAH cicilan 500rb (seharusnya total 700rb). Fitur baru menghilangkan kebutuhan hitung manual.
- **"+ Cicilan"** (ikon koin, per baris non-lunas di Kartu Keuangan Siswa): admin isi *nominal diterima* → sistem update `paid_amount += nominal` (auto status partial/lunas, tolak melebihi tagihan, tanggal = hari ini) → sync Kas lewat jalur delta (+selisih, tanpa koreksi).
- **Riwayat cicilan** per baris: tiap event transaksi terkait (`source_type='spp'`, `source_id` baris, pasangan koreksi difilter) tampil "Cicilan: +Rp200rb (4 Okt) · +Rp500rb (4 Okt)". Hook baru `usePaymentInstallments`.
- `syncSPPIncomeToKas`: syarat jalur delta dilonggarkan — deskripsi kategori/periode saja yang harus sama, tanggal bebas (cicilan beda hari wajar); edit tanggal tanpa ubah nominal → tetap rebuild.
- File: `StudentFinanceCard.tsx`, `useSPP.ts`, `spp.service.ts`.
- Validasi: `typecheck`, `lint`, `vitest 7/7`.

## 2026-10-04 — Sync SPP: Naik = Delta, Turun/Ubah = Koreksi

- `syncSPPIncomeToKas` disempurnakan setelah QA data live (cicilan infaq Andi): metadata (deskripsi/tanggal) konsisten & nominal NAIK → tambah **selisih saja** (tanpa koreksi, riwayat bersih); nominal TURUN / jadi belum bayar / kategori-periode-tanggal berubah → **rebuild penuh** (koreksi semua + bikin ulang). Net selalu = `paid_amount`.
- Validasi data live: baris `2e80a604` (infaq 3jt partial 500rb) net Kas 500rb ✓; penurunan seragam 500rb→300rb net 300rb ✓.
- Validasi: `typecheck`, `lint`, `vitest 7/7`.

## 2026-10-04 — Koreksi Masuk Riwayat, Keluar dari Ringkasan

- Keputusan owner: koreksi (reversal) **tetap di riwayat** (jejak audit anti-korupsi) tapi **dikecualikan dari semua angka ringkasan** — pasangan koreksi + transaksi aslinya saling menghapus, keduanya dikeluarkan dari agregat biar Pemasukan/Pengeluaran jujur (sebelumnya Overview/Laporan menggelembung: demo 4jt/3jt vs real 1jt/0).
- Helper baru `src/modules/transactions/utils/reversal.ts`: `collectReversedSourceIds`, `isReversalPairMember`, `excludeReversalPairs`.
- Dikeluarkan dari: kartu Overview (saldo, bulan ini), widget Riwayat Transaksi (Masuk/Keluar + footnote), rekap bulanan + rekap per kategori + total + CSV Laporan, ringkasan Masuk/Keluar Audit. Saldo berjalan Audit tetap semua baris (buku besar utuh).
- Label di riwayat: baris koreksi "Koreksi" (merah), baris asli yang diganti "Diganti" (amber) + redup/coret — tabel Kas, Riwayat Overview, Audit.
- File: `overview/page.tsx`, `reports/page.tsx`, `audit/page.tsx`, `TransactionHistory.tsx`, `TransactionTable.tsx`.
- Validasi: `typecheck`, `lint`, `vitest 7/7`.

## 2026-10-04 — Rebuild Kas saat Edit + Tambah Entri Manual di Kartu Siswa

- **Bug**: edit baris pembayaran (kategori/periode/nominal/tanggal) meninggalkan transaksi Kas basi — delta negatif disupres. Bukti: demo Arblok dibuat "uang pendaftaran Rp3jt lunas" lalu diedit jadi "infaq hasanah Rp1jt partial" tetapi Kas tetap 3jt.
- **Fix** `spp.service.ts` `syncSPPIncomeToKas`: jika baris sudah punya transaksi terkait tapi tidak koheren (selisih/desk/tanggal beda) → **reversal semua** (`Koreksi: …`, `source_type=reversal`) lalu **bikin ulang** sesuai kondisi terkini; edit benign (metode/kwitansi) tetap no-op. Data demo diperbaiki manual → NET Rp1.000.000 = `paid_amount`.
- **UX**: seluruh baris tabel Pembayaran di `/spp` bisa diklik ke Kartu Keuangan Siswa (+hint di header; aksi Kuitansi/Edit/Hapus `stopPropagation`).
- **Fitur**: **Tambah Entri** di dalam kartu — form ringkas: kategori (dropdown global income / `+ kategori baru` inline → `categories` per sekolah), periode opsional (default tanpa), tagihan/dibayar, status lunas/angsuran/belum, tanggal. Pake `createSPPPayment` → sync Kas otomatis. File: `StudentFinanceCard.tsx` (schoolId/userId props), `spp/page.tsx`.
- Validasi: `typecheck`, `lint`, `vitest 7/7`.

## 2026-10-04 — Angsuran Masuk Kas (Delta) + Kartu Keuangan Siswa

- **Bug**: pembayaran `partial`/angsuran tidak pernah membuat transaksi pemasukan (sync hanya jalan saat `paid`) — uang angsuran tak terlihat owner, celah penyimpangan admin. Infaq Rp1jt AD sahara hilang dari Kas.
- **Fix** `src/modules/spp/services/spp.service.ts`: helper `syncSPPIncomeToKas` — delta = total dibayar − yang sudah tercatat (per `source_id`, anti dobel); dipakai create, update, lunasi massal, backfill "Sinkronkan ke Kas" (kini cek `paid` + `partial`). Delete: reversal per baris pemasukan (mendukung multi-cicilan). Delta negatif tidak dibuat — koreksi turun manual via Kas (audit trail).
- **Backfill data**: transaksi income `INFAQ AWAL SANAH` Rp1.000.000 (2026-10-04, source payment `4d21fbd2`) diinsert — pemasukan AD sahara kini utuh.
- **Fitur**: Kartu Keuangan Siswa — klik nama siswa di tabel Pembayaran/Tunggakan → drawer ringkasan kewajiban per kategori (status lunas/angsuran/belum + total kewajiban/dibayar/sisa). File baru `StudentFinanceCard.tsx`, hook `useStudentFinance`, wiring `PaymentTable`/`TunggakanTable`/`/spp`.
- Validasi: `typecheck`, `lint`, `vitest 7/7`.

## 2026-10-04 — Harga Dikunci Owner: Tahun 1 Rp4jt, Perpanjangan Rp1,5jt/th

- Keputusan owner (final): **Tahun Pertama Rp 4.000.000** (setup + input data + pelatihan + support 12 bln; anchor coret Rp 5.500.000), **Perpanjangan Rp 1.500.000/tahun** (server, backup, support, update — harga tetap), **fitur custom mulai Rp 500.000** (di luar paket, disepakati di awal). Klien perdana Selasa tetap Rp 3.000.000 sebagai "harga perdana".
- Skema lama Basic Rp790.000 / Pro Rp1.490.000 dihapus dari halaman publik; tier lisensi internal (`PLAN_DEFINITIONS` free/basic/pro/lifetime) TIDAK berubah — tetap kunci aktivasi di Dev Admin.
- File: `src/shared/entitlements/index.ts` (PRICING_PLANS), `src/app/pricing/page.tsx` (kartu, anchor harga, FAQ), `src/content/panduan.ts`, `.ai/FAQ.md`.
- Validasi: `npm run typecheck`, `npm run lint`; knowledge pack di-rebuild via `node scripts/build-knowledge.mjs`.
- Next: pantau konversi halaman harga; kalau deal Rp3jt bocor ke publik, jaga konsistensi "harga perdana" hanya untuk klien pilot.

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

## FAQ.md

# FAQ Resmi — Halaman /pricing & /panduan

> `CONFIDENCE: VERIFIED` — salinan FAQ dari kode halaman pricing.

## FAQ Pricing (halaman /pricing)
- **Apa bedanya Tahun Pertama dan Perpanjangan?** — Tahun Pertama sudah termasuk pemasangan, impor data awal, dan pelatihan tim — sistem langsung dipakai, bukan cuma diserahkan. Perpanjangan hanya biaya operasional tahun berikutnya (server, backup, support, update) dengan harga tetap Rp 1.500.000 per tahun.
- **Bagaimana cara mulai?** — Daftar gratis untuk mencoba sendiri, atau chat via WA di +6289508053795 untuk paket Tahun Pertama. Setup, input data awal, dan training tim biasanya aktif dalam 1–3 hari kerja.
- **Apakah ada biaya tersembunyi?** — Tidak ada. Harga tahun pertama sudah termasuk setup dan training; tahun berikutnya hanya perpanjangan. Fitur custom di luar paket dihitung terpisah mulai Rp 500.000 dan selalu disepakati harganya sebelum dikerjakan.
- **Kalau fitur yang dibutuhkan belum ada?** — Fitur custom bisa dibangun, mulai Rp 500.000 sesuai lingkup. Kebutuhan dibahas saat konsultasi, harga disepakati di awal — tidak ada biaya mendadak di tengah jalan.
- **Apakah database harus disimpan di komputer sekolah?** — Tidak. Database cloud Supabase membuat dashboard bisa dipantau owner dari HP. Data dipisahkan per sekolah (school_id + Row Level Security); backup lokal berkala opsional.

Catatan: artikel `/panduan/*` juga punya FAQ masing-masing — ada di bagian PANDUAN di knowledge pack ini.


---

## HOWTO-CORE.md

# Panduan Inti (How-To) — dari pembacaan kode

> `CONFIDENCE: VERIFIED` — disusun langsung dari source code aplikasi. Dipakai untuk menjawab pertanyaan langkah-penggunaan di chat dashboard.

## 1. Mencatat Pembayaran SPP (halaman `/spp`)

Langkah:
1. Klik **Catat Pembayaran** (kanan atas; di mobile ada di menu **Aksi Lainnya**) → modal **Tambah Pembayaran Siswa**.
2. Isi form:
   - **Siswa** — pilih dari dropdown (opsi `nama (NIS - kelas)`, hanya siswa aktif).
   - **Kategori** — pilih kategori pemasukan (default "SPP"). Keterangan: pembayaran dengan kategori ini langsung tercatat di Kas sekolah.
   - Checkbox **Tanpa bulan/tahun** — untuk pembayaran sekali jadi (seragam/pendaftaran/jemputan); selain itu **Bulan** & **Tahun** wajib.
   - **Nominal (Rp)** dan **Dibayar (Rp)** — jika Status = Lunas, Dibayar terkunci = Nominal.
   - **Status** — `Lunas` / `Angsuran` / `Belum Bayar`.
   - **Metode** — `Tunai` / `Transfer` / `Qris` / `Lainnya`; **Tanggal Bayar**; **No. Kwitansi** (opsional).
3. Klik **Simpan**. Toast: "Pembayaran siswa dicatat".

Dampak penting:
- Jika **Status = Lunas** (dibayar > 0), sistem **otomatis membuat transaksi pemasukan di Kas** (deskripsi "SPP Bulan 10/2026" — format Bulan/Tahun).
- Menghapus pembayaran lunas membuat **koreksi/reversal otomatis** di Kas.
- Aksi per baris: **Kuitansi** (Unduh PNG / Bagikan WA-Telegram / Cetak), **Edit**, **Hapus**.

Alat lain di halaman ini:
- Tab **Semua Pembayaran / Tunggakan Siswa**; filter kategori/status/kelas/bulan/tahun; pencarian nama/NIS/kelas.
- **Buat Tagihan** (bulk): isi Bulan, Tahun, Nominal SPP (default Rp350.000) → semua siswa jadi status Belum Bayar.
- **Lunasi Semua** (hanya kategori SPP bulan terpilih, ada konfirmasi).
- **Sinkronkan ke Kas** — backfill pembayaran lunas yang belum masuk Kas.
- Kartu ringkasan: Total Siswa Aktif, Terkumpul, Belum Bayar, Collection Rate.

Validasi: "Pilih siswa terlebih dahulu", "Pilih kategori pembayaran terlebih dahulu", "Nominal wajib diisi".
Ekspor CSV: TIDAK ada di /spp — ada di `/reports` dan `/audit`.

## 2. Mencatat Transaksi Kas (halaman `/transactions`)

Langkah:
1. Klik **+ Tambah Transaksi** → modal **Tambah Transaksi Baru**.
2. Isi: **Tipe** (Pemasukan/Pengeluaran) → **Kategori** (opsi mengikuti Tipe) → **Jumlah (Rp)** → **Tanggal** (maksimal hari ini) → **Keterangan** (opsional) → **Bukti Transfer** (opsional, belum berfungsi/coming soon).
3. Klik **Simpan**. Toast: "Transaksi ditambahkan".

Dampak penting:
- Saldo di Overview = total pemasukan − total pengeluaran.
- `/audit` (Riwayat Kas) menampilkan running balance per baris + **Export CSV**.
- Aksi per baris: Kuitansi, Edit, Hapus (dengan konfirmasi).
- Offline: kalau jaringan putus, transaksi diantre di IndexedDB (`sync_queue`) dan disinkronkan otomatis.

Validasi: "Pilih kategori", "Jumlah harus lebih dari 0", "Pilih tanggal". Tanggal masa depan diberi peringatan (tidak muncul di Riwayat Kas/laporan sebelum tanggalnya).

## 3. Approve Pendaftar Online (halaman `/enrollment`)

Alur lengkap:
1. Link pendaftaran publik: `/register-student?school=<schoolId>` (ditampilkan di empty state `/enrollment` dengan tombol **Salin Link**).
2. Form publik diisi orang tua: Nama Siswa*, NIS (opsional), Kelas*, Jenis Kelamin, Tempat/Tanggal Lahir, Alamat, Nama Orang Tua/Wali*, No. WhatsApp*, Email (opsional), Pekerjaan → **Kirim Pendaftaran** → status masuk `pending`.
3. Admin di `/enrollment` melihat kartu Menunggu/Disetujui/Ditolak + filter status; tiap kartu: nama siswa, kelas, orang tua (nama + WA), tanggal.
4. Aksi (hanya untuk status **Menunggu**):
   - **Approve** → siswa otomatis masuk tabel **data siswa** (status `active`); TIDAK membuat akun login.
   - **Tolak** → isi **Catatan penolakan (opsional)** → **Kirim**; status jadi `rejected`.
   - **Hapus** → konfirmasi; menghapus pendaftaran yang sudah disetujui TIDAK menghapus data siswa yang sudah terlanjur dibuat.

Batasan penting:
- Fitur enrollment hanya untuk paket **Pro**. Di paket Free/Basic, halaman/link ditolak: "Pendaftaran online tidak tersedia untuk sekolah ini".
- Hanya bisa memproses yang masih `pending` ("Enrollment sudah diproses" kalau sudah).
- Link tanpa `?school=` → "Link pendaftaran tidak valid."


---

## PANDUAN (13 artikel dari /panduan)

### Cara Membuat Laporan Keuangan Sekolah yang Sederhana

Panduan membuat laporan keuangan sekolah sederhana: cara mencatat pemasukan dan pengeluaran, lalu menyusun rekap bulanan yang mudah dibaca kepala sekolah dan yayasan.

(Kategori: keuangan; baca 7 menit; penulis: Tim SekolahRapi)

#### Kenapa laporan keuangan sekolah perlu dibuat rutin

Laporan keuangan sederhana menjawab satu pertanyaan paling mendasar bagi pengelola sekolah: dari mana uang masuk, ke mana uang keluar, dan berapa sisa kas pada akhir bulan. Tanpa laporan yang rutin, keputusan seperti menambah tenaga pengajar, merenovasi ruang kelas, atau menunda pembelian sarana sering dibuat berdasarkan perkiraan, bukan data.

Laporan juga membantu transparansi antara bendahara, kepala sekolah, dan yayasan. Semua pihak melihat angka yang sama, sehingga tidak ada kesenjangan informasi saat mengevaluasi kinerja keuangan sekolah.

#### Siapkan kategori pemasukan dan pengeluaran

Sebelum mencatat, tentukan kategori tetap agar transaksi masuk ke tempat yang sama setiap kali terjadi. Buat sesederhana mungkin — cukup kategori yang benar-benar dipakai sekolah Anda.

- Pemasukan: pembayaran SPP, uang pendaftaran siswa baru, sumbangan orang tua, dana BOS/bantuan, dan pemasukan lain seperti penjualan buku atau seragam.
- Pengeluaran: gaji guru dan staf, operasional harian (ATK, fotokopi), listrik dan air, transportasi, kegiatan sekolah, perawatan dan sarana, serta pengeluaran lain.

#### Catat setiap transaksi dengan disiplin

Kuncinya adalah mencatat saat transaksi terjadi, bukan menunda sampai akhir minggu. Data yang terlambat masuk mudah lupa jumlah atau tanggalnya.

1. Siapkan satu buku kas atau tabel catatan harian dengan kolom tanggal, keterangan, kategori, pemasukan, pengeluaran, dan saldo.
2. Setiap uang masuk dicatat sebagai pemasukan dengan sumbernya, misalnya SPP an. nama siswa.
3. Setiap uang keluar dicatat sebagai pengeluaran beserta keperluan dan penerimanya.
4. Perbarui saldo setiap kali selesai mencatat, lalu cocokkan dengan uang tunai atau rekening yang tersisa.
5. Simpan bukti transaksi (kwitansi, nota) dan beri nomor urut agar mudah ditelusuri.

#### Susun rekap bulanan

Pada akhir bulan, kumpulkan seluruh catatan harian menjadi rekap bulanan. Rekap ini cukup berisi total pemasukan per kategori, total pengeluaran per kategori, dan saldo akhir.

Jika jumlahnya tidak cocok dengan uang yang tersisa, telusuri kembali transaksi. Menemukan selisih lebih mudah dilakukan per bulan daripada menunggu akhir tahun.

- Saldo awal bulan.
- Total pemasukan per kategori.
- Total pengeluaran per kategori.
- Saldo akhir bulan (saldo awal + pemasukan - pengeluaran).

#### Contoh format rekap sederhana

Format di bawah ini bisa dibuat di buku tulis, spreadsheet, atau aplikasi pencatatan seperti SekolahRapi yang menyediakan import/export Excel untuk data keuangan.

- Saldo awal: Rp 12.000.000
- Pemasukan - SPP: Rp 18.500.000
- Pemasukan - Uang pendaftaran: Rp 2.000.000
- Pemasukan - Bantuan/dana: Rp 3.000.000
- Pengeluaran - Gaji guru: Rp 15.000.000
- Pengeluaran - Listrik dan air: Rp 850.000
- Pengeluaran - Operasional: Rp 1.250.000
- Saldo akhir: Rp 18.400.000

#### Tips agar laporan tetap sederhana dan berguna

- Rutinkan pencatatan: lebih baik 10 menit setiap hari daripada 2 jam di akhir bulan.
- Jangan menambah kategori kecuali benar-benar diperlukan; terlalu banyak kategori justru membuat pencatatan berhenti.
- Rekap yang dibagikan ke kepala sekolah dan yayasan cukup satu halaman.
- Gunakan alat bantu pencatatan (buku, spreadsheet, atau aplikasi seperti SekolahRapi) yang paling realistis dijalankan rutin oleh bendahara.

FAQ artikel ini:
- **Apakah laporan keuangan sekolah harus memakai standar akuntansi tertentu?**
  Untuk sekolah swasta skala kecil dan menengah, laporan sederhana pemasukan-pengeluaran-saldo sudah cukup untuk kebutuhan operasional dan pelaporan internal. Standar akuntansi formal biasanya baru diperlukan saat sekolah memiliki kewajiban pelaporan yang lebih besar — sebaiknya dikonsultasikan dengan pendamping atau akuntan bila kondisinya demikian.
- **Berapa sering laporan sebaiknya dibuat?**
  Catatan harian dilakukan setiap transaksi, dan rekap bulanan ditutup di akhir bulan. Rekap tahunan tinggal menjumlahkan 12 rekap bulanan.
- **Bagaimana cara mengatasi saldo yang tidak cocok?**
  Cek satu per satu: transaksi yang belum dicatat, bukti yang hilang, atau salah jumlah. Cocokkan juga dengan mutasi rekening bank dan sisa uang tunai. Usahakan menemukan selisihnya di bulan yang sama agar mudah dilacak.

### Contoh Format Pembayaran SPP Siswa

Contoh format buku dan rekap pembayaran SPP: kolom-kolom yang umum dipakai (nama siswa, kelas, bulan, nominal, status, tanggal bayar, bukti) plus cara merekapnya.

(Kategori: spp; baca 6 menit; penulis: Tim SekolahRapi)

#### Kenapa format pembayaran SPP perlu baku

Format yang baku membuat pencatatan SPP konsisten dari satu bulan ke bulan berikutnya. Saat bendahara berganti, data tetap bisa dibaca tanpa perlu menerka maksud catatan lama.

Format yang baik juga menjawab tiga pertanyaan yang paling sering diajukan orang tua: sudah bayar bulan apa saja, berapa nominalnya, dan kapan dibayarkan.

#### Kolom-kolom yang umum ada di buku SPP

- No dan tanggal bayar: urutan transaksi sekaligus bukti kapan pembayaran diterima.
- Nama siswa dan kelas: memastikan pembayaran masuk ke siswa yang tepat.
- Bulan yang dibayarkan: misalnya September 2026, karena orang tua kadang membayar beberapa bulan sekaligus.
- Nominal: jumlah yang dibayarkan dan sisa cicilan bila ada.
- Status: Lunas, Sebagian, atau Belum Bayar untuk memudahkan pengecekan.
- Bukti bayar: nomor kwitansi atau arsip transfer.
- Catatan: keterangan tambahan seperti pembayaran yang dititipkan.

#### Cara mengisi dan merekap pembayaran

1. Tetapkan nominal SPP tetap per bulan di awal tahun ajaran dan umumkan ke orang tua.
2. Catat pembayaran segera setelah diterima, lengkap dengan tanggal dan nomor bukti.
3. Tandai status di baris siswa setiap kali ada pembayaran.
4. Di akhir bulan, hitung jumlah siswa yang membayar dan total nominal per kelas maupun per angkatan.
5. Cocokkan total nominal dengan kas masuk SPP pada rekap keuangan bulanan.

#### Contoh format rekap bulanan SPP

Tabel sederhana per bulan cukup memuat nama siswa, kelas, status, tanggal bayar, dan nominal. Contoh:

- Ahmad Fauzi | Kelas 7A | Lunas | 5 Juli 2026 | Rp 150.000
- Bunga Lestari | Kelas 7A | Lunas | 6 Juli 2026 | Rp 150.000
- Citra Ayu | Kelas 7B | Sebagian (Rp 75.000) | 10 Juli 2026 | sisa Rp 75.000
- Total terkumpul bulan Juli: Rp 15.900.000

#### Mengelola bukti bayar

Simpan bukti bayar dengan rapi: kwitansi bernomor berurutan untuk pembayaran tunai, dan screenshot mutasi untuk pembayaran transfer.

Berikan nomor kwitansi yang sama dengan yang tercantum di buku SPP agar mudah dicocokkan jika orang tua bertanya.

#### Tips menjaga buku SPP tetap rapi

- Isi buku SPP setiap hari transaksi terjadi, jangan menunggu akhir bulan.
- Pisahkan kolom bulan yang dibayar dari tanggal bayar — keduanya sering tertukar.
- Rutin salin buku SPP ke rekap digital (spreadsheet atau aplikasi seperti SekolahRapi) sebagai cadangan.
- Evaluasi tunggakan tiap awal bulan dan jadwalkan penagihan.

FAQ artikel ini:
- **Bolehkah orang tua membayar SPP untuk beberapa bulan sekaligus?**
  Boleh, asalkan dicatat per bulan yang dibayarkan agar status tiap bulan tetap jelas. Kolom bulan yang dibayarkan dan kolom status akan menjaganya tetap rapi.
- **Bagaimana mencatat pembayaran sebagian?**
  Catat nominal yang diterima, ubah status menjadi Sebagian, dan tuliskan sisa yang harus dilunasi. Pastikan rekap bulanan menampilkan sisa ini supaya tidak terlupakan.
- **Kalau pembayaran lewat transfer, buktinya bagaimana?**
  Simpan bukti transfer (screenshot atau notifikasi mutasi) dan catat tanggalnya. Beri nomor bukti sendiri sesuai urutan di buku SPP agar konsisten.

### Cara Mengelola Pendaftaran Siswa Baru Secara Online

Alur penerimaan siswa baru secara online: pengumuman, formulir pendaftaran, verifikasi data calon, dan konfirmasi — langkah demi langkah untuk panitia.

(Kategori: pendaftaran; baca 6 menit; penulis: Tim SekolahRapi)

#### Alur penerimaan siswa baru dari awal sampai akhir

Pendaftaran online pada dasarnya memindahkan alur yang biasa dilakukan di meja panitia ke formulir digital. Alur umumnya sama: umumkan, terima pendaftaran, verifikasi, konfirmasi, dan daftar ulang.

1. Terbitkan pengumuman resmi berisi jadwal, syarat, dan tata cara pendaftaran.
2. Buka periode pendaftaran dan kumpulkan data calon siswa melalui formulir.
3. Verifikasi data dan dokumen calon siswa secara manual oleh panitia.
4. Umumkan hasil seleksi (bila ada seleksi) atau konfirmasi diterima.
5. Proses daftar ulang dan pembayaran awal.

#### Siapkan formulir dan syarat pendaftaran

Susun daftar data yang benar-benar dibutuhkan. Semakin sedikit isian wajib, semakin sedikit calon yang berhenti di tengah pengisian.

- Data calon: nama lengkap, tempat tanggal lahir, jenis kelamin, alamat.
- Data orang tua/wali: nama, pekerjaan, nomor HP aktif, alamat.
- Asal sekolah dan riwayat pendidikan untuk jenjang SMP/SMA.
- Syarat dokumen: akta kelahiran, kartu keluarga, foto, dan dokumen lain yang diminta sekolah.
- Informasi pembayaran: uang pendaftaran, SPP, dan biaya lain — sampaikan transparan sejak awal.

#### Publikasikan pengumuman dan jadwal

- Sebarkan pengumuman lewat media resmi sekolah: papan informasi, grup orang tua, dan akun media sosial.
- Cantumkan link formulir, batas waktu pendaftaran, dan nomor kontak panitia yang jelas.
- Jadwalkan sesi tanya jawab atau open house untuk menjawab pertanyaan orang tua.

#### Verifikasi data calon siswa

Setelah pendaftaran ditutup, panitia memeriksa kelengkapan dan kebenaran data satu per satu. Pastikan nomor HP orang tua aktif karena ini jalur komunikasi utama selama proses berlangsung.

Verifikasi dilakukan secara manual oleh panitia: cek dokumen, cocokkan data formulir dengan dokumen yang dikirim, dan hubungi orang tua bila ada yang kurang jelas. Sistem pendaftaran online hanya membantu mengumpulkan data, bukan menggantikan pemeriksaan panitia.

1. Buat daftar pendaftar berdasarkan status kelengkapan dokumen.
2. Hubungi calon yang datanya belum lengkap dengan tenggat waktu perbaikan.
3. Cocokkan data duplikat (misalnya nama yang sama) sebelum menetapkan hasil.

#### Konfirmasi hasil dan daftar ulang

- Umumkan hasil dan kirim pemberitahuan resmi ke nomor HP atau email orang tua.
- Berikan tenggat daftar ulang yang jelas dan informasi pembayaran awal.
- Sisakan slot untuk calon cadangan bila ada pendaftar yang tidak melakukan daftar ulang.
- Catat data siswa tetap (final) setelah daftar ulang selesai.

#### Tips mengelola pendaftaran online yang lancar

- Uji formulir sebelum dibuka: isi sendiri dari ponsel untuk memastikan tampilan dan isian berjalan baik.
- Rutin cek pendaftar masuk setiap hari, jangan menunggu sampai periode hampir berakhir.
- Simpan data pendaftar di satu tempat (spreadsheet atau aplikasi pendaftaran online seperti SekolahRapi) agar tidak tercecer di chat atau kertas.
- Siapkan jawaban standar untuk pertanyaan yang sering diajukan orang tua.

FAQ artikel ini:
- **Apakah data calon siswa langsung divalidasi otomatis oleh sistem?**
  Tidak. Verifikasi tetap dilakukan manual oleh panitia — sistem hanya membantu mengumpulkan dan merapikan data yang masuk. Pemeriksaan dokumen dan konfirmasi ke orang tua tetap menjadi tanggung jawab panitia.
- **Bagaimana jika orang tua mengisi formulir dua kali?**
  Buat aturan sederhana: satu pendaftar satu formulir. Saat menemukan duplikat, konfirmasi ke orang tua dan simpan data yang paling lengkap.
- **Data pendaftar bisa tercecer di berbagai tempat?**
  Bisa, kalau alurnya campur antara chat, kertas, dan file. Kunci rapi adalah satu pintu masuk data: semua pendaftar mengisi lewat satu formulir, lalu direkap di satu tempat.
- **Sampai kapan pendaftaran online dibuka?**
  Sesuai jadwal yang diumumkan. Pastikan batas waktu jelas di pengumuman dan ada toleransi perbaikan data, bukan perpanjangan pendaftaran.

### Administrasi Sekolah Swasta yang Perlu Dirapikan

Checklist administrasi sekolah swasta: data siswa, keuangan, absensi, dan sarana prasarana — apa saja yang perlu dirapikan dan kapan harus diperbarui.

(Kategori: administrasi; baca 7 menit; penulis: Tim SekolahRapi)

#### Apa saja yang termasuk administrasi sekolah

Administrasi sekolah adalah seluruh catatan yang mendukung operasional dan pelaporan sekolah swasta. Kalau diibaratkan rumah, administrasi adalah rak penyimpanan: rapinya menentukan mudah tidaknya menemukan dokumen saat dibutuhkan — misalnya saat orang tua bertanya tentang pembayaran atau saat yayasan meminta rekap.

Secara garis besar ada empat kelompok: data siswa, keuangan, absensi/kehadiran, dan sarana prasarana. Empat kelompok ini saling terhubung — pembayaran SPP merujuk pada data siswa, dan pengadaan sarana memakai kas sekolah.

#### Administrasi data siswa

- Profil siswa: nama, tempat tanggal lahir, alamat, wali, dan dokumen seperti akta dan KK.
- Riwayat pembayaran: SPP, uang pendaftaran, dan pembayaran lain per siswa.
- Mutasi: siswa pindah masuk/keluar beserta tanggal dan keterangan.
- Dokumen arsip: rapor, ijazah, dan surat penting yang ditata per tahun ajaran.

#### Administrasi keuangan

- Catatan kas masuk dan kas keluar harian.
- Rekap bulanan pemasukan per kategori (SPP, pendaftaran, bantuan, lain-lain).
- Rekap pengeluaran per kategori (gaji, operasional, listrik dan air, kegiatan).
- Arsip kwitansi, nota, dan bukti transfer yang bernomor urut.

#### Administrasi absensi dan kehadiran

- Daftar hadir harian siswa per kelas.
- Rekapitulasi kehadiran bulanan (hadir, izin, sakit, tanpa keterangan).
- Absensi guru dan staf sebagai dasar administrasi kepegawaian.
- Surat izin dan surat keterangan sakit sebagai lampiran rekapitulasi.

#### Administrasi sarana dan prasarana

- Inventaris barang: nama barang, jumlah, kondisi, lokasi, dan penanggung jawab.
- Catatan peminjaman dan perbaikan sarana.
- Daftar kebutuhan dan rencana pengadaan.

#### Checklist bulanan administrasi sekolah

- Rekap kehadiran siswa dan staf ditutup di awal bulan berikutnya.
- Buku kas dicocokkan dengan sisa uang tunai dan mutasi rekening.
- Rekap SPP dan tunggakan diperbarui.
- Data siswa baru dan mutasi diperbarui di daftar induk.
- Dokumen penting difotokopi atau discan dan disimpan salinannya.
- Inventaris yang rusak dicatat untuk direncanakan penggantian.

FAQ artikel ini:
- **Apakah administrasi harus semua digital?**
  Tidak harus. Yang penting konsisten dan bisa diakses saat dibutuhkan. Banyak sekolah memulai dari buku dan spreadsheet, lalu pindah ke aplikasi seperti SekolahRapi ketika volume data mulai banyak.
- **Siapa yang sebaiknya mengelola administrasi sekolah?**
  Sesuai kapasitas sekolah: admin/operator memegang data siswa dan SPP, bendahara memegang kas, dan kepala sekolah melakukan review rutin. Berapapun jumlah stafnya, tugas harus jelas siapa yang mengisi dan siapa yang mengecek.
- **Berapa lama dokumen administrasi sebaiknya disimpan?**
  Sebagai aturan praktis, simpan minimal satu tahun ajaran untuk catatan harian dan lebih lama untuk dokumen penting seperti daftar induk dan bukti keuangan. Ikuti ketentuan yang berlaku di lingkungan sekolah Anda bila ada.

### Cara Bendahara Sekolah Mencatat Kas Masuk dan Keluar

Cara bendahara mencatat kas masuk dan keluar secara sederhana: buku kas harian, memisahkan pemasukan dan pengeluaran, sampai rekonsiliasi bulanan.

(Kategori: keuangan; baca 7 menit; penulis: Tim SekolahRapi)

#### Peran bendahara dan buku kas

Bendahara memegang dua tanggung jawab yang saling menguatkan: menjaga uang kas sekolah dan menjaga catatan yang akurat. Uang yang rapi tanpa catatan sama berbahayanya dengan catatan rapi tanpa uang — keduanya harus cocok.

Buku kas sederhana cukup berisi: tanggal, keterangan, pemasukan, pengeluaran, dan saldo. Tidak perlu rumit, yang penting dicatat setiap hari.

#### Siapkan buku kas sederhana

- Satu kolom tanggal untuk setiap transaksi.
- Kolom keterangan: sumber dana atau keperluan, plus nama pihak terkait.
- Kolom pemasukan dan kolom pengeluaran yang terpisah.
- Kolom saldo yang dihitung ulang setiap transaksi.
- Nomor urut transaksi agar mudah ditelusuri.

#### Mencatat pemasukan

1. Catat sumber pemasukan secara spesifik, misalnya SPP an. nama siswa, bukan sekadar tulisan SPP.
2. Tulis nominal sesuai uang yang benar-benar diterima.
3. Beri nomor bukti atau kwitansi yang dikeluarkan.
4. Masukkan jumlah ke kolom pemasukan dan perbarui saldo.

#### Mencatat pengeluaran

1. Tulis keperluan dengan jelas, misalnya beli ATK beserta toko atau penerimanya.
2. Pastikan ada bukti berupa nota atau kwitansi sebelum mencatat.
3. Masukkan jumlah ke kolom pengeluaran dan perbarui saldo.
4. Untuk pengeluaran besar, lampirkan persetujuan kepala sekolah atau yayasan bila ada aturannya.

#### Rekonsiliasi kas bulanan

Rekonsiliasi adalah mencocokkan saldo buku dengan uang yang benar-benar ada. Lakukan rutin di akhir bulan agar selisih kecil segera ketahuan.

1. Jumlahkan seluruh kolom pemasukan dan pengeluaran dalam sebulan.
2. Hitung saldo akhir: saldo awal + total pemasukan - total pengeluaran.
3. Hitung uang fisik: sisa tunai di kas plus saldo rekening sekolah.
4. Bandingkan kedua angka. Bila berbeda, telusuri transaksi satu per satu sampai ketemu penyebabnya.
5. Simpan hasil rekonsiliasi sebagai lampiran rekap bulanan.

#### Tips menjaga kas tetap akurat

- Catat transaksi di hari yang sama, sekecil apapun nominalnya.
- Jangan mencampur uang pribadi dengan uang sekolah.
- Pisahkan transaksi tunai dan transfer agar lebih mudah dicocokkan.
- Minta tanda terima untuk pengeluaran, sekalipun kecil.
- Gunakan alat bantu pencatatan (buku, spreadsheet, atau aplikasi kas seperti SekolahRapi) yang paling praktis dijalankan setiap hari.

FAQ artikel ini:
- **Bagaimana mencatat uang yang diambil untuk dana operasional kecil?**
  Catat sebagai pengeluaran kas operasional saat diambil, lalu minta laporan singkat dan bukti saat sisa dikembalikan. Jangan membiarkan dana operasional berjalan tanpa catatan lebih dari beberapa hari.
- **Kapan saldo buku kas harus diperbarui?**
  Setiap kali ada transaksi. Kalau menumpuk, saldo mudah salah dan selisih sulit ditelusuri.
- **Apa yang dilakukan jika saldo buku tidak cocok dengan uang kas?**
  Jangan menutupnya dengan asumsi. Periksa ulang penjumlahan, cari transaksi yang belum dicatat, cocokkan dengan kwitansi, lalu cek mutasi rekening. Jika selisih tetap ada, laporkan secara transparan ke kepala sekolah.
- **Perlukah laporan disampaikan setiap bulan?**
  Sangat dianjurkan. Rekap satu halaman berisi saldo awal, total pemasukan, total pengeluaran, dan saldo akhir sudah cukup untuk review bulanan.

### Template Rekap Tunggakan SPP

Cara membuat rekap tunggakan SPP per siswa dan per bulan, plus trik memprioritaskan penagihan agar uang sekolah tidak menumpuk.

(Kategori: spp; baca 6 menit; penulis: Tim SekolahRapi)

#### Kenapa rekap tunggakan perlu dibuat

Tunggakan SPP yang tidak direkap sering baru terasa dampaknya di akhir tahun, saat angkanya sudah besar dan sulit dikejar. Rekap tunggakan yang diperbarui rutin membuat sekolah tahu sejak dini siswa mana yang tertinggal pembayaran.

Rekap ini juga menjadi dasar komunikasi yang lebih profesional dengan orang tua: bukan sekadar menagih, tetapi menyampaikan posisi pembayaran secara jelas dan tertulis.

#### Struktur rekap tunggakan

- Nama siswa dan kelas.
- Total tagihan per bulan (nominal SPP).
- Bulan-bulan yang sudah dibayar.
- Bulan-bulan yang belum dibayar (tunggakan).
- Total nominal tunggakan.
- Status penagihan: belum dihubungi, sudah dihubungi, ada janji bayar, atau dalam pembayaran.

#### Cara menghitung tunggakan per siswa

1. Tetapkan daftar bulan berjalan, misalnya Juli sampai Desember 2026.
2. Tandai bulan yang sudah lunas dari buku pembayaran SPP.
3. Hitung bulan yang belum lunas dan kalikan dengan nominal SPP.
4. Tambahkan biaya lain yang belum dibayar bila ada, misalnya pembayaran sebagian yang belum selesai.
5. Cantumkan catatan khusus seperti menunggu konfirmasi orang tua.

#### Memprioritaskan penagihan

Tidak semua tunggakan bisa ditangani sekaligus. Prioritaskan agar energi panitia tepat sasaran.

- Tunggakan 3 bulan atau lebih: hubungi langsung, tawarkan janji temu dengan kepala sekolah bila perlu.
- Tunggakan 1-2 bulan: pengingat rutin via WhatsApp atau surat pemberitahuan.
- Sedang dalam perjanjian pembayaran: pantau komitmen sesuai jadwal.
- Siswa kelas akhir: beri perhatian ekstra karena dokumen penting sering terkait dengan pelunasan.

#### Menindaklanjuti penagihan

- Catat setiap komunikasi: tanggal dihubungi, melalui apa, dan hasilnya.
- Kirim rekap tunggakan dalam bentuk tertulis agar tidak ada miskomunikasi.
- Tetapkan tenggat baru yang realistis dan pantau di rekap.
- Libatkan wali kelas untuk situasi yang membutuhkan pendekatan personal.

#### Tips agar tunggakan tidak menumpuk

- Perbarui rekap tunggakan setiap awal bulan.
- Tagih rutin dengan bahasa yang santun dan menyebut angka secara spesifik.
- Tawarkan opsi pembayaran per bulan atau per termin sesuai kemampuan, selama kebijakan sekolah mengizinkan.
- Gunakan alat bantu pencatatan (buku, spreadsheet, atau aplikasi SPP seperti SekolahRapi) agar status pembayaran selalu terpantau.

FAQ artikel ini:
- **Bagaimana cara menagih yang santun tapi tetap tegas?**
  Kirim rekap tertulis yang spesifik: nama siswa, bulan yang belum dibayar, dan total. Tawarkan solusi seperti jadwal angsuran sambil menegaskan tenggat. Hindari menagih lewat anak di kelas.
- **Apakah tunggakan perlu dilaporkan ke yayasan?**
  Ya, idealnya setiap bulan dalam bentuk rekap ringkas: jumlah siswa yang menunggak, total nominal, dan rencana tindak lanjut.
- **Kalau orang tua mengaku sudah membayar tunai tapi tidak ada catatan?**
  Minta nomor kwitansi atau bukti lain. Ini sebabnya setiap pembayaran tunai harus selalu diberi kwitansi bernomor — dokumen itu melindungi orang tua dan sekolah sekaligus.

### Apa Itu Aplikasi Administrasi Sekolah?

Aplikasi administrasi sekolah adalah perangkat lunak untuk mencatat dan merapikan data operasional sekolah seperti data siswa, pembayaran SPP, kas, absensi, dan inventaris dalam satu tempat.

(Kategori: administrasi; baca 5 menit; penulis: Tim SekolahRapi)

#### Jawaban singkat

Aplikasi administrasi sekolah adalah perangkat lunak (web atau mobile) yang dipakai sekolah untuk mencatat dan mengelola data operasional harian — mulai dari data siswa, pembayaran SPP, kas masuk dan keluar, absensi, sampai inventaris — agar semua informasi tersimpan rapi di satu tempat dan mudah dicari kembali.

#### Masalah yang diselesaikan aplikasi administrasi sekolah

- Data siswa tersebar di buku, spreadsheet, dan chat sehingga sulit dicari.
- Rekap SPP dan tunggakan harus dihitung manual setiap kali ditanya.
- Kas masuk dan keluar tidak tercatat konsisten, saldo sering tidak jelas.
- Laporan untuk kepala sekolah atau yayasan memakan waktu berjam-jam.
- Saat bendahara atau operator berganti, data lama sulit dibaca.

#### Fitur yang umum ada

- Data siswa: profil, kelas, mutasi, dan arsip dokumen.
- Pembayaran SPP: pencatatan per siswa per bulan dan rekap tunggakan.
- Kas: pemasukan, pengeluaran, kategori, dan riwayat saldo.
- Laporan: rekap bulanan keuangan dan SPP yang bisa diekspor.
- Pendaftaran siswa online, inventaris, dan penggajian — tergantung paket yang dipakai.

#### Apakah sekolah kecil perlu aplikasi administrasi?

Sekolah kecil sekalipun terbantu, terutama di sisi keuangan dan SPP. Data yang tercatat rutin di satu tempat lebih mudah dipertanggungjawabkan dibanding tumpukan catatan manual. Mulai dari fitur paling dibutuhkan — misalnya kas dan SPP — lalu kembangkan seiring kebutuhan.

FAQ artikel ini:
- **Apakah aplikasi administrasi sekolah bisa dipakai di HP?**
  Bisa untuk aplikasi berbasis web yang responsif, seperti SekolahRapi yang nyaman dibuka dari ponsel untuk memantau arus kas. Pastikan menanyakan hal ini sebelum memilih aplikasi.
- **Data sekolah aman disimpan di aplikasi?**
  Pada aplikasi yang memakai database cloud dengan pemisahan data per sekolah dan kebijakan akses berlapis (row level security), data sekolah tidak bisa dibaca sekolah lain. Tanyakan bagaimana data Anda dipisahkan dan siapa yang bisa mengaksesnya.

### Aplikasi Keuangan untuk Sekolah Swasta

Cara memilih aplikasi keuangan sekolah swasta: pencatatan kas, rekap bulanan, laporan untuk yayasan, dan fitur yang paling dibutuhkan bendahara.

(Kategori: keuangan; baca 6 menit; penulis: Tim SekolahRapi)

#### Kenapa keuangan sekolah swasta perlu aplikasi khusus

Keuangan sekolah swasta punya karakter yang berbeda dari toko atau kantor biasa: sumber pemasukan utama adalah SPP yang bersifat periodik dan per siswa, sedangkan pengeluaran mencakup gaji, operasional, dan kegiatan. Aplikasi keuangan sekolah membantu mencatat keduanya dengan kategori yang konsisten dan rekap yang bisa dibaca pemangku kepentingan.

#### Fitur yang sebaiknya dicari

- Pencatatan kas masuk dan keluar dengan kategori yang bisa disesuaikan.
- Riwayat transaksi dengan saldo berjalan agar bisa diaudit.
- Rekap bulanan pemasukan, pengeluaran, dan saldo akhir.
- Ekspor data (Excel/CSV) untuk kebutuhan pelaporan.
- Integrasi yang wajar dengan pencatatan SPP agar tidak dicatat dobel.

#### Fitur yang belum tentu dibutuhkan di awal

- Neraca, laba rugi formal, dan laporan standar akuntansi — umumnya baru diperlukan saat sekolah memiliki kewajiban pelaporan lebih besar.
- Integrasi rekening bank otomatis — praktis, tetapi tidak semua sekolah siap prosesnya.
- Payroll dan inventaris — tambahkan setelah kebutuhan kas dan SPP stabil.

#### Cara mengevaluasi aplikasi sebelum memilih

1. Buat daftar kebutuhan nyata: catat 3-5 masalah keuangan yang paling sering terjadi.
2. Coba demo dengan data sekolah Anda sendiri, bukan data contoh.
3. Uji dari HP karena bendahara sering bekerja di luar meja.
4. Tanyakan proses cadangan data dan siapa yang bisa mengakses data.
5. Mulai dari paket paling sederhana, lalu naik saat kebutuhan bertambah.

FAQ artikel ini:
- **Berapa biaya aplikasi keuangan sekolah?**
  Bervariasi. Ada yang gratis dengan fitur dasar, ada yang berlangganan tahunan mulai ratusan ribu rupiah untuk sekolah. Bandingkan fitur yang benar-benar dipakai dengan biayanya.
- **Apakah aplikasi bisa menggantikan bendahara?**
  Tidak. Aplikasi adalah alat bantu pencatatan dan rekap; bendahara tetap yang memasukkan data dan bertanggung jawab atas kebenarannya. Aplikasi membuat pekerjaan bendahara lebih cepat dan rapi.

### Aplikasi Pembayaran SPP Sekolah

Aplikasi pembayaran SPP membantu mencatat pembayaran per siswa per bulan, merekap tunggakan, dan memastikan uang yang masuk tercatat di kas sekolah.

(Kategori: spp; baca 5 menit; penulis: Tim SekolahRapi)

#### Apa itu aplikasi pembayaran SPP

Aplikasi pembayaran SPP adalah alat untuk mencatat pembayaran SPP siswa secara digital — siapa yang sudah bayar, bulan apa saja, berapa nominalnya, dan siapa yang masih menunggak — sehingga tidak perlu menghitung manual di buku atau spreadsheet.

#### Masalah umum pencatatan SPP manual

- Status pembayaran tersebar di buku, chat, dan catatan kecil.
- Rekap tunggakan baru dibuat saat diminta, bukan rutin.
- Nominal yang dibayar sebagian sulit dilacak sisanya.
- Pembayaran yang masuk tidak otomatis tercatat di kas sekolah.

#### Fitur yang membantu bendahara SPP

- Catat pembayaran per siswa per bulan dengan status lunas, sebagian, atau belum.
- Rekap tunggakan otomatis per siswa dan per bulan.
- Pembayaran SPP yang lunas otomatis tercatat sebagai pemasukan kas.
- Riwayat pembayaran yang bisa ditunjukkan ke orang tua.

#### Tips memilih aplikasi SPP

- Pastikan pembayaran SPP terhubung dengan pencatatan kas, agar tidak dicatat dua kali.
- Cek bisa tidaknya mencatat pembayaran sebagian (angsuran).
- Uji proses dari HP, karena sering dipakai saat menerima pembayaran.
- Tanyakan format ekspor untuk kebutuhan pelaporan.

FAQ artikel ini:
- **Apakah aplikasi bisa menerima pembayaran online dari orang tua?**
  Ada aplikasi yang menyediakan channel pembayaran, tetapi itu fitur yang berbeda dari sekadar pencatatan. Untuk memulai, pencatatan digital sudah jauh lebih rapi daripada buku manual. Tanyakan ke penyedia apakah channel pembayaran tersedia dan berapa biayanya.
- **Bagaimana jika orang tua membayar tunai?**
  Tetap dicatat manual di aplikasi: pilih siswa, bulan, dan nominal, lalu status berubah lunas. Aplikasi tidak mengharuskan semua pembayaran lewat transfer.

### Format Administrasi Sekolah yang Umum Dipakai

Daftar format administrasi sekolah yang umum dipakai: buku induk siswa, buku kas, rekap SPP, absensi, dan inventaris — beserta kolom-kolom dasarnya.

(Kategori: administrasi; baca 6 menit; penulis: Tim SekolahRapi)

#### Format buku induk siswa

Buku induk adalah dokumen inti data siswa. Formatnya mencatat identitas dan riwayat siswa sejak masuk sampai keluar.

- Nomor induk, nama lengkap, tempat tanggal lahir, jenis kelamin.
- Alamat, nama orang tua/wali, pekerjaan, dan nomor HP.
- Tahun masuk, asal sekolah, dan riwayat mutasi.

#### Format buku kas sekolah

Buku kas mencatat seluruh uang masuk dan keluar secara kronologis.

- Tanggal, nomor urut, keterangan, pemasukan, pengeluaran, dan saldo.
- Sumber pemasukan (misal SPP an. nama siswa) dan keperluan pengeluaran.
- Referensi bukti: nomor kwitansi atau nota.

#### Format rekap SPP dan tunggakan

Rekap SPP biasanya disusun per bulan dengan satu baris per siswa.

- Nama siswa, kelas, bulan yang dibayar, nominal, dan status.
- Total terkumpul per bulan dan daftar tunggakan per siswa.

#### Format absensi dan inventaris

- Absensi: daftar hadir harian per kelas dengan keterangan hadir/izin/sakit/tanpa keterangan.
- Inventaris: nama barang, jumlah, kondisi, lokasi, penanggung jawab, dan tahun pengadaan.

#### Format bisa disederhanakan

Format tidak harus sempurna — yang penting konsisten dan selalu diperbarui. Banyak sekolah memakai spreadsheet atau aplikasi administrasi seperti SekolahRapi untuk menegakkan format yang sama tanpa harus menggambar tabel manual.

FAQ artikel ini:
- **Apakah ada format baku dari pemerintah untuk administrasi sekolah?**
  Ada pedoman tertentu yang berlaku di lingkungan sekolah sesuai jenjangnya. Untuk kebutuhan operasional harian, format sederhana di atas sudah memadai; ketentuan resmi bisa disesuaikan kemudian.
- **Bolehkah mengganti format lama dengan yang baru?**
  Boleh, selama data lama tetap tersimpan dan format baru lebih mudah dipakai. Konsistensi ke depan lebih penting daripada mempertahankan format yang tidak praktis.

### Cara Merapikan Data Administrasi Sekolah

Langkah merapikan data administrasi sekolah: inventarisasi dokumen, satu pintu data, standarisasi format, dan jadwal pemeliharaan rutin.

(Kategori: administrasi; baca 6 menit; penulis: Tim SekolahRapi)

#### Mulai dari inventarisasi dokumen

Sebelum merapikan, ketahui dulu apa saja yang ada: buku induk, arsip kwitansi, rekap SPP, absensi, dan file digital yang tersebar. Buat daftar dan tandai mana yang masih dipakai aktif, mana yang arsip, dan mana yang sudah tidak perlu.

#### Terapkan satu pintu data

Masalah terbesar administrasi bukan pada format, melainkan data yang masuk lewat banyak pintu: chat, kertas, spreadsheet pribadi, dan ingatan. Tetapkan satu tempat sebagai sumber utama setiap jenis data.

- Data siswa: satu daftar induk yang diperbarui terpusat.
- Pembayaran SPP: satu tempat pencatatan per transaksi.
- Kas: satu buku kas yang menampung semua transaksi.
- Dokumen: satu folder/laci untuk arsip penting.

#### Standarisasi format dan penamaan

1. Tetapkan format kolom yang sama untuk setiap jenis data.
2. Atur penamaan file digital: [tahun]-[jenis]-[nama], misalnya 2026-SPP-Desember.xlsx.
3. Beri nomor urut pada kwitansi dan arsip fisik.
4. Tentukan siapa yang boleh mengubah data dan siapa yang mengecek.

#### Jadwalkan pemeliharaan rutin

- Harian: catat transaksi kas dan pembayaran SPP.
- Bulanan: tutup rekap, cocokkan saldo, perbarui tunggakan.
- Tahunan: rapiakan arsip tahun ajaran lama dan perbarui daftar induk.

#### Kapan beralih ke aplikasi

Ketika spreadsheet mulai penuh dan rekap memakan waktu berjam-jam, aplikasi administrasi seperti SekolahRapi membantu menegakkan satu pintu data dan format yang konsisten secara otomatis.

FAQ artikel ini:
- **Berapa lama waktu yang dibutuhkan untuk merapikan data?**
  Tergantung kondisi awal. Mulai dari data keuangan dan SPP (paling sering ditanya), biasanya beberapa hari sampai beberapa minggu sambil tetap menjalankan operasional harian.
- **Haruskah semua dokumen didigitalkan?**
  Tidak harus semuanya sekaligus. Prioritaskan dokumen yang sering diakses (data siswa, rekap keuangan), lalu lanjutkan ke arsip lain bertahap.

### Software Manajemen Madrasah: Pilih yang Sesuai Kebutuhan

Panduan memilih software manajemen madrasah: data santri/siswa, iuran dan SPP, kas, sampai laporan — dengan catatan penting soal integrasi khusus.

(Kategori: administrasi; baca 6 menit; penulis: Tim SekolahRapi)

#### Kebutuhan administrasi madrasah

Madrasah menghadapi kebutuhan administrasi yang mirip sekolah umum: mencatat data santri/siswa, iuran dan SPP, kas, serta laporan rutin. Perbedaannya ada pada istilah dan kebiasaan operasional, misalnya penggunaan istilah santri dan jadwal kegiatan keagamaan — pastikan aplikasi yang dipilih tetap bisa menyesuaikan.

#### Fitur dasar yang dibutuhkan madrasah

- Data santri/siswa: profil, kelas/rombel, dan mutasi.
- Pencatatan SPP/iuran per siswa per bulan dengan rekap tunggakan.
- Kas masuk dan keluar dengan riwayat yang bisa ditelusuri.
- Laporan bulanan untuk pengurus yayasan atau pembina.

#### Catatan penting soal integrasi khusus

Beberapa madrasah membutuhkan pelaporan ke lembaga terkait. Saat ini banyak aplikasi administrasi umum (termasuk SekolahRapi) belum menyediakan integrasi khusus ke sistem lembaga. Tanyakan hal ini secara eksplisit sebelum memilih, dan jangan berasumsi semua aplikasi "untuk madrasah" sudah tersambung otomatis.

#### Langkah memilih software madrasah

1. Tulis kebutuhan nyata: data apa yang paling sering dicari dan dilaporkan.
2. Tanyakan dukungan integrasi ke lembaga bila itu kewajiban operasional Anda.
3. Uji demo dengan data madrasah Anda sendiri.
4. Pastikan bisa diakses dari HP oleh bendahara.
5. Hitung biaya tahunan dan bandingkan dengan manfaatnya.

FAQ artikel ini:
- **Apakah software madrasah harus punya fitur khusus keagamaan?**
  Tergantung kebutuhan. Sebagian madrasah cukup dengan pencatatan administrasi umum, sebagian lagi menginginkan kolom khusus seperti status hafalan atau kegiatan. Pastikan aplikasi mengizinkan penyesuaian sederhana.
- **Bagaimana dengan pelaporan ke lembaga?**
  Konfirmasi langsung ke penyedia apakah ada integrasi khusus. Jika tidak ada, Anda tetap bisa menyusun laporan dari data yang diekspor dari aplikasi.

### Berapa Biaya Aplikasi Administrasi Sekolah?

Kisaran biaya aplikasi administrasi sekolah: gratis, langganan tahunan, hingga paket lengkap — plus cara menghitung nilai yang sepadan untuk sekolah.

(Kategori: administrasi; baca 5 menit; penulis: Tim SekolahRapi)

#### Jawaban singkat

Biaya aplikasi administrasi sekolah di Indonesia bervariasi dari Rp 0 (gratis dengan fitur dasar) sampai jutaan rupiah per tahun untuk paket lengkap. Sebagai gambaran, SekolahRapi menawarkan paket Gratis, Tahun Pertama Rp 4.000.000 (termasuk setup, input data, dan pelatihan), dan perpanjangan Rp 1.500.000 per tahun. Yang menentukan nilai bukan harga, tetapi fitur yang benar-benar dipakai sekolah.

#### Pola harga yang umum

- Gratis: fitur dasar seperti data siswa dan pencatatan kas sederhana, sering dengan batasan kategori atau jumlah data.
- Langganan tahunan: ratusan ribu rupiah, mencakup laporan, ekspor/import Excel, dan kategori tanpa batas.
- Paket lengkap: mendekati satu juta rupiah per tahun, menambahkan fitur seperti pendaftaran online, payroll, dan inventaris.
- Biaya tambahan: setup, pelatihan, atau channel pembayaran online bila tersedia.

#### Cara menghitung nilai sepadan

Bandingkan biaya dengan waktu yang dihemat. Jika rekap SPP dan laporan bulanan memakan 5-10 jam kerja staf, aplikasi yang menghemat waktu itu bisa bernilai jauh di atas biaya langganannya.

1. Hitung jam kerja bulanan untuk rekap manual.
2. Bandingkan dengan biaya aplikasi per bulan (bagi harga tahunan dengan 12).
3. Tambahkan nilai akurasi: data yang tidak salah hitung.
4. Cek biaya tersembunyi: pelatihan, penyimpanan tambahan, atau batas jumlah siswa.

#### Mulai dari yang paling sederhana

Banyak sekolah memulai dari paket gratis untuk menguji alur, lalu naik ke paket berbayar saat data dan kebutuhan bertambah. Pastikan data Anda bisa dibawa naik tanpa perlu input ulang.

FAQ artikel ini:
- **Apakah aplikasi gratis bisa diandalkan?**
  Bisa untuk mencoba dan untuk sekolah dengan kebutuhan dasar. Perhatikan batasan kategori, jumlah data, dan apakah data Anda dipisahkan dengan aman dari sekolah lain.
- **Harga murah berarti fitur kurang?**
  Tidak selalu. Bandingkan daftar fitur dan batasannya. Yang penting bukan harganya, melainkan apakah aplikasi menyelesaikan masalah nyata sekolah Anda.



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
