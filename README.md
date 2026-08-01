# SekolahRapi

SekolahRapi adalah aplikasi web administrasi sekolah untuk mengelola siswa, SPP, kas, pendaftaran siswa, inventaris, payroll, dan laporan dalam satu sistem. Aplikasi dibangun sebagai monolit modular Next.js dengan Supabase sebagai backend cloud.

Dokumen ini menjelaskan arsitektur aktual. Klaim roadmap atau fitur yang belum dikunci secara teknis ditandai secara eksplisit.

## Arsitektur Ringkas

```text
Browser / PWA (desktop dan mobile)
        |
        v
Next.js 14 App Router
  - public pages dan dashboard
  - middleware session
  - API admin terbatas
        |
        +--> TanStack Query --> domain hooks --> domain services
        |
        +--> Dexie (cache/offline untuk alur tertentu)
        |
        v
Supabase Cloud
  - Auth
  - PostgreSQL
  - Row Level Security
  - Realtime
```

## Stack

| Lapisan | Teknologi | Tanggung jawab |
|---|---|---|
| UI | React 18, Tailwind CSS, Lucide, Recharts | Halaman publik, dashboard, form, tabel, grafik |
| Web framework | Next.js 14 App Router, TypeScript | Routing, layout, middleware, API routes, build |
| Server state | TanStack Query | Fetching, cache, mutation, invalidation |
| Backend | Supabase Auth + PostgreSQL + Realtime | Identitas, data utama, isolasi tenant, pembaruan live |
| Offline | Dexie, next-pwa | Cache dan antrean offline terbatas; bukan seluruh modul |
| Validation/form | React Hook Form, Zod | Input dan validasi form |

## Struktur Source

```text
src/
  app/                    # Routes, layouts, public pages, dashboard, API
  modules/                # Domain siswa, SPP, transaksi, enrollment, dll.
    <domain>/
      components/         # UI khusus domain
      hooks/              # Query dan mutation hooks
      services/           # Akses Supabase dan business operations
      types/              # Type domain
  shared/
    components/           # Shell, sidebar, provider, UI lintas domain
    constants/            # Nama aplikasi, role, plan
    providers/            # Auth context
    services/supabase/    # Client browser/server
    types/                # Shared types
  middleware.ts           # Refresh session dan proteksi route
supabase/migrations/      # Riwayat schema, function, trigger, dan RLS
public/                   # Manifest dan aset PWA
.ai/                      # Product truth, architecture map, decision log, handoff AI
```

Pola utama domain adalah `page -> hook -> service -> Supabase`. Business logic baru sebaiknya masuk ke service/hook, bukan ditumpuk langsung di page.

## Route Utama

| Jenis | Route |
|---|---|
| Publik | `/`, `/login`, `/register`, `/pricing`, `/register-student` |
| Dashboard | `/overview`, `/students`, `/spp`, `/transactions`, `/reports` |
| Operasional | `/enrollment`, `/inventory`, `/payroll` |
| Lifecycle sekolah | `/onboarding`, `/pending-approval`, `/rejected` |
| Development only | `/dev/admin` |

## Alur Auth dan Tenant

1. Pengguna login melalui Supabase Auth.
2. `@supabase/ssr` menyimpan dan memperbarui session cookie.
3. `src/middleware.ts` memvalidasi user untuk route protected.
4. `AuthProvider` mengambil `profile` dan `school` untuk context client.
5. Data domain memiliki `school_id` dan akses database dibatasi menggunakan RLS.

Middleware bukan pengganti authorization. RLS tetap menjadi batas keamanan utama antar sekolah.

## Database dan Realtime

Database utama berada di Supabase Cloud, bukan di komputer sekolah. Pilihan ini diperlukan agar:

- owner dapat membuka dashboard dari HP atau lokasi lain;
- operator dan owner melihat sumber data yang sama;
- perubahan transaksi dan pendaftaran dapat memperbarui dashboard secara realtime;
- deployment dan pemulihan data tidak bergantung pada satu perangkat sekolah.

