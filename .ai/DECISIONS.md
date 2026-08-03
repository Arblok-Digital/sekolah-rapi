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
