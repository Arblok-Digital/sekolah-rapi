export interface PanduanSection {
  heading: string;
  paragraphs?: string[];
  list?: string[];
  steps?: string[];
}

export interface PanduanFaq {
  q: string;
  a: string;
}

export interface PanduanArticle {
  slug: string;
  title: string;
  description: string;
  category: 'keuangan' | 'spp' | 'pendaftaran' | 'administrasi';
  date: string;
  readMinutes: number;
  author: string;
  pillarHref: string;
  relatedSlugs: string[];
  sections: PanduanSection[];
  faq?: PanduanFaq[];
}

export interface PanduanCategory {
  key: PanduanArticle['category'];
  label: string;
  description: string;
}

export const PANDUAN_CATEGORIES: PanduanCategory[] = [
  {
    key: 'keuangan',
    label: 'Keuangan',
    description: 'Buku kas, laporan bulanan, dan rekap yang praktis untuk bendahara.',
  },
  {
    key: 'spp',
    label: 'SPP',
    description: 'Pencatatan pembayaran SPP, tunggakan, dan rekap per siswa.',
  },
  {
    key: 'pendaftaran',
    label: 'Pendaftaran',
    description: 'Alur penerimaan siswa baru dari formulir sampai daftar ulang.',
  },
  {
    key: 'administrasi',
    label: 'Administrasi',
    description: 'Checklist administrasi data siswa, keuangan, absensi, dan sarana.',
  },
];

export const CATEGORY_LABEL: Record<PanduanArticle['category'], string> = {
  keuangan: 'Keuangan',
  spp: 'SPP',
  pendaftaran: 'Pendaftaran',
  administrasi: 'Administrasi',
};

export const PILLAR_TITLES: Record<string, string> = {
  '/fitur/keuangan-sekolah': 'Fitur Keuangan Sekolah',
  '/fitur/pembayaran-spp': 'Fitur Pembayaran SPP',
  '/fitur/pendaftaran-siswa-online': 'Fitur Pendaftaran Siswa Online',
  '/fitur/laporan-sekolah': 'Fitur Laporan Sekolah',
  '/solusi/sekolah-swasta': 'Solusi Sekolah Swasta',
  '/solusi/madrasah': 'Solusi Madrasah',
};

const BULAN_INDONESIA = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
] as const;

export function formatPanduanDate(iso: string): string {
  const [tahun, bulan, tanggal] = iso.split('-').map(Number);
  return `${tanggal} ${BULAN_INDONESIA[bulan - 1]} ${tahun}`;
}

