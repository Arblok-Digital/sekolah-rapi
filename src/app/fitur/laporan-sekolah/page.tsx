import type { Metadata } from 'next';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  Receipt,
  FileSpreadsheet,
  Check,
} from 'lucide-react';
import MarketingLayout from '@/shared/components/marketing/MarketingLayout';
import { Breadcrumb } from '@/shared/components/marketing/Breadcrumb';
import { CtaSection } from '@/shared/components/marketing/CtaSection';
import { RelatedLinks } from '@/shared/components/marketing/RelatedLinks';
import { APP_URL } from '@/shared/constants';

const description =
  'Lihat rekap keuangan bulanan (pemasukan, pengeluaran, net) dan rekap SPP dalam satu laporan, lalu ekspor sebagai CSV. Laporan operasional dari data yang tercatat di SekolahRapi.';

export const metadata: Metadata = {
  title: 'Laporan Sekolah',
  description,
  alternates: { canonical: '/fitur/laporan-sekolah' },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: `${APP_URL}/fitur/laporan-sekolah`,
    title: 'Laporan Sekolah | SekolahRapi',
    description,
  },
};

const sections = [
  {
    icon: BarChart3,
    title: 'Rekap keuangan bulanan',
    description:
      'Rekap pemasukan, pengeluaran, dan selisih (net) setiap bulan dalam satu tampilan.',
    points: [
      'Total pemasukan dan total pengeluaran dirangkum otomatis dari transaksi yang tercatat.',
      'Selisih net per bulan membantu melihat arah keuangan sekolah secara ringkas.',
      'Data disusun berdasarkan tahun, sehingga tren bulanan mudah dibandingkan.',
    ],
  },
  {
    icon: Receipt,
    title: 'Rekap SPP',
    description:
      'Rekap pembayaran SPP per bulan yang mencakup jumlah siswa, status pembayaran, dan nominal terkumpul.',
    points: [
      'Tampilkan jumlah siswa, berapa yang sudah lunas, dan nominal yang terkumpul.',
      'Persentase terkumpul membantu melihat tingkat pembayaran setiap bulan.',
      'Rekap ini disusun dari catatan SPP yang sama dengan modul pembayaran.',
    ],
  },
  {
    icon: FileSpreadsheet,
    title: 'Ekspor CSV',
    description:
      'Laporan dan riwayat data dapat diekspor ke file CSV untuk kebutuhan rekap di luar sistem.',
    points: [
      'Rekap keuangan bulanan dapat diekspor sebagai CSV.',
      'Rekap SPP dapat diekspor sebagai CSV.',
      'Riwayat kas lengkap dengan saldo berjalan juga tersedia dalam ekspor CSV.',
      'File CSV dapat dibuka dengan aplikasi spreadsheet seperti Excel.',
    ],
  },
] as const;

const faqs = [
  {
    question: 'Laporan apa saja yang tersedia di SekolahRapi?',
    answer:
      'Saat ini tersedia rekap keuangan bulanan (pemasukan, pengeluaran, net) dan rekap SPP, yang keduanya bisa diekspor sebagai CSV. Keduanya adalah laporan operasional dari data yang tercatat di sistem.',
  },
  {
    question: 'Apakah laporan dihitung otomatis?',
    answer:
      'Ya. Rekap keuangan dihitung dari transaksi kas yang tercatat, dan rekap SPP dihitung dari pembayaran SPP per siswa per bulan. Selama pencatatan rutin dilakukan, laporan ikut terbarui.',
  },
  {
    question: 'Apakah ini laporan keuangan formal seperti neraca atau laba rugi?',
    answer:
      'Bukan. Laporan SekolahRapi adalah rekap operasional dari data yang dicatat di sistem, bukan laporan keuangan formal yang disusun sesuai standar akuntansi seperti neraca, laba rugi, atau arus kas, dan bukan laporan audit.',
  },
  {
    question: 'Bagaimana cara mengekspor laporan?',
    answer:
      'Dari halaman laporan, pilih jenis laporan (keuangan atau rekap SPP) lalu gunakan tombol ekspor untuk mengunduh file CSV.',
  },
] as const;

const relatedLinks = [
  {
    href: '/fitur/keuangan-sekolah',
    label: 'Keuangan Sekolah',
    description:
      'Pencatatan kas masuk dan keluar, riwayat dengan saldo berjalan, dan rekap bulanan.',
  },
  {
    href: '/panduan/cara-membuat-laporan-keuangan-sekolah-sederhana',
    label: 'Cara membuat laporan keuangan sekolah sederhana',
    description:
      'Panduan menyusun rekap keuangan sekolah yang mudah dipahami owner dan yayasan.',
  },
  {
    href: '/pricing',
    label: 'Harga dan Paket',
    description: 'Lihat paket Gratis, Basic, dan Pro SekolahRapi.',
  },
] as const;

export default function LaporanSekolahPage() {
  return (
    <MarketingLayout>
      <Breadcrumb
        items={[
          { label: 'Fitur', href: '/fitur' },
          { label: 'Laporan Sekolah' },
        ]}
      />

      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-12 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            Laporan Sekolah
          </h1>
          <p className="text-lg leading-relaxed text-white/70">
            Owner dan yayasan tidak perlu lagi menunggu rekap yang disusun
            manual dari catatan terpencar. SekolahRapi merangkum pemasukan,
            pengeluaran, dan pembayaran SPP menjadi laporan operasional yang
            bisa diekspor kapan saja.
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

        <div className="rounded-xl border border-white/10 bg-white/[.06] p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#3a1fb8] shadow-lg shadow-[#7c5cff]/20">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                Perlu diingat tentang ruang lingkup laporan
              </h2>
              <p className="mt-2 leading-relaxed text-white/70">
                Laporan SekolahRapi adalah rekap operasional dari data yang
                tercatat di sistem, bukan laporan keuangan formal sesuai standar
                akuntansi (neraca, laba rugi, arus kas), dan bukan laporan
                audit. Untuk kebutuhan laporan formal, hasil rekap ini bisa
                dijadikan bahan dasar yang disusun kembali oleh pihak yang
                berwenang.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold">Pertanyaan tentang laporan sekolah</h2>
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
          Laporan tersusun rapi jika pencatatan kas dilakukan secara konsisten.
          Baca{' '}
          <Link
            href="/fitur/keuangan-sekolah"
            className="text-[#7c5cff] hover:text-white"
          >
            cara SekolahRapi membantu pencatatan kas masuk dan keluar
          </Link>
          .
        </p>
      </section>

      <RelatedLinks links={[...relatedLinks]} />

      <CtaSection
        title="Dapatkan rekap sekolah tanpa menunggu"
        description="Coba SekolahRapi gratis, atau lihat paket mana yang cocok dengan kebutuhan administrasi sekolah Anda."
      />
    </MarketingLayout>
  );
}
