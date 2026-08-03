# SekolahRapi AI Context Router

> Entry point wajib untuk setiap AI/model baru. Baca file ini sebelum menjawab atau mengubah kode.

## Tujuan

RAG lokal ini menjaga model tetap memahami produk walau sesi dan model AI berganti. Dokumen ini adalah router ringkas, bukan pengganti verifikasi source code.

## Aturan Utama

1. Jangan menebak. Bedakan fakta `VERIFIED`, `PARTIAL`, `PLANNED`, dan `DO NOT CLAIM`.
2. Untuk fakta teknis, urutan sumber kebenaran adalah: database live > migration terbaru > source code > `.ai/*` > dokumentasi lama > materi marketing.
3. Baca hanya file konteks yang relevan agar hemat token.
4. Sebelum edit, cek `git status --short`. Jangan menimpa perubahan pengguna.
5. Jangan membaca atau menyalin nilai `.env`; gunakan `.env.example` hanya untuk nama variabel.
6. Perubahan auth, RLS, migration, pricing, dan klaim publik wajib diverifikasi lebih dulu.
7. Setelah pekerjaan substansial, perbarui `.ai/TASKS.md` dan `.ai/CHANGELOG.md`.

## Status Confidence

| Label | Arti | Boleh dipakai sebagai klaim publik? |
|---|---|---|
| `VERIFIED` | Terlihat di source/migration dan alurnya jelas | Ya, dengan bahasa proporsional |
| `PARTIAL` | Ada implementasi, tetapi cakupan/batasannya nyata | Hanya jika batasan disebut |
| `PLANNED` | Keputusan/rencana, belum menjadi fitur aktif | Tidak |
| `DO NOT CLAIM` | Salah, konflik, belum terbukti, atau berisiko | Tidak |

## Peta Baca Hemat Token

| Jika tugasnya... | Baca... |
|---|---|
| Memahami produk/fakta fitur | `.ai/PRODUCT-TRUTH.md` |
| Mengubah kode/arsitektur/database | `.ai/ARCHITECTURE-MAP.md`, lalu source terkait |
| Landing page, copy, SEO, penawaran | `.ai/BUSINESS-MARKETING.md`, `.ai/PRODUCT-TRUTH.md` |
| Roadmap organic, SEO/AEO/GEO, AI crawler, content, billing placement | `.ai/ORGANIC-GROWTH-ROADMAP.md`, lalu `.ai/BUSINESS-MARKETING.md` |
| Melanjutkan pekerjaan model sebelumnya | `.ai/TASKS.md`, `.ai/CHANGELOG.md`, `.ai/DECISIONS.md` |
| Memahami alasan keputusan | `.ai/DECISIONS.md` |
| Memulai model/sesi baru | `.ai/README.md`, `.ai/PROMPTS.md` |

## Ringkasan Produk

- `VERIFIED`: SekolahRapi adalah aplikasi web administrasi sekolah berbasis Next.js 14 dan Supabase.
- `VERIFIED`: Modul aktif mencakup siswa, SPP, transaksi/kas, pendaftaran siswa, inventaris, payroll, laporan, auth, dan panel dev lokal.
- `VERIFIED`: Data utama dipisahkan dengan `school_id` dan dilindungi RLS berdasarkan migration yang tersedia.
- `VERIFIED`: Kolom `profiles.role` dan `profiles.school_id` di-lock trigger (hanya service_role/postgres bisa ubah); dev functions memakai `search_path=''`; view keuangan pakai `security_invoker`.
- `PARTIAL`: Offline support ada untuk siswa & transaksi (fallback hanya saat error jaringan, payload membawa `id` lokal, sync engine aktif via `SyncStatus` di dashboard), tetapi modul lain dan offline reads belum terpasang.
- `PARTIAL`: Enforce plan/entitlement end-to-end (registry → UI → service → RLS/RPC) sudah ada.
- `VERIFIED`: Model role sengaja tunggal — 1 client = 1 sekolah = 1 akun pemilik (`owner`). `staff`/`owner` hanya label; otorisasi app cuma dev vs non-dev. Multi-role per sekolah TIDAK direncanakan (bukan ekosistem sekolah) — siapa yang login (bendahara/kepsek) adalah urusan internal sekolah.
- `VERIFIED`: Owner wajib bisa login dari HP dan memantau arus kas real-time (fitur realtime_dashboard di dashboard/overview).
- `VERIFIED`: 1 akun boleh login bersamaan di banyak device (laptop browser + HP PWA). Session per-device (localStorage + cookie via `@supabase/ssr`), signOut cuma per-device, dan Supabase Auth defaultnya multi-session. Realtime publication `supabase_realtime` (students, spp_payments, transactions, enrollment_requests) sudah aktif di DB live.
- `PARTIAL`: Homepage memiliki metadata, canonical, Open Graph, Twitter card, schema `SoftwareApplication`, struktur heading, FAQ, dan CTA; organic acquisition architecture masih terbatas pada homepage/pricing.
- `PLANNED`: robots, sitemap, `llms.txt`, noindex private routes, entity graph, trust pages, feature/solution pages, knowledge hub, dan measurement organik. Detail ada di `.ai/ORGANIC-GROWTH-ROADMAP.md`.
- `VERIFIED`: Landing page tidak memuat checkout. Keputusan arsitektur: billing langganan SekolahRapi tetap terpisah dari pembayaran SPP dan ditempatkan setelah pricing/demo/onboarding, bukan di landing page.
- `DO NOT CLAIM`: 100% offline, 5 role aktif, multi-cabang, compliance formal, testimonial/rating, atau fitur yang hanya muncul di copy.