export const PANDUAN_ARTICLES: PanduanArticle[] = [
  {
    slug: 'cara-membuat-laporan-keuangan-sekolah-sederhana',
    title: 'Cara Membuat Laporan Keuangan Sekolah yang Sederhana',
    description:
      'Panduan membuat laporan keuangan sekolah sederhana: cara mencatat pemasukan dan pengeluaran, lalu menyusun rekap bulanan yang mudah dibaca kepala sekolah dan yayasan.',
    category: 'keuangan',
    date: '2026-07-21',
    readMinutes: 7,
    author: 'Tim SekolahRapi',
    pillarHref: '/fitur/keuangan-sekolah',
    relatedSlugs: [
      'cara-bendahara-sekolah-mencatat-kas-masuk-keluar',
      'administrasi-sekolah-swasta-yang-perlu-dirapikan',
    ],
    sections: [
      {
        heading: 'Kenapa laporan keuangan sekolah perlu dibuat rutin',
        paragraphs: [
          'Laporan keuangan sederhana menjawab satu pertanyaan paling mendasar bagi pengelola sekolah: dari mana uang masuk, ke mana uang keluar, dan berapa sisa kas pada akhir bulan. Tanpa laporan yang rutin, keputusan seperti menambah tenaga pengajar, merenovasi ruang kelas, atau menunda pembelian sarana sering dibuat berdasarkan perkiraan, bukan data.',
          'Laporan juga membantu transparansi antara bendahara, kepala sekolah, dan yayasan. Semua pihak melihat angka yang sama, sehingga tidak ada kesenjangan informasi saat mengevaluasi kinerja keuangan sekolah.',
        ],
      },
      {
        heading: 'Siapkan kategori pemasukan dan pengeluaran',
        paragraphs: [
          'Sebelum mencatat, tentukan kategori tetap agar transaksi masuk ke tempat yang sama setiap kali terjadi. Buat sesederhana mungkin — cukup kategori yang benar-benar dipakai sekolah Anda.',
        ],
        list: [
          'Pemasukan: pembayaran SPP, uang pendaftaran siswa baru, sumbangan orang tua, dana BOS/bantuan, dan pemasukan lain seperti penjualan buku atau seragam.',
          'Pengeluaran: gaji guru dan staf, operasional harian (ATK, fotokopi), listrik dan air, transportasi, kegiatan sekolah, perawatan dan sarana, serta pengeluaran lain.',
        ],
      },
      {
        heading: 'Catat setiap transaksi dengan disiplin',
        paragraphs: [
          'Kuncinya adalah mencatat saat transaksi terjadi, bukan menunda sampai akhir minggu. Data yang terlambat masuk mudah lupa jumlah atau tanggalnya.',
        ],
        steps: [
          'Siapkan satu buku kas atau tabel catatan harian dengan kolom tanggal, keterangan, kategori, pemasukan, pengeluaran, dan saldo.',
          'Setiap uang masuk dicatat sebagai pemasukan dengan sumbernya, misalnya SPP an. nama siswa.',
          'Setiap uang keluar dicatat sebagai pengeluaran beserta keperluan dan penerimanya.',
          'Perbarui saldo setiap kali selesai mencatat, lalu cocokkan dengan uang tunai atau rekening yang tersisa.',
          'Simpan bukti transaksi (kwitansi, nota) dan beri nomor urut agar mudah ditelusuri.',
        ],
      },
      {
        heading: 'Susun rekap bulanan',
        paragraphs: [
          'Pada akhir bulan, kumpulkan seluruh catatan harian menjadi rekap bulanan. Rekap ini cukup berisi total pemasukan per kategori, total pengeluaran per kategori, dan saldo akhir.',
          'Jika jumlahnya tidak cocok dengan uang yang tersisa, telusuri kembali transaksi. Menemukan selisih lebih mudah dilakukan per bulan daripada menunggu akhir tahun.',
        ],
        list: [
          'Saldo awal bulan.',
          'Total pemasukan per kategori.',
          'Total pengeluaran per kategori.',
          'Saldo akhir bulan (saldo awal + pemasukan - pengeluaran).',
        ],
      },
      {
        heading: 'Contoh format rekap sederhana',
        paragraphs: [
          'Format di bawah ini bisa dibuat di buku tulis, spreadsheet, atau aplikasi pencatatan seperti SekolahRapi yang menyediakan import/export Excel untuk data keuangan.',
        ],
        list: [
          'Saldo awal: Rp 12.000.000',
          'Pemasukan - SPP: Rp 18.500.000',
          'Pemasukan - Uang pendaftaran: Rp 2.000.000',
          'Pemasukan - Bantuan/dana: Rp 3.000.000',
          'Pengeluaran - Gaji guru: Rp 15.000.000',
          'Pengeluaran - Listrik dan air: Rp 850.000',
          'Pengeluaran - Operasional: Rp 1.250.000',
          'Saldo akhir: Rp 18.400.000',
        ],
      },
      {
        heading: 'Tips agar laporan tetap sederhana dan berguna',
        list: [
          'Rutinkan pencatatan: lebih baik 10 menit setiap hari daripada 2 jam di akhir bulan.',
          'Jangan menambah kategori kecuali benar-benar diperlukan; terlalu banyak kategori justru membuat pencatatan berhenti.',
          'Rekap yang dibagikan ke kepala sekolah dan yayasan cukup satu halaman.',
          'Gunakan alat bantu pencatatan (buku, spreadsheet, atau aplikasi seperti SekolahRapi) yang paling realistis dijalankan rutin oleh bendahara.',
        ],
      },
    ],
    faq: [
      {
        q: 'Apakah laporan keuangan sekolah harus memakai standar akuntansi tertentu?',
        a: 'Untuk sekolah swasta skala kecil dan menengah, laporan sederhana pemasukan-pengeluaran-saldo sudah cukup untuk kebutuhan operasional dan pelaporan internal. Standar akuntansi formal biasanya baru diperlukan saat sekolah memiliki kewajiban pelaporan yang lebih besar — sebaiknya dikonsultasikan dengan pendamping atau akuntan bila kondisinya demikian.',
      },
      {
        q: 'Berapa sering laporan sebaiknya dibuat?',
        a: 'Catatan harian dilakukan setiap transaksi, dan rekap bulanan ditutup di akhir bulan. Rekap tahunan tinggal menjumlahkan 12 rekap bulanan.',
      },
      {
        q: 'Bagaimana cara mengatasi saldo yang tidak cocok?',
        a: 'Cek satu per satu: transaksi yang belum dicatat, bukti yang hilang, atau salah jumlah. Cocokkan juga dengan mutasi rekening bank dan sisa uang tunai. Usahakan menemukan selisihnya di bulan yang sama agar mudah dilacak.',
      },
    ],
  },
  {
    slug: 'contoh-format-pembayaran-spp-siswa',
    title: 'Contoh Format Pembayaran SPP Siswa',
    description:
      'Contoh format buku dan rekap pembayaran SPP: kolom-kolom yang umum dipakai (nama siswa, kelas, bulan, nominal, status, tanggal bayar, bukti) plus cara merekapnya.',
    category: 'spp',
    date: '2026-07-14',
    readMinutes: 6,
    author: 'Tim SekolahRapi',
    pillarHref: '/fitur/pembayaran-spp',
    relatedSlugs: [
      'template-rekap-tunggakan-spp',
      'cara-membuat-laporan-keuangan-sekolah-sederhana',
    ],
    sections: [
      {
        heading: 'Kenapa format pembayaran SPP perlu baku',
        paragraphs: [
          'Format yang baku membuat pencatatan SPP konsisten dari satu bulan ke bulan berikutnya. Saat bendahara berganti, data tetap bisa dibaca tanpa perlu menerka maksud catatan lama.',
          'Format yang baik juga menjawab tiga pertanyaan yang paling sering diajukan orang tua: sudah bayar bulan apa saja, berapa nominalnya, dan kapan dibayarkan.',
        ],
      },
      {
        heading: 'Kolom-kolom yang umum ada di buku SPP',
        list: [
          'No dan tanggal bayar: urutan transaksi sekaligus bukti kapan pembayaran diterima.',
          'Nama siswa dan kelas: memastikan pembayaran masuk ke siswa yang tepat.',
          'Bulan yang dibayarkan: misalnya September 2026, karena orang tua kadang membayar beberapa bulan sekaligus.',
          'Nominal: jumlah yang dibayarkan dan sisa cicilan bila ada.',
          'Status: Lunas, Sebagian, atau Belum Bayar untuk memudahkan pengecekan.',
          'Bukti bayar: nomor kwitansi atau arsip transfer.',
          'Catatan: keterangan tambahan seperti pembayaran yang dititipkan.',
        ],
      },
      {
        heading: 'Cara mengisi dan merekap pembayaran',
        steps: [
          'Tetapkan nominal SPP tetap per bulan di awal tahun ajaran dan umumkan ke orang tua.',
          'Catat pembayaran segera setelah diterima, lengkap dengan tanggal dan nomor bukti.',
          'Tandai status di baris siswa setiap kali ada pembayaran.',
          'Di akhir bulan, hitung jumlah siswa yang membayar dan total nominal per kelas maupun per angkatan.',
          'Cocokkan total nominal dengan kas masuk SPP pada rekap keuangan bulanan.',
        ],
      },
      {
        heading: 'Contoh format rekap bulanan SPP',
        paragraphs: [
          'Tabel sederhana per bulan cukup memuat nama siswa, kelas, status, tanggal bayar, dan nominal. Contoh:',
        ],
        list: [
          'Ahmad Fauzi | Kelas 7A | Lunas | 5 Juli 2026 | Rp 150.000',
          'Bunga Lestari | Kelas 7A | Lunas | 6 Juli 2026 | Rp 150.000',
          'Citra Ayu | Kelas 7B | Sebagian (Rp 75.000) | 10 Juli 2026 | sisa Rp 75.000',
          'Total terkumpul bulan Juli: Rp 15.900.000',
        ],
      },
      {
        heading: 'Mengelola bukti bayar',
        paragraphs: [
          'Simpan bukti bayar dengan rapi: kwitansi bernomor berurutan untuk pembayaran tunai, dan screenshot mutasi untuk pembayaran transfer.',
          'Berikan nomor kwitansi yang sama dengan yang tercantum di buku SPP agar mudah dicocokkan jika orang tua bertanya.',
        ],
      },
      {
        heading: 'Tips menjaga buku SPP tetap rapi',
        list: [
          'Isi buku SPP setiap hari transaksi terjadi, jangan menunggu akhir bulan.',
          'Pisahkan kolom bulan yang dibayar dari tanggal bayar — keduanya sering tertukar.',
          'Rutin salin buku SPP ke rekap digital (spreadsheet atau aplikasi seperti SekolahRapi) sebagai cadangan.',
          'Evaluasi tunggakan tiap awal bulan dan jadwalkan penagihan.',
        ],
      },
    ],
    faq: [
      {
        q: 'Bolehkah orang tua membayar SPP untuk beberapa bulan sekaligus?',
        a: 'Boleh, asalkan dicatat per bulan yang dibayarkan agar status tiap bulan tetap jelas. Kolom bulan yang dibayarkan dan kolom status akan menjaganya tetap rapi.',
      },
      {
        q: 'Bagaimana mencatat pembayaran sebagian?',
        a: 'Catat nominal yang diterima, ubah status menjadi Sebagian, dan tuliskan sisa yang harus dilunasi. Pastikan rekap bulanan menampilkan sisa ini supaya tidak terlupakan.',
      },
      {
        q: 'Kalau pembayaran lewat transfer, buktinya bagaimana?',
        a: 'Simpan bukti transfer (screenshot atau notifikasi mutasi) dan catat tanggalnya. Beri nomor bukti sendiri sesuai urutan di buku SPP agar konsisten.',
      },
    ],
  },
  {
    slug: 'cara-mengelola-pendaftaran-siswa-baru-online',
    title: 'Cara Mengelola Pendaftaran Siswa Baru Secara Online',
    description:
      'Alur penerimaan siswa baru secara online: pengumuman, formulir pendaftaran, verifikasi data calon, dan konfirmasi — langkah demi langkah untuk panitia.',
    category: 'pendaftaran',
    date: '2026-07-08',
    readMinutes: 6,
    author: 'Tim SekolahRapi',
    pillarHref: '/fitur/pendaftaran-siswa-online',
    relatedSlugs: [
      'administrasi-sekolah-swasta-yang-perlu-dirapikan',
      'cara-membuat-laporan-keuangan-sekolah-sederhana',
    ],
    sections: [
      {
        heading: 'Alur penerimaan siswa baru dari awal sampai akhir',
        paragraphs: [
          'Pendaftaran online pada dasarnya memindahkan alur yang biasa dilakukan di meja panitia ke formulir digital. Alur umumnya sama: umumkan, terima pendaftaran, verifikasi, konfirmasi, dan daftar ulang.',
        ],
        steps: [
          'Terbitkan pengumuman resmi berisi jadwal, syarat, dan tata cara pendaftaran.',
          'Buka periode pendaftaran dan kumpulkan data calon siswa melalui formulir.',
          'Verifikasi data dan dokumen calon siswa secara manual oleh panitia.',
          'Umumkan hasil seleksi (bila ada seleksi) atau konfirmasi diterima.',
          'Proses daftar ulang dan pembayaran awal.',
        ],
      },
      {
        heading: 'Siapkan formulir dan syarat pendaftaran',
        paragraphs: [
          'Susun daftar data yang benar-benar dibutuhkan. Semakin sedikit isian wajib, semakin sedikit calon yang berhenti di tengah pengisian.',
        ],
        list: [
          'Data calon: nama lengkap, tempat tanggal lahir, jenis kelamin, alamat.',
          'Data orang tua/wali: nama, pekerjaan, nomor HP aktif, alamat.',
          'Asal sekolah dan riwayat pendidikan untuk jenjang SMP/SMA.',
          'Syarat dokumen: akta kelahiran, kartu keluarga, foto, dan dokumen lain yang diminta sekolah.',
          'Informasi pembayaran: uang pendaftaran, SPP, dan biaya lain — sampaikan transparan sejak awal.',
        ],
      },
      {
        heading: 'Publikasikan pengumuman dan jadwal',
        list: [
          'Sebarkan pengumuman lewat media resmi sekolah: papan informasi, grup orang tua, dan akun media sosial.',
          'Cantumkan link formulir, batas waktu pendaftaran, dan nomor kontak panitia yang jelas.',
          'Jadwalkan sesi tanya jawab atau open house untuk menjawab pertanyaan orang tua.',
        ],
      },
      {
        heading: 'Verifikasi data calon siswa',
        paragraphs: [
          'Setelah pendaftaran ditutup, panitia memeriksa kelengkapan dan kebenaran data satu per satu. Pastikan nomor HP orang tua aktif karena ini jalur komunikasi utama selama proses berlangsung.',
          'Verifikasi dilakukan secara manual oleh panitia: cek dokumen, cocokkan data formulir dengan dokumen yang dikirim, dan hubungi orang tua bila ada yang kurang jelas. Sistem pendaftaran online hanya membantu mengumpulkan data, bukan menggantikan pemeriksaan panitia.',
        ],
        steps: [
          'Buat daftar pendaftar berdasarkan status kelengkapan dokumen.',
          'Hubungi calon yang datanya belum lengkap dengan tenggat waktu perbaikan.',
          'Cocokkan data duplikat (misalnya nama yang sama) sebelum menetapkan hasil.',
        ],
      },
      {
        heading: 'Konfirmasi hasil dan daftar ulang',
        list: [
          'Umumkan hasil dan kirim pemberitahuan resmi ke nomor HP atau email orang tua.',
          'Berikan tenggat daftar ulang yang jelas dan informasi pembayaran awal.',
          'Sisakan slot untuk calon cadangan bila ada pendaftar yang tidak melakukan daftar ulang.',
          'Catat data siswa tetap (final) setelah daftar ulang selesai.',
        ],
      },
      {
        heading: 'Tips mengelola pendaftaran online yang lancar',
        list: [
          'Uji formulir sebelum dibuka: isi sendiri dari ponsel untuk memastikan tampilan dan isian berjalan baik.',
          'Rutin cek pendaftar masuk setiap hari, jangan menunggu sampai periode hampir berakhir.',
          'Simpan data pendaftar di satu tempat (spreadsheet atau aplikasi pendaftaran online seperti SekolahRapi) agar tidak tercecer di chat atau kertas.',
          'Siapkan jawaban standar untuk pertanyaan yang sering diajukan orang tua.',
        ],
      },
    ],
    faq: [
      {
        q: 'Apakah data calon siswa langsung divalidasi otomatis oleh sistem?',
        a: 'Tidak. Verifikasi tetap dilakukan manual oleh panitia — sistem hanya membantu mengumpulkan dan merapikan data yang masuk. Pemeriksaan dokumen dan konfirmasi ke orang tua tetap menjadi tanggung jawab panitia.',
      },
      {
        q: 'Bagaimana jika orang tua mengisi formulir dua kali?',
        a: 'Buat aturan sederhana: satu pendaftar satu formulir. Saat menemukan duplikat, konfirmasi ke orang tua dan simpan data yang paling lengkap.',
      },
      {
        q: 'Data pendaftar bisa tercecer di berbagai tempat?',
        a: 'Bisa, kalau alurnya campur antara chat, kertas, dan file. Kunci rapi adalah satu pintu masuk data: semua pendaftar mengisi lewat satu formulir, lalu direkap di satu tempat.',
      },
      {
        q: 'Sampai kapan pendaftaran online dibuka?',
        a: 'Sesuai jadwal yang diumumkan. Pastikan batas waktu jelas di pengumuman dan ada toleransi perbaikan data, bukan perpanjangan pendaftaran.',
      },
    ],
  },
  {
    slug: 'administrasi-sekolah-swasta-yang-perlu-dirapikan',
    title: 'Administrasi Sekolah Swasta yang Perlu Dirapikan',
    description:
      'Checklist administrasi sekolah swasta: data siswa, keuangan, absensi, dan sarana prasarana — apa saja yang perlu dirapikan dan kapan harus diperbarui.',
    category: 'administrasi',
    date: '2026-07-02',
    readMinutes: 7,
    author: 'Tim SekolahRapi',
    pillarHref: '/solusi/sekolah-swasta',
    relatedSlugs: [
      'cara-membuat-laporan-keuangan-sekolah-sederhana',
      'contoh-format-pembayaran-spp-siswa',
    ],
    sections: [
      {
        heading: 'Apa saja yang termasuk administrasi sekolah',
        paragraphs: [
          'Administrasi sekolah adalah seluruh catatan yang mendukung operasional dan pelaporan sekolah swasta. Kalau diibaratkan rumah, administrasi adalah rak penyimpanan: rapinya menentukan mudah tidaknya menemukan dokumen saat dibutuhkan — misalnya saat orang tua bertanya tentang pembayaran atau saat yayasan meminta rekap.',
          'Secara garis besar ada empat kelompok: data siswa, keuangan, absensi/kehadiran, dan sarana prasarana. Empat kelompok ini saling terhubung — pembayaran SPP merujuk pada data siswa, dan pengadaan sarana memakai kas sekolah.',
        ],
      },
      {
        heading: 'Administrasi data siswa',
        list: [
          'Profil siswa: nama, tempat tanggal lahir, alamat, wali, dan dokumen seperti akta dan KK.',
          'Riwayat pembayaran: SPP, uang pendaftaran, dan pembayaran lain per siswa.',
          'Mutasi: siswa pindah masuk/keluar beserta tanggal dan keterangan.',
          'Dokumen arsip: rapor, ijazah, dan surat penting yang ditata per tahun ajaran.',
        ],
      },
      {
        heading: 'Administrasi keuangan',
        list: [
          'Catatan kas masuk dan kas keluar harian.',
          'Rekap bulanan pemasukan per kategori (SPP, pendaftaran, bantuan, lain-lain).',
          'Rekap pengeluaran per kategori (gaji, operasional, listrik dan air, kegiatan).',
          'Arsip kwitansi, nota, dan bukti transfer yang bernomor urut.',
        ],
      },
      {
        heading: 'Administrasi absensi dan kehadiran',
        list: [
          'Daftar hadir harian siswa per kelas.',
          'Rekapitulasi kehadiran bulanan (hadir, izin, sakit, tanpa keterangan).',
          'Absensi guru dan staf sebagai dasar administrasi kepegawaian.',
          'Surat izin dan surat keterangan sakit sebagai lampiran rekapitulasi.',
        ],
      },
      {
        heading: 'Administrasi sarana dan prasarana',
        list: [
          'Inventaris barang: nama barang, jumlah, kondisi, lokasi, dan penanggung jawab.',
          'Catatan peminjaman dan perbaikan sarana.',
          'Daftar kebutuhan dan rencana pengadaan.',
        ],
      },
      {
        heading: 'Checklist bulanan administrasi sekolah',
        list: [
          'Rekap kehadiran siswa dan staf ditutup di awal bulan berikutnya.',
          'Buku kas dicocokkan dengan sisa uang tunai dan mutasi rekening.',
          'Rekap SPP dan tunggakan diperbarui.',
          'Data siswa baru dan mutasi diperbarui di daftar induk.',
          'Dokumen penting difotokopi atau discan dan disimpan salinannya.',
          'Inventaris yang rusak dicatat untuk direncanakan penggantian.',
        ],
      },
    ],
    faq: [
      {
        q: 'Apakah administrasi harus semua digital?',
        a: 'Tidak harus. Yang penting konsisten dan bisa diakses saat dibutuhkan. Banyak sekolah memulai dari buku dan spreadsheet, lalu pindah ke aplikasi seperti SekolahRapi ketika volume data mulai banyak.',
      },
      {
        q: 'Siapa yang sebaiknya mengelola administrasi sekolah?',
        a: 'Sesuai kapasitas sekolah: admin/operator memegang data siswa dan SPP, bendahara memegang kas, dan kepala sekolah melakukan review rutin. Berapapun jumlah stafnya, tugas harus jelas siapa yang mengisi dan siapa yang mengecek.',
      },
      {
        q: 'Berapa lama dokumen administrasi sebaiknya disimpan?',
        a: 'Sebagai aturan praktis, simpan minimal satu tahun ajaran untuk catatan harian dan lebih lama untuk dokumen penting seperti daftar induk dan bukti keuangan. Ikuti ketentuan yang berlaku di lingkungan sekolah Anda bila ada.',
      },
    ],
  },
  {
    slug: 'cara-bendahara-sekolah-mencatat-kas-masuk-keluar',
    title: 'Cara Bendahara Sekolah Mencatat Kas Masuk dan Keluar',
    description:
      'Cara bendahara mencatat kas masuk dan keluar secara sederhana: buku kas harian, memisahkan pemasukan dan pengeluaran, sampai rekonsiliasi bulanan.',
    category: 'keuangan',
    date: '2026-08-03',
    readMinutes: 7,
    author: 'Tim SekolahRapi',
    pillarHref: '/fitur/keuangan-sekolah',
    relatedSlugs: [
      'cara-membuat-laporan-keuangan-sekolah-sederhana',
      'template-rekap-tunggakan-spp',
    ],
    sections: [
      {
        heading: 'Peran bendahara dan buku kas',
        paragraphs: [
          'Bendahara memegang dua tanggung jawab yang saling menguatkan: menjaga uang kas sekolah dan menjaga catatan yang akurat. Uang yang rapi tanpa catatan sama berbahayanya dengan catatan rapi tanpa uang — keduanya harus cocok.',
          'Buku kas sederhana cukup berisi: tanggal, keterangan, pemasukan, pengeluaran, dan saldo. Tidak perlu rumit, yang penting dicatat setiap hari.',
        ],
      },
      {
        heading: 'Siapkan buku kas sederhana',
        list: [
          'Satu kolom tanggal untuk setiap transaksi.',
          'Kolom keterangan: sumber dana atau keperluan, plus nama pihak terkait.',
          'Kolom pemasukan dan kolom pengeluaran yang terpisah.',
          'Kolom saldo yang dihitung ulang setiap transaksi.',
          'Nomor urut transaksi agar mudah ditelusuri.',
        ],
      },
      {
        heading: 'Mencatat pemasukan',
        steps: [
          'Catat sumber pemasukan secara spesifik, misalnya SPP an. nama siswa, bukan sekadar tulisan SPP.',
          'Tulis nominal sesuai uang yang benar-benar diterima.',
          'Beri nomor bukti atau kwitansi yang dikeluarkan.',
          'Masukkan jumlah ke kolom pemasukan dan perbarui saldo.',
        ],
      },
      {
        heading: 'Mencatat pengeluaran',
        steps: [
          'Tulis keperluan dengan jelas, misalnya beli ATK beserta toko atau penerimanya.',
          'Pastikan ada bukti berupa nota atau kwitansi sebelum mencatat.',
          'Masukkan jumlah ke kolom pengeluaran dan perbarui saldo.',
          'Untuk pengeluaran besar, lampirkan persetujuan kepala sekolah atau yayasan bila ada aturannya.',
        ],
      },
      {
        heading: 'Rekonsiliasi kas bulanan',
        paragraphs: [
          'Rekonsiliasi adalah mencocokkan saldo buku dengan uang yang benar-benar ada. Lakukan rutin di akhir bulan agar selisih kecil segera ketahuan.',
        ],
        steps: [
          'Jumlahkan seluruh kolom pemasukan dan pengeluaran dalam sebulan.',
          'Hitung saldo akhir: saldo awal + total pemasukan - total pengeluaran.',
          'Hitung uang fisik: sisa tunai di kas plus saldo rekening sekolah.',
          'Bandingkan kedua angka. Bila berbeda, telusuri transaksi satu per satu sampai ketemu penyebabnya.',
          'Simpan hasil rekonsiliasi sebagai lampiran rekap bulanan.',
        ],
      },
      {
        heading: 'Tips menjaga kas tetap akurat',
        list: [
          'Catat transaksi di hari yang sama, sekecil apapun nominalnya.',
          'Jangan mencampur uang pribadi dengan uang sekolah.',
          'Pisahkan transaksi tunai dan transfer agar lebih mudah dicocokkan.',
          'Minta tanda terima untuk pengeluaran, sekalipun kecil.',
          'Gunakan alat bantu pencatatan (buku, spreadsheet, atau aplikasi kas seperti SekolahRapi) yang paling praktis dijalankan setiap hari.',
        ],
      },
    ],
    faq: [
      {
        q: 'Bagaimana mencatat uang yang diambil untuk dana operasional kecil?',
        a: 'Catat sebagai pengeluaran kas operasional saat diambil, lalu minta laporan singkat dan bukti saat sisa dikembalikan. Jangan membiarkan dana operasional berjalan tanpa catatan lebih dari beberapa hari.',
      },
      {
        q: 'Kapan saldo buku kas harus diperbarui?',
        a: 'Setiap kali ada transaksi. Kalau menumpuk, saldo mudah salah dan selisih sulit ditelusuri.',
      },
      {
        q: 'Apa yang dilakukan jika saldo buku tidak cocok dengan uang kas?',
        a: 'Jangan menutupnya dengan asumsi. Periksa ulang penjumlahan, cari transaksi yang belum dicatat, cocokkan dengan kwitansi, lalu cek mutasi rekening. Jika selisih tetap ada, laporkan secara transparan ke kepala sekolah.',
      },
      {
        q: 'Perlukah laporan disampaikan setiap bulan?',
        a: 'Sangat dianjurkan. Rekap satu halaman berisi saldo awal, total pemasukan, total pengeluaran, dan saldo akhir sudah cukup untuk review bulanan.',
      },
    ],
  },
  {
    slug: 'template-rekap-tunggakan-spp',
    title: 'Template Rekap Tunggakan SPP',
    description:
      'Cara membuat rekap tunggakan SPP per siswa dan per bulan, plus trik memprioritaskan penagihan agar uang sekolah tidak menumpuk.',
    category: 'spp',
    date: '2026-07-25',
    readMinutes: 6,
    author: 'Tim SekolahRapi',
    pillarHref: '/fitur/pembayaran-spp',
    relatedSlugs: [
      'contoh-format-pembayaran-spp-siswa',
      'cara-bendahara-sekolah-mencatat-kas-masuk-keluar',
    ],
    sections: [
      {
        heading: 'Kenapa rekap tunggakan perlu dibuat',
        paragraphs: [
          'Tunggakan SPP yang tidak direkap sering baru terasa dampaknya di akhir tahun, saat angkanya sudah besar dan sulit dikejar. Rekap tunggakan yang diperbarui rutin membuat sekolah tahu sejak dini siswa mana yang tertinggal pembayaran.',
          'Rekap ini juga menjadi dasar komunikasi yang lebih profesional dengan orang tua: bukan sekadar menagih, tetapi menyampaikan posisi pembayaran secara jelas dan tertulis.',
        ],
      },
      {
        heading: 'Struktur rekap tunggakan',
        list: [
          'Nama siswa dan kelas.',
          'Total tagihan per bulan (nominal SPP).',
          'Bulan-bulan yang sudah dibayar.',
          'Bulan-bulan yang belum dibayar (tunggakan).',
          'Total nominal tunggakan.',
          'Status penagihan: belum dihubungi, sudah dihubungi, ada janji bayar, atau dalam pembayaran.',
        ],
      },
      {
        heading: 'Cara menghitung tunggakan per siswa',
        steps: [
          'Tetapkan daftar bulan berjalan, misalnya Juli sampai Desember 2026.',
          'Tandai bulan yang sudah lunas dari buku pembayaran SPP.',
          'Hitung bulan yang belum lunas dan kalikan dengan nominal SPP.',
          'Tambahkan biaya lain yang belum dibayar bila ada, misalnya pembayaran sebagian yang belum selesai.',
          'Cantumkan catatan khusus seperti menunggu konfirmasi orang tua.',
        ],
      },
      {
        heading: 'Memprioritaskan penagihan',
        paragraphs: [
          'Tidak semua tunggakan bisa ditangani sekaligus. Prioritaskan agar energi panitia tepat sasaran.',
        ],
        list: [
          'Tunggakan 3 bulan atau lebih: hubungi langsung, tawarkan janji temu dengan kepala sekolah bila perlu.',
          'Tunggakan 1-2 bulan: pengingat rutin via WhatsApp atau surat pemberitahuan.',
          'Sedang dalam perjanjian pembayaran: pantau komitmen sesuai jadwal.',
          'Siswa kelas akhir: beri perhatian ekstra karena dokumen penting sering terkait dengan pelunasan.',
        ],
      },
      {
        heading: 'Menindaklanjuti penagihan',
        list: [
          'Catat setiap komunikasi: tanggal dihubungi, melalui apa, dan hasilnya.',
          'Kirim rekap tunggakan dalam bentuk tertulis agar tidak ada miskomunikasi.',
          'Tetapkan tenggat baru yang realistis dan pantau di rekap.',
          'Libatkan wali kelas untuk situasi yang membutuhkan pendekatan personal.',
        ],
      },
      {
        heading: 'Tips agar tunggakan tidak menumpuk',
        list: [
          'Perbarui rekap tunggakan setiap awal bulan.',
          'Tagih rutin dengan bahasa yang santun dan menyebut angka secara spesifik.',
          'Tawarkan opsi pembayaran per bulan atau per termin sesuai kemampuan, selama kebijakan sekolah mengizinkan.',
          'Gunakan alat bantu pencatatan (buku, spreadsheet, atau aplikasi SPP seperti SekolahRapi) agar status pembayaran selalu terpantau.',
        ],
      },
    ],
    faq: [
      {
        q: 'Bagaimana cara menagih yang santun tapi tetap tegas?',
        a: 'Kirim rekap tertulis yang spesifik: nama siswa, bulan yang belum dibayar, dan total. Tawarkan solusi seperti jadwal angsuran sambil menegaskan tenggat. Hindari menagih lewat anak di kelas.',
      },
      {
        q: 'Apakah tunggakan perlu dilaporkan ke yayasan?',
        a: 'Ya, idealnya setiap bulan dalam bentuk rekap ringkas: jumlah siswa yang menunggak, total nominal, dan rencana tindak lanjut.',
      },
      {
        q: 'Kalau orang tua mengaku sudah membayar tunai tapi tidak ada catatan?',
        a: 'Minta nomor kwitansi atau bukti lain. Ini sebabnya setiap pembayaran tunai harus selalu diberi kwitansi bernomor — dokumen itu melindungi orang tua dan sekolah sekaligus.',
      },
    ],
  },
  {
    slug: 'apa-itu-aplikasi-administrasi-sekolah',
    title: 'Apa Itu Aplikasi Administrasi Sekolah?',
    description:
      'Aplikasi administrasi sekolah adalah perangkat lunak untuk mencatat dan merapikan data operasional sekolah seperti data siswa, pembayaran SPP, kas, absensi, dan inventaris dalam satu tempat.',
    category: 'administrasi',
    date: '2026-08-03',
    readMinutes: 5,
    author: 'Tim SekolahRapi',
    pillarHref: '/fitur/keuangan-sekolah',
    relatedSlugs: [
      'administrasi-sekolah-swasta-yang-perlu-dirapikan',
      'aplikasi-keuangan-sekolah-swasta',
      'berapa-biaya-aplikasi-administrasi-sekolah',
    ],
    sections: [
      {
        heading: 'Jawaban singkat',
        paragraphs: [
          'Aplikasi administrasi sekolah adalah perangkat lunak (web atau mobile) yang dipakai sekolah untuk mencatat dan mengelola data operasional harian — mulai dari data siswa, pembayaran SPP, kas masuk dan keluar, absensi, sampai inventaris — agar semua informasi tersimpan rapi di satu tempat dan mudah dicari kembali.',
        ],
      },
      {
        heading: 'Masalah yang diselesaikan aplikasi administrasi sekolah',
        list: [
          'Data siswa tersebar di buku, spreadsheet, dan chat sehingga sulit dicari.',
          'Rekap SPP dan tunggakan harus dihitung manual setiap kali ditanya.',
          'Kas masuk dan keluar tidak tercatat konsisten, saldo sering tidak jelas.',
          'Laporan untuk kepala sekolah atau yayasan memakan waktu berjam-jam.',
          'Saat bendahara atau operator berganti, data lama sulit dibaca.',
        ],
      },
      {
        heading: 'Fitur yang umum ada',
        list: [
          'Data siswa: profil, kelas, mutasi, dan arsip dokumen.',
          'Pembayaran SPP: pencatatan per siswa per bulan dan rekap tunggakan.',
          'Kas: pemasukan, pengeluaran, kategori, dan riwayat saldo.',
          'Laporan: rekap bulanan keuangan dan SPP yang bisa diekspor.',
          'Pendaftaran siswa online, inventaris, dan penggajian — tergantung paket yang dipakai.',
        ],
      },
      {
        heading: 'Apakah sekolah kecil perlu aplikasi administrasi?',
        paragraphs: [
          'Sekolah kecil sekalipun terbantu, terutama di sisi keuangan dan SPP. Data yang tercatat rutin di satu tempat lebih mudah dipertanggungjawabkan dibanding tumpukan catatan manual. Mulai dari fitur paling dibutuhkan — misalnya kas dan SPP — lalu kembangkan seiring kebutuhan.',
        ],
      },
    ],
    faq: [
      {
        q: 'Apakah aplikasi administrasi sekolah bisa dipakai di HP?',
        a: 'Bisa untuk aplikasi berbasis web yang responsif, seperti SekolahRapi yang nyaman dibuka dari ponsel untuk memantau arus kas. Pastikan menanyakan hal ini sebelum memilih aplikasi.',
      },
      {
        q: 'Data sekolah aman disimpan di aplikasi?',
        a: 'Pada aplikasi yang memakai database cloud dengan pemisahan data per sekolah dan kebijakan akses berlapis (row level security), data sekolah tidak bisa dibaca sekolah lain. Tanyakan bagaimana data Anda dipisahkan dan siapa yang bisa mengaksesnya.',
      },
    ],
  },
  {
    slug: 'aplikasi-keuangan-sekolah-swasta',
    title: 'Aplikasi Keuangan untuk Sekolah Swasta',
    description:
      'Cara memilih aplikasi keuangan sekolah swasta: pencatatan kas, rekap bulanan, laporan untuk yayasan, dan fitur yang paling dibutuhkan bendahara.',
    category: 'keuangan',
    date: '2026-08-03',
    readMinutes: 6,
    author: 'Tim SekolahRapi',
    pillarHref: '/fitur/keuangan-sekolah',
    relatedSlugs: [
      'cara-membuat-laporan-keuangan-sekolah-sederhana',
      'cara-bendahara-sekolah-mencatat-kas-masuk-keluar',
      'apa-itu-aplikasi-administrasi-sekolah',
    ],
    sections: [
      {
        heading: 'Kenapa keuangan sekolah swasta perlu aplikasi khusus',
        paragraphs: [
          'Keuangan sekolah swasta punya karakter yang berbeda dari toko atau kantor biasa: sumber pemasukan utama adalah SPP yang bersifat periodik dan per siswa, sedangkan pengeluaran mencakup gaji, operasional, dan kegiatan. Aplikasi keuangan sekolah membantu mencatat keduanya dengan kategori yang konsisten dan rekap yang bisa dibaca pemangku kepentingan.',
        ],
      },
      {
        heading: 'Fitur yang sebaiknya dicari',
        list: [
          'Pencatatan kas masuk dan keluar dengan kategori yang bisa disesuaikan.',
          'Riwayat transaksi dengan saldo berjalan agar bisa diaudit.',
          'Rekap bulanan pemasukan, pengeluaran, dan saldo akhir.',
          'Ekspor data (Excel/CSV) untuk kebutuhan pelaporan.',
          'Integrasi yang wajar dengan pencatatan SPP agar tidak dicatat dobel.',
        ],
      },
      {
        heading: 'Fitur yang belum tentu dibutuhkan di awal',
        list: [
          'Neraca, laba rugi formal, dan laporan standar akuntansi — umumnya baru diperlukan saat sekolah memiliki kewajiban pelaporan lebih besar.',
          'Integrasi rekening bank otomatis — praktis, tetapi tidak semua sekolah siap prosesnya.',
          'Payroll dan inventaris — tambahkan setelah kebutuhan kas dan SPP stabil.',
        ],
      },
      {
        heading: 'Cara mengevaluasi aplikasi sebelum memilih',
        steps: [
          'Buat daftar kebutuhan nyata: catat 3-5 masalah keuangan yang paling sering terjadi.',
          'Coba demo dengan data sekolah Anda sendiri, bukan data contoh.',
          'Uji dari HP karena bendahara sering bekerja di luar meja.',
          'Tanyakan proses cadangan data dan siapa yang bisa mengakses data.',
          'Mulai dari paket paling sederhana, lalu naik saat kebutuhan bertambah.',
        ],
      },
    ],
    faq: [
      {
        q: 'Berapa biaya aplikasi keuangan sekolah?',
        a: 'Bervariasi. Ada yang gratis dengan fitur dasar, ada yang berlangganan tahunan mulai ratusan ribu rupiah untuk sekolah. Bandingkan fitur yang benar-benar dipakai dengan biayanya.',
      },
      {
        q: 'Apakah aplikasi bisa menggantikan bendahara?',
        a: 'Tidak. Aplikasi adalah alat bantu pencatatan dan rekap; bendahara tetap yang memasukkan data dan bertanggung jawab atas kebenarannya. Aplikasi membuat pekerjaan bendahara lebih cepat dan rapi.',
      },
    ],
  },
  {
    slug: 'aplikasi-pembayaran-spp-sekolah',
    title: 'Aplikasi Pembayaran SPP Sekolah',
    description:
      'Aplikasi pembayaran SPP membantu mencatat pembayaran per siswa per bulan, merekap tunggakan, dan memastikan uang yang masuk tercatat di kas sekolah.',
    category: 'spp',
    date: '2026-08-03',
    readMinutes: 5,
    author: 'Tim SekolahRapi',
    pillarHref: '/fitur/pembayaran-spp',
    relatedSlugs: [
      'contoh-format-pembayaran-spp-siswa',
      'template-rekap-tunggakan-spp',
      'cara-bendahara-sekolah-mencatat-kas-masuk-keluar',
    ],
    sections: [
      {
        heading: 'Apa itu aplikasi pembayaran SPP',
        paragraphs: [
          'Aplikasi pembayaran SPP adalah alat untuk mencatat pembayaran SPP siswa secara digital — siapa yang sudah bayar, bulan apa saja, berapa nominalnya, dan siapa yang masih menunggak — sehingga tidak perlu menghitung manual di buku atau spreadsheet.',
        ],
      },
      {
        heading: 'Masalah umum pencatatan SPP manual',
        list: [
          'Status pembayaran tersebar di buku, chat, dan catatan kecil.',
          'Rekap tunggakan baru dibuat saat diminta, bukan rutin.',
          'Nominal yang dibayar sebagian sulit dilacak sisanya.',
          'Pembayaran yang masuk tidak otomatis tercatat di kas sekolah.',
        ],
      },
      {
        heading: 'Fitur yang membantu bendahara SPP',
        list: [
          'Catat pembayaran per siswa per bulan dengan status lunas, sebagian, atau belum.',
          'Rekap tunggakan otomatis per siswa dan per bulan.',
          'Pembayaran SPP yang lunas otomatis tercatat sebagai pemasukan kas.',
          'Riwayat pembayaran yang bisa ditunjukkan ke orang tua.',
        ],
      },
      {
        heading: 'Tips memilih aplikasi SPP',
        list: [
          'Pastikan pembayaran SPP terhubung dengan pencatatan kas, agar tidak dicatat dua kali.',
          'Cek bisa tidaknya mencatat pembayaran sebagian (angsuran).',
          'Uji proses dari HP, karena sering dipakai saat menerima pembayaran.',
          'Tanyakan format ekspor untuk kebutuhan pelaporan.',
        ],
      },
    ],
    faq: [
      {
        q: 'Apakah aplikasi bisa menerima pembayaran online dari orang tua?',
        a: 'Ada aplikasi yang menyediakan channel pembayaran, tetapi itu fitur yang berbeda dari sekadar pencatatan. Untuk memulai, pencatatan digital sudah jauh lebih rapi daripada buku manual. Tanyakan ke penyedia apakah channel pembayaran tersedia dan berapa biayanya.',
      },
      {
        q: 'Bagaimana jika orang tua membayar tunai?',
        a: 'Tetap dicatat manual di aplikasi: pilih siswa, bulan, dan nominal, lalu status berubah lunas. Aplikasi tidak mengharuskan semua pembayaran lewat transfer.',
      },
    ],
  },
  {
    slug: 'format-administrasi-sekolah',
    title: 'Format Administrasi Sekolah yang Umum Dipakai',
    description:
      'Daftar format administrasi sekolah yang umum dipakai: buku induk siswa, buku kas, rekap SPP, absensi, dan inventaris — beserta kolom-kolom dasarnya.',
    category: 'administrasi',
    date: '2026-08-03',
    readMinutes: 6,
    author: 'Tim SekolahRapi',
    pillarHref: '/solusi/sekolah-swasta',
    relatedSlugs: [
      'administrasi-sekolah-swasta-yang-perlu-dirapikan',
      'contoh-format-pembayaran-spp-siswa',
      'cara-merapikan-data-administrasi-sekolah',
    ],
    sections: [
      {
        heading: 'Format buku induk siswa',
        paragraphs: [
          'Buku induk adalah dokumen inti data siswa. Formatnya mencatat identitas dan riwayat siswa sejak masuk sampai keluar.',
        ],
        list: [
          'Nomor induk, nama lengkap, tempat tanggal lahir, jenis kelamin.',
          'Alamat, nama orang tua/wali, pekerjaan, dan nomor HP.',
          'Tahun masuk, asal sekolah, dan riwayat mutasi.',
        ],
      },
      {
        heading: 'Format buku kas sekolah',
        paragraphs: [
          'Buku kas mencatat seluruh uang masuk dan keluar secara kronologis.',
        ],
        list: [
          'Tanggal, nomor urut, keterangan, pemasukan, pengeluaran, dan saldo.',
          'Sumber pemasukan (misal SPP an. nama siswa) dan keperluan pengeluaran.',
          'Referensi bukti: nomor kwitansi atau nota.',
        ],
      },
      {
        heading: 'Format rekap SPP dan tunggakan',
        paragraphs: [
          'Rekap SPP biasanya disusun per bulan dengan satu baris per siswa.',
        ],
        list: [
          'Nama siswa, kelas, bulan yang dibayar, nominal, dan status.',
          'Total terkumpul per bulan dan daftar tunggakan per siswa.',
        ],
      },
      {
        heading: 'Format absensi dan inventaris',
        list: [
          'Absensi: daftar hadir harian per kelas dengan keterangan hadir/izin/sakit/tanpa keterangan.',
          'Inventaris: nama barang, jumlah, kondisi, lokasi, penanggung jawab, dan tahun pengadaan.',
        ],
      },
      {
        heading: 'Format bisa disederhanakan',
        paragraphs: [
          'Format tidak harus sempurna — yang penting konsisten dan selalu diperbarui. Banyak sekolah memakai spreadsheet atau aplikasi administrasi seperti SekolahRapi untuk menegakkan format yang sama tanpa harus menggambar tabel manual.',
        ],
      },
    ],
    faq: [
      {
        q: 'Apakah ada format baku dari pemerintah untuk administrasi sekolah?',
        a: 'Ada pedoman tertentu yang berlaku di lingkungan sekolah sesuai jenjangnya. Untuk kebutuhan operasional harian, format sederhana di atas sudah memadai; ketentuan resmi bisa disesuaikan kemudian.',
      },
      {
        q: 'Bolehkah mengganti format lama dengan yang baru?',
        a: 'Boleh, selama data lama tetap tersimpan dan format baru lebih mudah dipakai. Konsistensi ke depan lebih penting daripada mempertahankan format yang tidak praktis.',
      },
    ],
  },
  {
    slug: 'cara-merapikan-data-administrasi-sekolah',
    title: 'Cara Merapikan Data Administrasi Sekolah',
    description:
      'Langkah merapikan data administrasi sekolah: inventarisasi dokumen, satu pintu data, standarisasi format, dan jadwal pemeliharaan rutin.',
    category: 'administrasi',
    date: '2026-08-03',
    readMinutes: 6,
    author: 'Tim SekolahRapi',
    pillarHref: '/solusi/sekolah-swasta',
    relatedSlugs: [
      'administrasi-sekolah-swasta-yang-perlu-dirapikan',
      'format-administrasi-sekolah',
      'cara-membuat-laporan-keuangan-sekolah-sederhana',
    ],
    sections: [
      {
        heading: 'Mulai dari inventarisasi dokumen',
        paragraphs: [
          'Sebelum merapikan, ketahui dulu apa saja yang ada: buku induk, arsip kwitansi, rekap SPP, absensi, dan file digital yang tersebar. Buat daftar dan tandai mana yang masih dipakai aktif, mana yang arsip, dan mana yang sudah tidak perlu.',
        ],
      },
      {
        heading: 'Terapkan satu pintu data',
        paragraphs: [
          'Masalah terbesar administrasi bukan pada format, melainkan data yang masuk lewat banyak pintu: chat, kertas, spreadsheet pribadi, dan ingatan. Tetapkan satu tempat sebagai sumber utama setiap jenis data.',
        ],
        list: [
          'Data siswa: satu daftar induk yang diperbarui terpusat.',
          'Pembayaran SPP: satu tempat pencatatan per transaksi.',
          'Kas: satu buku kas yang menampung semua transaksi.',
          'Dokumen: satu folder/laci untuk arsip penting.',
        ],
      },
      {
        heading: 'Standarisasi format dan penamaan',
        steps: [
          'Tetapkan format kolom yang sama untuk setiap jenis data.',
          'Atur penamaan file digital: [tahun]-[jenis]-[nama], misalnya 2026-SPP-Desember.xlsx.',
          'Beri nomor urut pada kwitansi dan arsip fisik.',
          'Tentukan siapa yang boleh mengubah data dan siapa yang mengecek.',
        ],
      },
      {
        heading: 'Jadwalkan pemeliharaan rutin',
        list: [
          'Harian: catat transaksi kas dan pembayaran SPP.',
          'Bulanan: tutup rekap, cocokkan saldo, perbarui tunggakan.',
          'Tahunan: rapiakan arsip tahun ajaran lama dan perbarui daftar induk.',
        ],
      },
      {
        heading: 'Kapan beralih ke aplikasi',
        paragraphs: [
          'Ketika spreadsheet mulai penuh dan rekap memakan waktu berjam-jam, aplikasi administrasi seperti SekolahRapi membantu menegakkan satu pintu data dan format yang konsisten secara otomatis.',
        ],
      },
    ],
    faq: [
      {
        q: 'Berapa lama waktu yang dibutuhkan untuk merapikan data?',
        a: 'Tergantung kondisi awal. Mulai dari data keuangan dan SPP (paling sering ditanya), biasanya beberapa hari sampai beberapa minggu sambil tetap menjalankan operasional harian.',
      },
      {
        q: 'Haruskah semua dokumen didigitalkan?',
        a: 'Tidak harus semuanya sekaligus. Prioritaskan dokumen yang sering diakses (data siswa, rekap keuangan), lalu lanjutkan ke arsip lain bertahap.',
      },
    ],
  },
  {
    slug: 'software-manajemen-madrasah',
    title: 'Software Manajemen Madrasah: Pilih yang Sesuai Kebutuhan',
    description:
      'Panduan memilih software manajemen madrasah: data santri/siswa, iuran dan SPP, kas, sampai laporan — dengan catatan penting soal integrasi khusus.',
    category: 'administrasi',
    date: '2026-08-03',
    readMinutes: 6,
    author: 'Tim SekolahRapi',
    pillarHref: '/solusi/madrasah',
    relatedSlugs: [
      'administrasi-sekolah-swasta-yang-perlu-dirapikan',
      'aplikasi-pembayaran-spp-sekolah',
      'cara-bendahara-sekolah-mencatat-kas-masuk-keluar',
    ],
    sections: [
      {
        heading: 'Kebutuhan administrasi madrasah',
        paragraphs: [
          'Madrasah menghadapi kebutuhan administrasi yang mirip sekolah umum: mencatat data santri/siswa, iuran dan SPP, kas, serta laporan rutin. Perbedaannya ada pada istilah dan kebiasaan operasional, misalnya penggunaan istilah santri dan jadwal kegiatan keagamaan — pastikan aplikasi yang dipilih tetap bisa menyesuaikan.',
        ],
      },
      {
        heading: 'Fitur dasar yang dibutuhkan madrasah',
        list: [
          'Data santri/siswa: profil, kelas/rombel, dan mutasi.',
          'Pencatatan SPP/iuran per siswa per bulan dengan rekap tunggakan.',
          'Kas masuk dan keluar dengan riwayat yang bisa ditelusuri.',
          'Laporan bulanan untuk pengurus yayasan atau pembina.',
        ],
      },
      {
        heading: 'Catatan penting soal integrasi khusus',
        paragraphs: [
          'Beberapa madrasah membutuhkan pelaporan ke lembaga terkait. Saat ini banyak aplikasi administrasi umum (termasuk SekolahRapi) belum menyediakan integrasi khusus ke sistem lembaga. Tanyakan hal ini secara eksplisit sebelum memilih, dan jangan berasumsi semua aplikasi "untuk madrasah" sudah tersambung otomatis.',
        ],
      },
      {
        heading: 'Langkah memilih software madrasah',
        steps: [
          'Tulis kebutuhan nyata: data apa yang paling sering dicari dan dilaporkan.',
          'Tanyakan dukungan integrasi ke lembaga bila itu kewajiban operasional Anda.',
          'Uji demo dengan data madrasah Anda sendiri.',
          'Pastikan bisa diakses dari HP oleh bendahara.',
          'Hitung biaya tahunan dan bandingkan dengan manfaatnya.',
        ],
      },
    ],
    faq: [
      {
        q: 'Apakah software madrasah harus punya fitur khusus keagamaan?',
        a: 'Tergantung kebutuhan. Sebagian madrasah cukup dengan pencatatan administrasi umum, sebagian lagi menginginkan kolom khusus seperti status hafalan atau kegiatan. Pastikan aplikasi mengizinkan penyesuaian sederhana.',
      },
      {
        q: 'Bagaimana dengan pelaporan ke lembaga?',
        a: 'Konfirmasi langsung ke penyedia apakah ada integrasi khusus. Jika tidak ada, Anda tetap bisa menyusun laporan dari data yang diekspor dari aplikasi.',
      },
    ],
  },
  {
    slug: 'berapa-biaya-aplikasi-administrasi-sekolah',
    title: 'Berapa Biaya Aplikasi Administrasi Sekolah?',
    description:
      'Kisaran biaya aplikasi administrasi sekolah: gratis, langganan tahunan, hingga paket lengkap — plus cara menghitung nilai yang sepadan untuk sekolah.',
    category: 'administrasi',
    date: '2026-08-03',
    readMinutes: 5,
    author: 'Tim SekolahRapi',
    pillarHref: '/fitur/keuangan-sekolah',
    relatedSlugs: [
      'apa-itu-aplikasi-administrasi-sekolah',
      'aplikasi-keuangan-sekolah-swasta',
      'administrasi-sekolah-swasta-yang-perlu-dirapikan',
    ],
    sections: [
      {
        heading: 'Jawaban singkat',
        paragraphs: [
          'Biaya aplikasi administrasi sekolah di Indonesia bervariasi dari Rp 0 (gratis dengan fitur dasar) sampai jutaan rupiah per tahun untuk paket lengkap. Sebagai gambaran, SekolahRapi menawarkan paket Gratis, Basic Rp 490.000/tahun, dan Pro Rp 990.000/tahun. Yang menentukan nilai bukan harga, tetapi fitur yang benar-benar dipakai sekolah.',
        ],
      },
      {
        heading: 'Pola harga yang umum',
        list: [
          'Gratis: fitur dasar seperti data siswa dan pencatatan kas sederhana, sering dengan batasan kategori atau jumlah data.',
          'Langganan tahunan: ratusan ribu rupiah, mencakup laporan, ekspor/import Excel, dan kategori tanpa batas.',
          'Paket lengkap: mendekati satu juta rupiah per tahun, menambahkan fitur seperti pendaftaran online, payroll, dan inventaris.',
          'Biaya tambahan: setup, pelatihan, atau channel pembayaran online bila tersedia.',
        ],
      },
      {
        heading: 'Cara menghitung nilai sepadan',
        paragraphs: [
          'Bandingkan biaya dengan waktu yang dihemat. Jika rekap SPP dan laporan bulanan memakan 5-10 jam kerja staf, aplikasi yang menghemat waktu itu bisa bernilai jauh di atas biaya langganannya.',
        ],
        steps: [
          'Hitung jam kerja bulanan untuk rekap manual.',
          'Bandingkan dengan biaya aplikasi per bulan (bagi harga tahunan dengan 12).',
          'Tambahkan nilai akurasi: data yang tidak salah hitung.',
          'Cek biaya tersembunyi: pelatihan, penyimpanan tambahan, atau batas jumlah siswa.',
        ],
      },
      {
        heading: 'Mulai dari yang paling sederhana',
        paragraphs: [
          'Banyak sekolah memulai dari paket gratis untuk menguji alur, lalu naik ke paket berbayar saat data dan kebutuhan bertambah. Pastikan data Anda bisa dibawa naik tanpa perlu input ulang.',
        ],
      },
    ],
    faq: [
      {
        q: 'Apakah aplikasi gratis bisa diandalkan?',
        a: 'Bisa untuk mencoba dan untuk sekolah dengan kebutuhan dasar. Perhatikan batasan kategori, jumlah data, dan apakah data Anda dipisahkan dengan aman dari sekolah lain.',
      },
      {
        q: 'Harga murah berarti fitur kurang?',
        a: 'Tidak selalu. Bandingkan daftar fitur dan batasannya. Yang penting bukan harganya, melainkan apakah aplikasi menyelesaikan masalah nyata sekolah Anda.',
      },
    ],
  },
];

export function getArticle(slug: string): PanduanArticle | undefined {
  return PANDUAN_ARTICLES.find((article) => article.slug === slug);
}
