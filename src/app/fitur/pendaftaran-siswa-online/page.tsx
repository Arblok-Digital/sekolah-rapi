import type { Metadata } from 'next';
import Link from 'next/link';
import { Send, Eye, UserCheck, Check } from 'lucide-react';
import MarketingLayout from '@/shared/components/marketing/MarketingLayout';
import { Breadcrumb } from '@/shared/components/marketing/Breadcrumb';
import { CtaSection } from '@/shared/components/marketing/CtaSection';
import { RelatedLinks } from '@/shared/components/marketing/RelatedLinks';
import { APP_URL } from '@/shared/constants';

const description =
  'Terima data calon siswa lewat formulir pendaftaran online yang bisa dibagikan, review calon siswa di satu tempat, lalu konfirmasi agar masuk ke daftar siswa.';

export const metadata: Metadata = {
  title: 'Pendaftaran Siswa Online',
  description,
  alternates: { canonical: '/fitur/pendaftaran-siswa-online' },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: `${APP_URL}/fitur/pendaftaran-siswa-online`,
    title: 'Pendaftaran Siswa Online | SekolahRapi',
    description,
  },
};

const sections = [
  {
    icon: Send,
    title: 'Formulir pendaftaran publik yang bisa dibagikan',
    description:
      'Sekolah mendapatkan tautan formulir pendaftaran yang bisa dibagikan kepada orang tua lewat WhatsApp, chat, atau media sosial.',
    points: [
      'Calon siswa atau orang tua mengisi data melalui formulir, tidak perlu datang hanya untuk menyerahkan data awal.',
      'Data yang diisi meliputi data siswa dan data orang tua: nama, kelas tujuan, alamat, tanggal lahir, hingga kontak orang tua.',
      'Tautan formulir cukup dibagikan sekali; setiap pengiriman menjadi satu pendaftar yang tercatat.',
      'Data pendaftar langsung tersimpan di sistem, tidak tersebar di chat atau kertas.',
    ],
  },
  {
    icon: Eye,
    title: 'Data calon siswa tampil untuk direview sekolah',
    description:
      'Setiap pendaftar muncul di daftar calon siswa sehingga sekolah dapat meninjau satu per satu.',
    points: [
      'Daftar calon siswa menampilkan status setiap pendaftar, misalnya menunggu konfirmasi.',
      'Sekolah melihat data lengkap calon siswa di satu tempat.',
      'Proses ini menampung input data saja; berkas fisik seperti ijazah atau akta tetap diurus sekolah sesuai alurnya masing-masing.',
    ],
  },
  {
    icon: UserCheck,
    title: 'Disetujui, lalu data pindah ke daftar siswa',
    description:
      'Setelah direview, sekolah mengonfirmasi calon siswa yang diterima.',
    points: [
      'Pendaftar yang disetujui masuk ke daftar siswa aktif sekolah.',
      'Data yang sudah diisi tidak perlu diketik ulang saat pindah ke daftar siswa.',
      'Pendaftar yang tidak lolos dapat ditandai, dan seluruh status terlihat jelas di riwayat pendaftaran.',
    ],
  },
] as const;

const faqs = [
  {
    question: 'Apakah pendaftar bisa mengunggah dokumen di formulir?',
    answer:
      'Formulir pendaftaran menampung input data siswa dan orang tua. Unggah atau verifikasi dokumen tidak termasuk alur ini; berkas fisik tetap diurus sekolah sesuai kebijakan masing-masing.',
  },
  {
    question: 'Apakah data pendaftar langsung masuk ke daftar siswa?',
    answer:
      'Tidak. Data masuk ke daftar calon siswa terlebih dahulu. Sekolah meninjau dan mengonfirmasi, baru kemudian pendaftar yang disetujui masuk ke daftar siswa.',
  },
  {
    question: 'Bagaimana cara membagikan formulir pendaftaran?',
    answer:
      'Sekolah mendapatkan tautan formulir yang bisa dibagikan melalui WhatsApp, chat orang tua, atau media sosial. Setiap orang yang membuka tautan bisa mengirimkan data pendaftaran.',
  },
  {
    question: 'Apakah pendaftaran siswa online tersedia di semua paket?',
    answer:
      'Pendaftaran siswa online termasuk nilai utama paket Pro karena melibatkan formulir publik, review, dan sinkronisasi data. Lihat halaman harga untuk rincian paket.',
  },
] as const;

const relatedLinks = [
  {
    href: '/fitur/laporan-sekolah',
    label: 'Laporan Sekolah',
    description:
      'Rekap keuangan bulanan dan rekap SPP untuk memantau operasional sekolah.',
  },
  {
    href: '/panduan/cara-mengelola-pendaftaran-siswa-baru-online',
    label: 'Cara mengelola pendaftaran siswa baru online',
    description:
      'Panduan alur penerimaan siswa baru: dari formulir hingga konfirmasi.',
  },
  {
    href: '/pricing',
    label: 'Harga dan Paket',
    description: 'Lihat paket Gratis, Basic, dan Pro SekolahRapi.',
  },
] as const;

export default function PendaftaranSiswaOnlinePage() {
  return (
    <MarketingLayout>
      <Breadcrumb
        items={[
          { label: 'Fitur', href: '/fitur' },
          { label: 'Pendaftaran Siswa Online' },
        ]}
      />

      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-12 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            Pendaftaran Siswa Online
          </h1>
          <p className="text-lg leading-relaxed text-white/70">
            Pendaftar yang masuk lewat chat, kertas, dan file berbeda mudah
            tercecer. SekolahRapi menyediakan formulir pendaftaran online yang
            bisa dibagikan, menampung data calon siswa, dan memindahkan
            pendaftar yang disetujui ke daftar siswa tanpa diketik ulang.
          </p>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl space-y-8 px-4 pb-20 sm:px-6 lg:px-8">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div
              key={section.title}
              className="rounded-xl border border-white/10 bg-white/[.06] p-8"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#3a1fb8] shadow-lg shadow-[#7c5cff]/20">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{section.title}</h2>
                  <p className="mt-2 leading-relaxed text-white/70">
                    {section.description}
                  </p>
                </div>
              </div>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {section.points.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#7c5cff]" />
                    <span className="text-sm leading-relaxed text-white/80">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      <section className="relative z-10 mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold">
          Pertanyaan tentang pendaftaran online
        </h2>
        <div className="mt-6 space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-2xl border border-white/5 bg-[#12102b]"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-4 font-medium">
                {faq.question}
                <span className="text-white/40 transition-transform group-open:rotate-180">
                  ▼
                </span>
              </summary>
              <p className="px-6 pb-4 text-sm leading-relaxed text-white/70">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
        <p className="mt-6 text-sm leading-relaxed text-white/60">
          Setelah pendaftar masuk ke daftar siswa, pencatatan SPP dan kas dapat
          langsung berjalan. Lihat{' '}
          <Link
            href="/fitur/pembayaran-spp"
            className="text-[#7c5cff] hover:text-white"
          >
            cara SekolahRapi menangani pembayaran SPP
          </Link>
          .
        </p>
      </section>

      <RelatedLinks links={[...relatedLinks]} />

      <CtaSection
        title="Jangan biarkan pendaftar tercecer"
        description="Coba SekolahRapi gratis, atau lihat paket mana yang cocok dengan kebutuhan administrasi sekolah Anda."
      />
    </MarketingLayout>
  );
}
