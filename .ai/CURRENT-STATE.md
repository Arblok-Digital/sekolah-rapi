# Current Repository State

Tanggal snapshot: 2026-08-01.

## Baseline

- Repo: `sekolah-rapi`.
- Remote terdeteksi: `https://github.com/Arblok-Digital/sekolah-rapi.git`.
- Commit awal sesi RAG: `72661bf622a4a118901035cc178b3ad748062614`.
- Stack dan routes diringkas di `RAG.md` dan `ARCHITECTURE-MAP.md`.

## Perubahan Pengguna yang Sudah Ada

Saat RAG dibuat, `git status --short` menunjukkan:

```text
M  src/app/landing-page.tsx
M  src/middleware.ts
M  src/shared/components/Layout/Sidebar.tsx
?? marketing/
?? src/app/pricing/
```

Perubahan tersebut bukan dibuat oleh proses RAG. Jangan revert, overwrite massal, atau menganggap baseline bersih. Baca diff sebelum menyentuh file yang sama.

## Known Gaps

- Role dan plan tidak konsisten lintas docs/types/constants/UI.
- Generated/shared database types dilaporkan stale; verifikasi ulang sebelum refactor.
- Public enrollment berpotensi spam karena insert anonim terlalu terbuka.
- Offline fallback hanya parsial.
- Update SPP ke status paid perlu diverifikasi terhadap auto-transaction.
- Sejumlah link footer landing page mengarah ke route yang belum ada.
- Pricing/landing membawa klaim yang belum sepenuhnya didukung product truth.
- Test directories ada, tetapi belum ada script test di `package.json`.

## Dokumen Historis

- `DOCUMENTATION.md`: detail besar, berguna tetapi mungkin stale.
- `AUDIT-REPORT.md`: audit snapshot 2026-07-20; beberapa finding sudah stale/kontradiktif.
- `supabase/migrations/AUDIT_REPORT.md`: audit migration terpisah.
- `marketing/`: draft promosi, bukan sumber kebenaran fitur.

## Next Focus

Setelah RAG selesai, task utama adalah redesign landing page conversion-first dengan klaim yang sudah dibersihkan. Jangan mulai implementasi landing page tanpa membaca `.ai/BUSINESS-MARKETING.md`, `.ai/PRODUCT-TRUTH.md`, dan diff pengguna saat ini.
