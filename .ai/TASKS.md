# Task Tracker

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

- [ ] Tambahkan robots, sitemap, `llms.txt`, canonical/metadata defaults, dan OG image.
- [ ] Terapkan `noindex` pada auth, onboarding, dashboard, dev/admin, dan status akun.
- [ ] Rapikan middleware agar route marketing/content baru crawlable tanpa allowlist manual per artikel.
- [ ] Perbaiki viewport accessibility dan audit Core Web Vitals/broken links/status code.

### Fase 2 — Entity dan Trust

- [ ] Buat JSON-LD entity graph Organization, WebSite, SoftwareApplication, dan breadcrumb reusable.
- [ ] Implementasikan halaman tentang, kontak, keamanan data, privasi, dan syarat ketentuan.
- [ ] Tambahkan author/reviewer dan bukti pilot hanya bila identitas, izin, dan datanya nyata.

### Fase 3 — Organic Content Architecture

- [ ] Buat marketing layout serta pillar pages fitur/solusi prioritas.
- [ ] Buat knowledge hub `/panduan` atau `/blog` dengan template artikel yang lengkap.
- [ ] Terbitkan cluster awal 5–8 artikel berkualitas dengan internal links dan CTA kontekstual.

### Fase 4 — Measurement dan Distribution

- [ ] Verifikasi Google Search Console dan Bing Webmaster Tools, lalu submit sitemap.
- [ ] Pasang analytics ringan dan event CTA/demo/register dengan consent yang sesuai.
- [ ] Review query, impression, CTR, lead, dan conversion secara bulanan.

### Fase 5 — Billing SaaS Terpisah

- [ ] Kunci offer, pricing, lifecycle subscription, refund/cancellation, legal entity, dan provider.
- [ ] Buat bounded context billing yang terpisah dari domain pembayaran SPP.
- [ ] Implementasikan server-side checkout, webhook signed+idempotent, invoice/history, dan activation audit.
- [ ] Tempatkan billing setelah onboarding di area akun; jangan menaruh checkout di landing page.
