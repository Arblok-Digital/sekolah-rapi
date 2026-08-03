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
