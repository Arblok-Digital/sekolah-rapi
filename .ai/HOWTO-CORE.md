# Panduan Inti (How-To) — dari pembacaan kode

> `CONFIDENCE: VERIFIED` — disusun langsung dari source code aplikasi. Dipakai untuk menjawab pertanyaan langkah-penggunaan di chat dashboard.

## 1. Mencatat Pembayaran SPP (halaman `/spp`)

Langkah:
1. Klik **Catat Pembayaran** (kanan atas; di mobile ada di menu **Aksi Lainnya**) → modal **Tambah Pembayaran Siswa**.
2. Isi form:
   - **Siswa** — pilih dari dropdown (opsi `nama (NIS - kelas)`, hanya siswa aktif).
   - **Kategori** — pilih kategori pemasukan (default "SPP"). Keterangan: pembayaran dengan kategori ini langsung tercatat di Kas sekolah.
   - Checkbox **Tanpa bulan/tahun** — untuk pembayaran sekali jadi (seragam/pendaftaran/jemputan); selain itu **Bulan** & **Tahun** wajib.
   - **Nominal (Rp)** dan **Dibayar (Rp)** — jika Status = Lunas, Dibayar terkunci = Nominal.
   - **Status** — `Lunas` / `Angsuran` / `Belum Bayar`.
   - **Metode** — `Tunai` / `Transfer` / `Qris` / `Lainnya`; **Tanggal Bayar**; **No. Kwitansi** (opsional).
3. Klik **Simpan**. Toast: "Pembayaran siswa dicatat".

Dampak penting:
- Jika **Status = Lunas** (dibayar > 0), sistem **otomatis membuat transaksi pemasukan di Kas** (deskripsi "SPP Bulan 10/2026" — format Bulan/Tahun).
- Menghapus pembayaran lunas membuat **koreksi/reversal otomatis** di Kas.
- Aksi per baris: **Kuitansi** (Unduh PNG / Bagikan WA-Telegram / Cetak), **Edit**, **Hapus**.

Alat lain di halaman ini:
- Tab **Semua Pembayaran / Tunggakan Siswa**; filter kategori/status/kelas/bulan/tahun; pencarian nama/NIS/kelas.
- **Buat Tagihan** (bulk): isi Bulan, Tahun, Nominal SPP (default Rp350.000) → semua siswa jadi status Belum Bayar.
- **Lunasi Semua** (hanya kategori SPP bulan terpilih, ada konfirmasi).
- **Sinkronkan ke Kas** — backfill pembayaran lunas yang belum masuk Kas.
- Kartu ringkasan: Total Siswa Aktif, Terkumpul, Belum Bayar, Collection Rate.

Validasi: "Pilih siswa terlebih dahulu", "Pilih kategori pembayaran terlebih dahulu", "Nominal wajib diisi".
Ekspor CSV: TIDAK ada di /spp — ada di `/reports` dan `/audit`.

## 2. Mencatat Transaksi Kas (halaman `/transactions`)

Langkah:
1. Klik **+ Tambah Transaksi** → modal **Tambah Transaksi Baru**.
2. Isi: **Tipe** (Pemasukan/Pengeluaran) → **Kategori** (opsi mengikuti Tipe) → **Jumlah (Rp)** → **Tanggal** (maksimal hari ini) → **Keterangan** (opsional) → **Bukti Transfer** (opsional, belum berfungsi/coming soon).
3. Klik **Simpan**. Toast: "Transaksi ditambahkan".

Dampak penting:
- Saldo di Overview = total pemasukan − total pengeluaran.
- `/audit` (Riwayat Kas) menampilkan running balance per baris + **Export CSV**.
- Aksi per baris: Kuitansi, Edit, Hapus (dengan konfirmasi).
- Offline: kalau jaringan putus, transaksi diantre di IndexedDB (`sync_queue`) dan disinkronkan otomatis.

Validasi: "Pilih kategori", "Jumlah harus lebih dari 0", "Pilih tanggal". Tanggal masa depan diberi peringatan (tidak muncul di Riwayat Kas/laporan sebelum tanggalnya).

## 3. Approve Pendaftar Online (halaman `/enrollment`)

Alur lengkap:
1. Link pendaftaran publik: `/register-student?school=<schoolId>` (ditampilkan di empty state `/enrollment` dengan tombol **Salin Link**).
2. Form publik diisi orang tua: Nama Siswa*, NIS (opsional), Kelas*, Jenis Kelamin, Tempat/Tanggal Lahir, Alamat, Nama Orang Tua/Wali*, No. WhatsApp*, Email (opsional), Pekerjaan → **Kirim Pendaftaran** → status masuk `pending`.
3. Admin di `/enrollment` melihat kartu Menunggu/Disetujui/Ditolak + filter status; tiap kartu: nama siswa, kelas, orang tua (nama + WA), tanggal.
4. Aksi (hanya untuk status **Menunggu**):
   - **Approve** → siswa otomatis masuk tabel **data siswa** (status `active`); TIDAK membuat akun login.
   - **Tolak** → isi **Catatan penolakan (opsional)** → **Kirim**; status jadi `rejected`.
   - **Hapus** → konfirmasi; menghapus pendaftaran yang sudah disetujui TIDAK menghapus data siswa yang sudah terlanjur dibuat.

Batasan penting:
- Fitur enrollment hanya untuk paket **Pro**. Di paket Free/Basic, halaman/link ditolak: "Pendaftaran online tidak tersedia untuk sekolah ini".
- Hanya bisa memproses yang masih `pending` ("Enrollment sudah diproses" kalau sudah).
- Link tanpa `?school=` → "Link pendaftaran tidak valid."
