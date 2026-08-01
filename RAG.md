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
| Melanjutkan pekerjaan model sebelumnya | `.ai/CURRENT-STATE.md`, `.ai/TASKS.md`, `.ai/CHANGELOG.md` |
| Memahami alasan keputusan | `.ai/DECISIONS.md` |
| Memulai model/sesi baru | `.ai/README.md`, `.ai/PROMPTS.md` |

## Ringkasan Produk

- `VERIFIED`: SekolahRapi adalah aplikasi web administrasi sekolah berbasis Next.js 14 dan Supabase.
- `VERIFIED`: Modul aktif mencakup siswa, SPP, transaksi/kas, pendaftaran siswa, inventaris, payroll, laporan, auth, dan panel dev lokal.
- `VERIFIED`: Data utama dipisahkan dengan `school_id` dan dilindungi RLS berdasarkan migration yang tersedia.
- `PARTIAL`: Dukungan offline ada, tetapi tidak berlaku penuh untuk semua modul.
- `PARTIAL`: Role dan plan tidak konsisten antara schema/dokumen/types/UI; jangan menjual klaim multi-role sebelum dibereskan.
- `DO NOT CLAIM`: 100% offline, 5 role aktif, multi-cabang, compliance formal, testimonial/rating, atau fitur yang hanya muncul di copy.

## Stack Singkat

- Next.js 14 App Router, React 18, TypeScript, Tailwind CSS.
- Supabase Auth/PostgreSQL/RLS/Realtime melalui `@supabase/ssr` dan `@supabase/supabase-js`.
- TanStack Query, Zustand, Dexie, next-pwa, Recharts.
- Scripts tersedia: `npm run dev`, `npm run build`, `npm run start`, `npm run lint`.

## Kondisi Penting Saat RAG Dibuat

- Worktree sudah punya perubahan pengguna. Lihat `.ai/CURRENT-STATE.md`; jangan revert.
- Dokumentasi lama berguna, tetapi beberapa bagiannya stale atau saling konflik.
- Landing page dan pricing saat ini memuat klaim yang harus direvisi berdasarkan truth matrix.
- Task prioritas berikutnya adalah landing page conversion-first setelah RAG tervalidasi.

## Definition of Done untuk AI

- Scope permintaan terpenuhi tanpa mengubah file di luar kebutuhan.
- Fakta dan copy sesuai truth matrix.
- Build/lint/test relevan dijalankan atau kegagalan dilaporkan jelas.
- Tidak ada secret, data pribadi, atau credential masuk commit/dokumentasi.
- `TASKS.md` dan `CHANGELOG.md` mencatat hasil serta langkah berikutnya.
