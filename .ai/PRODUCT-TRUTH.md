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
