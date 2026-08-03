# Prompt Ringkas untuk Model AI

## Boot Standar

```text
Baca RAG.md dulu. Ikuti peta baca hemat token, lalu baca TASKS. Jangan menebak fakta; verifikasi source target, cek git status, jangan timpa edit user, dan update TASKS + CHANGELOG setelah selesai.
```

## Lanjut Task Aktif

```text
Baca RAG.md, .ai/TASKS.md, dan changelog terbaru. Kerjakan hanya task Active/Next yang saya sebut. Jelaskan blocker, jalankan validasi relevan, lalu buat handoff ringkas.
```

## Coding

```text
Baca RAG.md dan .ai/ARCHITECTURE-MAP.md. Cari source terkait sebelum merencanakan. Pertahankan pola page -> hook -> service, audit auth/RLS bila menyentuh data, jangan edit migration lama, dan jangan ubah file di luar scope.
```

## Landing Page/Marketing

```text
Baca RAG.md, .ai/PRODUCT-TRUTH.md, dan .ai/BUSINESS-MARKETING.md. Buat copy conversion-first tanpa klaim DO NOT CLAIM, bukti sosial palsu, atau link mati. Konfirmasi offer/kontak yang belum VERIFIED sebelum publish.
```

## Audit Anti-Halusinasi

```text
Bandingkan klaim yang saya berikan dengan .ai/PRODUCT-TRUTH.md dan source code. Tampilkan temuan berdasarkan severity, sertakan path sumber, tandai VERIFIED/PARTIAL/PLANNED/DO NOT CLAIM, dan jangan memperbaiki sebelum saya minta.
```

## Handoff Sebelum Limit Habis

```text
Context hampir habis. Jangan mulai perubahan baru. Update .ai/TASKS.md dan .ai/CHANGELOG.md dengan hasil, file yang disentuh, validasi, blocker, keputusan, dan next command/step agar model berikutnya bisa lanjut.
```
