# AGENTS.md — Onboarding Agent SekolahRapi

Panduan ringkas untuk agent AI di repo ini. Baca `RAG.md` (root) sebagai entry point wajib sebelum menjawab atau mengubah kode; file ini hanya ringkasan aturan teknis.

## Source of Truth

- Kebenaran teknis: `RAG.md` dan `.ai/` — bukan dokumen stale seperti `ARCHITECTURE-MAP.md` (bisa stale) atau dokumen historis yang sudah dihapus.
- Urutan verifikasi fakta teknis: database live > migration terbaru > source code > `.ai/*` > dokumentasi lama > materi marketing.
- Jangan menebak: pakai label confidence `VERIFIED` / `PARTIAL` / `PLANNED` / `DO NOT CLAIM`.
- Baca hanya file konteks yang relevan agar hemat token.

## Batasan

- JANGAN baca atau edit `.env.local` / `.env`. Gunakan `.env.example` hanya untuk nama variabel, bukan nilai.
- JANGAN edit migration SQL yang sudah applied:
  - Migration `005`/`006` kontennya sudah ditukar (005 = categories, 006 = transactions) — jangan diutak-atik.
  - `20260802/03` (lock profiles, harden functions+views, dedupe kategori) wajib dianggap applied di semua env.
- JANGAN jalankan `next build` bersamaan `next dev` di worktree yang sama — risiko konflik chunk `.next`.
- Perubahan auth, RLS, migration, pricing, dan klaim publik wajib diverifikasi ke source/migration lebih dulu.

## Checklist Perubahan

- Sebelum edit: cek `git status --short`; jangan menimpa perubahan pengguna.
- Setiap perubahan substansial wajib update `TASKS.md` / `CHANGELOG.md` / `.ai/CHANGELOG.md` (repo ini menyimpannya di `.ai/TASKS.md` dan `.ai/CHANGELOG.md`).
- Sebelum handoff: verifikasi `npm run lint && npm run typecheck && npm test`.
- Jangan masukkan secret, credential, atau data pribadi ke commit/dokumentasi.

## Skill Registry (Global)

- `D:\.config\skills\skillRegistry.json` — 336+ skill, 6 domain; ECC adalah domain terbesar.
