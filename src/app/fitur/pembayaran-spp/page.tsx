import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Receipt,
  CalendarCheck,
  CircleDollarSign,
  ListChecks,
  Check,
} from 'lucide-react';
import MarketingLayout from '@/shared/components/marketing/MarketingLayout';
import { Breadcrumb } from '@/shared/components/marketing/Breadcrumb';
import { CtaSection } from '@/shared/components/marketing/CtaSection';
import { RelatedLinks } from '@/shared/components/marketing/RelatedLinks';
import { APP_URL } from '@/shared/constants';

const description =
  'Catat pembayaran SPP per siswa per bulan dengan status lunas, angsuran, atau belum. Pantau rekap tunggakan dan biarkan pembayaran masuk ke pencatatan kas otomatis.';

export const metadata: Metadata = {
  title: 'Pembayaran SPP',
  description,
  alternates: { canonical: '/fitur/pembayaran-spp' },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: `${APP_URL}/fitur/pembayaran-spp`,
    title: 'Pembayaran SPP | SekolahRapi',
    description,
  },
};

const sections = [
  {
    icon: CalendarCheck,
    title: 'Pencatatan SPP per siswa per bulan',
    description:
      'Pembayaran SPP dicatat per siswa, per bulan, dan per tahun, sehingga tidak ada siswa yang terlewat.',
    points: [
      'Pilih siswa dan periode bulan/tahun, lalu isi nominal yang dibayarkan.',
      'Catat tanggal pembayaran, metode, dan nomor kwitansi jika diperlukan.',
      'Data siswa dan SPP saling terhubung, jadi rekap tidak perlu disusun ulang.',
      'Import data awal dari Excel membantu memulai tanpa mengetik satu per satu.',
    ],
  },
  {
    icon: CircleDollarSign,
    title: 'Status lunas, angsuran, atau belum',
    description:
      'Setiap tagihan bulanan memiliki status yang jelas sehingga mudah dikenali.',
    points: [
      'Lunas: pembayaran sesuai nominal tagihan.',
      'Angsuran: sebagian sudah dibayar dan sisanya menyusul.',
      'Belum: belum ada pembayaran untuk bulan tersebut.',
      'Status diperbarui otomatis sesuai nominal yang dicatat.',
    ],
  },
  {
    icon: ListChecks,
    title: 'Rekap tunggakan',
    description:
      'Lihat siapa saja yang belum melunasi SPP pada bulan tertentu tanpa harus membuka satu per satu.',
    points: [
      'Filter tunggakan berdasarkan bulan dan tahun.',
      'Tampilkan siswa yang berstatus belum atau angsuran pada periode tersebut.',
      'Ringkasan per bulan menampilkan jumlah siswa, yang lunas, nominal terkumpul, dan persentase.',
      'Rekap SPP bisa diekspor sebagai CSV dari halaman laporan.',
    ],
  },
  {
    icon: Receipt,
    title: 'Otomatis masuk ke kas',
    description:
      'Pembayaran SPP dan pencatatan kas sekolah tidak berjalan terpisah.',
    points: [
      'Saat SPP dicatat lunas, transaksi pemasukan kas dengan kategori SPP dibuat otomatis.',
      'Bendahara tidak perlu mencatat ulang pembayaran ke buku kas.',
      'Riwayat kas dan laporan keuangan ikut menggunakan data yang sama.',
      'Jika pembayaran SPP dihapus setelah lunas, sistem membuat transaksi koreksi agar saldo kas tetap benar.',
    ],
  },
] as const;

