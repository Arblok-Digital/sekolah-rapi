# Cara Pakai RAG SekolahRapi

## Untuk Pemilik Proyek

Saat ganti model AI, kirim instruksi ini:

> Baca `RAG.md` dulu. Ikuti peta baca hemat token, cek task aktif, verifikasi source sebelum klaim atau edit, dan update handoff setelah selesai.

Tidak perlu menempel seluruh dokumentasi ke chat. Model membuka konteks sesuai tugas.

## Untuk AI Baru

Urutan boot:

1. Baca `RAG.md`.
2. Baca `.ai/CURRENT-STATE.md` dan `.ai/TASKS.md`.
3. Baca satu atau dua dokumen domain yang ditunjuk router.
4. Jalankan `git status --short` sebelum edit.
5. Baca source target dan dependensinya; jangan mengandalkan ringkasan saja.
6. Kerjakan scope terkecil yang memenuhi acceptance criteria.
7. Jalankan validasi relevan.
8. Update `.ai/TASKS.md` dan tambahkan entri `.ai/CHANGELOG.md`.

## Aturan Retrieval

- Jangan muat semua file `.ai` jika tugas sederhana.
- Gunakan pencarian file/simbol sebelum membaca file panjang.
- Buka `DOCUMENTATION.md` hanya untuk detail yang tidak diringkas di RAG, lalu cek kembali ke source.
- Perlakukan `AUDIT-REPORT.md` sebagai snapshot historis, bukan status mutakhir.
- Materi `marketing/` adalah draft copy, bukan bukti fitur.

## Aturan Update

- Ubah `PRODUCT-TRUTH.md` jika status fitur/klaim berubah.
- Ubah `ARCHITECTURE-MAP.md` jika route, module, schema, atau alur auth berubah.
- Ubah `BUSINESS-MARKETING.md` hanya jika owner menetapkan offer/ICP/CTA baru.
- Catat keputusan permanen di `DECISIONS.md`, bukan hanya di chat.
- Jangan menyimpan transcript panjang. Tulis hasil, alasan, file, validasi, dan next step.