## Stack Singkat

- Next.js 14 App Router, React 18, TypeScript, Tailwind CSS.
- Supabase Auth/PostgreSQL/RLS/Realtime melalui `@supabase/ssr` dan `@supabase/supabase-js`.
- TanStack Query, Dexie (offline), next-pwa. Catatan audit: `zustand`, `recharts`, `react-pdf`, `framer-motion`, `cva` terpasang tapi belum dipakai — jangan claim chart/animasi dari library itu.
- Scripts: `npm run dev`, `npm run build`, `npm run start`, `npm run lint`, `npm run test:entitlements`.

## Kondisi Penting Saat RAG Diperbarui (2026-08-03)

- Audit fullstack (2026-08-01/02) sudah dibereskan: privilege escalation `profiles.role/school_id` di-lock, `SECURITY DEFINER` di-harden (`search_path=''` + REVOKE PUBLIC), view keuangan `security_invoker`, offline sync di-mount, auto-transaction SPP/payroll/inventory diperbaiki, endpoint debug `test-auth` dihapus.
- Migration yang WAJIB dianggap sudah applied di semua env: `20260802001` (lock profiles), `20260802002` (harden functions+views), `20260802003` (dedupe kategori + UNIQUE). Jangan mengedit ulang isi migration 005/006 — kontennya sudah ditukar agar fresh deploy lolos (005 = categories, 006 = transactions).
- Dokumentasi di `.ai/*` berguna tapi sebagian bisa stale; verifikasi ke source/migration dulu. `DOCUMENTATION.md` dan `CURRENT-STATE.md` sudah dihapus (superseded oleh RAG.md + `.ai/*`).
- Klaim landing/pricing harus disesuaikan dengan enforce plan yang ada (mis. "kas 2 kategori", "1 pengguna", "export Excel") — beberapa belum benar-benar di-enforce di DB.
- Prioritas produk: owner mobile-first (login HP) + pemantauan arus kas real-time. Jangan tambah kompleksitas multi-role/ekosistem sekolah kecuali diminta.

## Infra & Biaya (2026-08-03)

- `VERIFIED`: Target 1-10 sekolah cukup pakai **Supabase free tier** (DB 500MB, bandwidth 5GB/bln, storage 1GB, MAU 50rb). Estimasi pemakaian 10 sekolah: < 100MB DB, < 1GB bandwidth. Tidak ada biaya untuk pilot.
- `VERIFIED`: **Supabase free tier PAUSE project otomatis setelah 7 hari tanpa aktivitas API.** Solusi aktif: keepalive cron **setiap 5 hari** (jeda aman di bawah 7 hari) via `src/app/api/cron/keepalive` + `vercel.json` (schedule `0 8 */5 * *` = 08:00 UTC). Alternatif tanpa deploy: UptimeRobot free (ping URL), atau GitHub Actions scheduled workflow. Jangan lupa buka app minimal seminggu sekali kalau cron mati.
- `VERIFIED`: `vercel.json` berisi cron keepalive — jangan dihapus tanpa pengganti, karena DB bisa ke-pause saat fokus marketing.
- `VERIFIED`: **Sentry punya free tier** (Developer plan, 50rb error/bulan) — cukup untuk 1-10 sekolah. Belum terpasang; butuh DSN dari akun sentry.io. Naik ke paid (~$26/bln) hanya kalau butuh fitur tim.
- Supabase paid (Pro ~$25/bln) hanya layak dipertimbangkan saat butuh: anti-pause otomatis, Point-in-Time Recovery (backup granular), dan alokasi lebih besar.
- Upgrade Next.js 14→16 & next-pwa 2 masih pending (breaking change; vuln sisa di dev tooling saja, bukan data/security boundary).

## Definition of Done untuk AI

- Scope permintaan terpenuhi tanpa mengubah file di luar kebutuhan.
- Fakta dan copy sesuai truth matrix.
- Build/lint/test relevan dijalankan atau kegagalan dilaporkan jelas.
- Tidak ada secret, data pribadi, atau credential masuk commit/dokumentasi.
- `TASKS.md` dan `CHANGELOG.md` mencatat hasil serta langkah berikutnya.