const faqs = [
  {
    question: 'Apa itu status angsuran pada SPP?',
    answer:
      'Angsuran berarti siswa sudah membayar sebagian dari nominal SPP bulan tersebut, dan sisanya akan dibayar kemudian. Status berubah menjadi lunas ketika total pembayaran mencapai nominal tagihan.',
  },
  {
    question: 'Apakah pembayaran SPP otomatis tercatat di kas sekolah?',
    answer:
      'Ya. Pembayaran yang dicatat lunas otomatis membuat transaksi pemasukan kas dengan kategori SPP, jadi tidak perlu dicatat dua kali.',
  },
  {
    question: 'Bagaimana cara melihat siswa yang belum membayar SPP?',
    answer:
      'Buka rekap tunggakan pada bulan dan tahun tertentu. Sistem menampilkan siswa yang berstatus belum atau angsuran pada periode tersebut.',
  },
  {
    question: 'Apakah rekap SPP bisa diekspor?',
    answer:
      'Bisa. Rekap SPP tersedia di halaman laporan dan dapat diekspor ke file CSV, lengkap dengan bulan, jumlah siswa, yang lunas, nominal terkumpul, dan persentase.',
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
    href: '/panduan/contoh-format-pembayaran-spp-siswa',
    label: 'Contoh format pembayaran SPP siswa',
    description:
      'Referensi format pencatatan SPP yang rapi untuk sekolah swasta dan madrasah.',
  },
  {
    href: '/panduan/template-rekap-tunggakan-spp',
    label: 'Template rekap tunggakan SPP',
    description:
      'Panduan menyusun rekap tunggakan SPP per siswa dan per bulan.',
  },
  {
    href: '/pricing',
    label: 'Harga dan Paket',
    description: 'Lihat paket Gratis, Basic, dan Pro SekolahRapi.',
  },
] as const;

export default function PembayaranSppPage() {
  return (
    <MarketingLayout>
      <Breadcrumb
        items={[
          { label: 'Fitur', href: '/fitur' },
          { label: 'Pembayaran SPP' },
        ]}
      />

      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-12 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            Pembayaran SPP
          </h1>
          <p className="text-lg leading-relaxed text-[#59645d]">
            Ketika pencatatan SPP masih memakai buku dan file yang terpisah,
            sulit mengetahui siapa yang belum membayar. SekolahRapi mencatat
            pembayaran SPP per siswa per bulan, menandai status lunas,
            angsuran, atau belum, dan merangkum tunggakan dalam satu tampilan.
          </p>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl space-y-8 px-4 pb-20 sm:px-6 lg:px-8">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div
              key={section.title}
              className="rounded-xl border border-[#173f35]/10 bg-white/70 p-8"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#173f35] to-[#26735d] shadow-lg shadow-[#173f35]/15">
                  <Icon className="h-6 w-6 text-[#17211b]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{section.title}</h2>
                  <p className="mt-2 leading-relaxed text-[#59645d]">
                    {section.description}
                  </p>
                </div>
              </div>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {section.points.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#26735d]" />
                    <span className="text-sm leading-relaxed text-[#526158]">
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
        <h2 className="text-xl font-bold">Pertanyaan tentang SPP</h2>
        <div className="mt-6 space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-2xl border border-[#173f35]/10 bg-white/70"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-4 font-medium">
                {faq.question}
                <span className="text-[#6f7972] transition-transform group-open:rotate-180">
                  ▼
                </span>
              </summary>
              <p className="px-6 pb-4 text-sm leading-relaxed text-[#59645d]">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
        <p className="mt-6 text-sm leading-relaxed text-[#6f7972]">
          Pembayaran SPP yang lunas langsung terlihat di{' '}
          <Link
            href="/fitur/keuangan-sekolah"
            className="text-[#26735d] hover:text-[#17211b]"
          >
            pencatatan kas sekolah
          </Link>
          , jadi laporan kas dan rekap SPP selalu sejalan.
        </p>
      </section>

      <RelatedLinks links={[...relatedLinks]} />

      <CtaSection
        title="Kendalikan rekap SPP sekolah Anda"
        description="Coba SekolahRapi gratis, atau lihat paket mana yang cocok dengan kebutuhan administrasi sekolah Anda."
      />
    </MarketingLayout>
  );
}
