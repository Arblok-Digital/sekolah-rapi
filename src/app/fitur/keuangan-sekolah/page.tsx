import type { Metadata } from 'next';
import Link from 'next/link';
import {
  TrendingUp,
  History,
  BarChart3,
  Check,
} from 'lucide-react';
import MarketingLayout from '@/shared/components/marketing/MarketingLayout';
import { Breadcrumb } from '@/shared/components/marketing/Breadcrumb';
import { CtaSection } from '@/shared/components/marketing/CtaSection';
import { RelatedLinks } from '@/shared/components/marketing/RelatedLinks';
import { APP_URL } from '@/shared/constants';

const description =
  'Kelola keuangan sekolah: catat kas masuk dan keluar per kategori, pantau riwayat dengan saldo berjalan, dan lihat rekap keuangan bulanan dalam satu sistem.';

export const metadata: Metadata = {
  title: 'Keuangan Sekolah',
  description,
  alternates: { canonical: '/fitur/keuangan-sekolah' },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: `${APP_URL}/fitur/keuangan-sekolah`,
    title: 'Keuangan Sekolah | SekolahRapi',
    description,
  },
};

const sections = [
  {
    icon: TrendingUp,
    title: 'Pencatatan kas masuk dan keluar',
    description:
      'Setiap uang yang diterima atau dikeluarkan sekolah dicatat sebagai transaksi dengan tipe pemasukan atau pengeluaran.',
    points: [
      'Tentukan kategori untuk setiap transaksi: SPP, donasi, subsidi, gaji guru, operasional, ATK, utilitas, perbaikan, dan lainnya.',
      'Lengkapi keterangan, tanggal transaksi, dan nominal agar mudah ditelusuri kembali.',
      'Kategori bisa disesuaikan dengan kebutuhan pencatatan sekolah Anda.',
      'Pembayaran SPP yang lunas otomatis tercatat sebagai pemasukan kas kategori SPP.',
    ],
  },
  {
    icon: History,
    title: 'Riwayat kas dengan saldo berjalan',
    description:
      'Seluruh transaksi tersusun dalam satu daftar riwayat yang bisa difilter, lengkap dengan saldo berjalan.',
    points: [
      'Saldo berjalan dihitung otomatis dari urutan transaksi, sehingga kondisi kas terlihat dari awal sampai terakhir.',
      'Filter berdasarkan rentang waktu, tipe transaksi, atau kategori untuk mempersempit pencarian.',
      'Ekspor riwayat ke file CSV untuk kebutuhan rekap di luar sistem.',
      'Sumber transaksi terlihat: apakah dari SPP, penggajian, inventaris, koreksi, atau pencatatan manual.',
    ],
  },
  {
    icon: BarChart3,
    title: 'Laporan keuangan bulanan',
    description:
      'Rekap pemasukan dan pengeluaran sekolah tersusun per bulan dalam satu tampilan ringkas.',
    points: [
      'Lihat total pemasukan, total pengeluaran, dan selisih (net) setiap bulan.',
      'Laporan dihitung dari data transaksi yang tercatat, jadi tidak perlu merangkum ulang secara manual.',
      'Rekap keuangan dan rekap SPP tersedia di halaman laporan dan bisa diekspor.',
    ],
  },
] as const;

const faqs = [
  {
    question: 'Apakah pembayaran SPP otomatis masuk ke pencatatan kas?',
    answer:
      'Ya. Ketika pembayaran SPP dicatat lunas, SekolahRapi otomatis membuat transaksi pemasukan kas dengan kategori SPP. Tidak perlu mencatat dua kali.',
  },
  {
    question: 'Bagaimana jika ada transaksi yang keliru dicatat?',
    answer:
      'Transaksi dapat diperbaiki atau dihapus. Khusus pembayaran SPP yang sudah lunas lalu dihapus, sistem membuat transaksi koreksi (reversal) agar saldo kas tetap benar dan jejak tetap terlihat di riwayat.',
  },
  {
    question: 'Apakah riwayat kas bisa diekspor?',
    answer:
      'Bisa. Riwayat kas dapat diekspor ke file CSV lengkap dengan tanggal, tipe, keterangan, sumber, kategori, nominal masuk/keluar, dan saldo berjalan.',
  },
  {
    question: 'Apakah owner bisa memantau keuangan sekolah dari mana saja?',
    answer:
      'Data tersimpan di cloud dan dashboard owner dapat diakses dari perangkat yang terhubung internet. Pembaruan realtime untuk pantauan owner tersedia di paket Pro.',
  },
] as const;

const relatedLinks = [
  {
    href: '/fitur/pembayaran-spp',
    label: 'Pembayaran SPP',
    description:
      'Catat SPP per siswa per bulan dan pantau status lunas, angsuran, atau belum.',
  },
  {
    href: '/panduan/cara-bendahara-sekolah-mencatat-kas-masuk-keluar',
    label: 'Cara bendahara mencatat kas masuk dan keluar',
    description:
      'Panduan praktis pencatatan pemasukan dan pengeluaran kas sekolah.',
  },
  {
    href: '/pricing',
    label: 'Harga dan Paket',
    description: 'Lihat paket Gratis, Basic, dan Pro SekolahRapi.',
  },
] as const;

export default function KeuanganSekolahPage() {
  return (
    <MarketingLayout>
      <Breadcrumb
        items={[
          { label: 'Fitur', href: '/fitur' },
          { label: 'Keuangan Sekolah' },
        ]}
      />

      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-12 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            Keuangan Sekolah
          </h1>
          <p className="text-lg leading-relaxed text-[#59645d]">
            Pencatatan kas sekolah tidak perlu lagi tersebar di buku catatan
            dan file yang berbeda. SekolahRapi menampung pemasukan dan
            pengeluaran per kategori, menyimpan riwayat dengan saldo berjalan,
            dan menyusun rekap bulanan dari data yang sama.
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
        <h2 className="text-xl font-bold">Pertanyaan tentang kas sekolah</h2>
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
          Butuh contoh nyata? Baca{' '}
          <Link
            href="/panduan/cara-bendahara-sekolah-mencatat-kas-masuk-keluar"
            className="text-[#26735d] hover:text-[#17211b]"
          >
            panduan mencatat kas masuk dan keluar
          </Link>{' '}
          untuk alur pencatatan yang disarankan.
        </p>
      </section>

      <RelatedLinks links={[...relatedLinks]} />

      <CtaSection
        title="Rapikan pencatatan kas sekolah Anda"
        description="Coba SekolahRapi gratis, atau lihat paket mana yang cocok dengan kebutuhan administrasi sekolah Anda."
      />
    </MarketingLayout>
  );
}