Tabel utama mencakup `schools`, `profiles`, `students`, `spp_payments`, `transactions`, `categories`, `enrollment_requests`, `inventory_items`, `employees`, dan `payroll_records`.

`src/app/(dashboard)/overview/page.tsx` berlangganan perubahan Supabase Realtime untuk data tertentu. Realtime tidak berarti semua halaman sudah live tanpa refresh.

Dexie adalah cache/offline layer untuk alur tertentu. Ia bukan database utama dan saat ini belum memberi dukungan offline penuh ke semua modul.

## Klasifikasi Produk

| Plan | Fokus | Fitur utama |
|---|---|---|
| Free | Validasi penggunaan | Siswa, SPP, kas dasar, 1 pengguna, kategori terbatas |
| Basic | Operasional rutin | Laporan, import/export Excel, kategori kas tanpa batas |
| Pro | Hilangkan bottleneck dan beri visibilitas owner | Pendaftaran online, dashboard realtime/mobile, payroll, inventaris, support prioritas |

Penting: klasifikasi di atas saat ini adalah aturan produk dan pricing. Enforcement plan end-to-end belum selesai. Sebelum aktivasi pembayaran otomatis, tambahkan satu entitlement registry dan guard pada navigasi, route, service, serta kebijakan/RPC database yang relevan. Menyembunyikan menu saja tidak cukup.

## Pendaftaran Online Pro

Alur aktual:

1. Orang tua membuka `/register-student` dengan identitas sekolah.
2. Form publik menulis request ke `enrollment_requests`.
3. Operator meninjau request dari `/enrollment`.
4. Request dapat disetujui atau ditolak.

Sebelum dipakai secara luas, tambahkan proteksi spam/rate limit, validasi sekolah tujuan, persetujuan privasi, dan audit perubahan status.

## Menjalankan Lokal

Prasyarat: Node.js dan project Supabase yang sudah memiliki schema sesuai migration.

```bash
npm install
copy .env.example .env.local
npm run dev
```

Buka `http://localhost:3000`.

Variabel environment mengikuti nama di `.env.example`. Jangan commit `.env.local` atau secret Supabase service-role.

## Validasi

```bash
npm run lint
npm run build
```

Jangan menjalankan `next build` bersamaan dengan `next dev` pada working tree yang sama karena keduanya menulis folder `.next` dan dapat menyebabkan chunk hilang atau cache webpack rusak. Hentikan dev server, hapus `.next`, lalu jalankan ulang jika itu terjadi.

## Aturan Perubahan Database

- Buat migration baru; jangan ubah migration yang telah diterapkan.
- Audit foreign key, RLS, dan operasi lintas tenant untuk setiap tabel baru.
- Bandingkan migration dengan schema live jika ada drift.
- Regenerasi TypeScript database types setelah perubahan schema.
- Jalankan security/performance advisor setelah DDL jika akses Supabase tersedia.

## Status dan Batasan

- Role dan permission matrix belum konsisten penuh; jangan mengklaim lima role aktif.
- Entitlement Free/Basic/Pro belum enforced end-to-end.
- Offline hanya tersedia untuk alur tertentu.
- Pendaftaran publik belum memiliki proteksi spam yang matang.
- Dokumen teknis lama dapat stale; gunakan `RAG.md` dan `.ai/PRODUCT-TRUTH.md` untuk status terkini.

## Dokumentasi Lanjutan

- `RAG.md` - router konteks dan aturan source of truth.
- `.ai/PRODUCT-TRUTH.md` - fitur terverifikasi dan guardrail klaim.
- `.ai/ARCHITECTURE-MAP.md` - peta route, module, auth, dan database.
- `.ai/DECISIONS.md` - keputusan produk dan teknis.
- `DOCUMENTATION.md` - dokumentasi historis yang harus diverifikasi terhadap source terbaru.