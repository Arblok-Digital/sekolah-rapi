# Architecture Map

## Batas Sistem

- Frontend dan server routing: Next.js App Router di `src/app/`.
- Feature domain: `src/modules/<domain>/` berisi components/hooks/services/types.
- Shared infrastructure: `src/shared/`.
- Database/auth/realtime: Supabase; schema versioned di `supabase/migrations/`.
- Offline: Dexie dan sync queue di `src/modules/offline/`.

## Route Map

Public berdasarkan middleware:

- `/` landing page.
- `/login`, `/register` auth.
- `/register-student` formulir pendaftaran publik.
- `/pricing` harga.
- `/features` diizinkan middleware, tetapi route file belum terlihat saat snapshot.

Protected/dashboard:

- `/overview`, `/students`, `/spp`, `/transactions`, `/reports`.
- `/enrollment`, `/inventory`, `/payroll`.
- `/onboarding`, `/pending-approval`, `/rejected`.
- `/dev/admin` hanya non-production menurut middleware.

API admin:

- `src/app/api/admin/users/route.ts`.
- `src/app/api/admin/delete-user/route.ts`.
- `src/app/api/admin/test-auth/route.ts`.

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

- Minimum code change: `npm run lint` dan `npm run build` jika memungkinkan.
- Test folders tersedia di `tests/unit`, `tests/integration`, `tests/e2e`, tetapi `package.json` belum menyediakan script test.
- Untuk perubahan DB, jalankan advisor/security check jika tool Supabase tersedia.
