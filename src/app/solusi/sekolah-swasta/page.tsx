import type { Metadata } from 'next';
import MarketingLayout from '@/shared/components/marketing/MarketingLayout';
import { Breadcrumb } from '@/shared/components/marketing/Breadcrumb';
import { CtaSection } from '@/shared/components/marketing/CtaSection';
import { RelatedLinks } from '@/shared/components/marketing/RelatedLinks';
import { APP_URL } from '@/shared/constants';
import {
  BarChart3,
  BookOpenCheck,
  Calculator,
  Check,
  Coins,
  FileSpreadsheet,
  School,
  Users,
  WalletCards,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Solusi Sekolah Swasta',
  description:
    'SekolahRapi untuk sekolah swasta kecil-menengah: rapi data siswa, rekap SPP, dan kas sekolah yang transparan untuk yayasan dan owner.',
  alternates: { canonical: '/solusi/sekolah-swasta' },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: `${APP_URL}/solusi/sekolah-swasta`,
    title: 'Solusi Sekolah Swasta | SekolahRapi',
    description:
      'Administrasi siswa, SPP, dan kas sekolah swasta dalam satu sistem.',
  },
};

const painPoints = [
  {
    Icon: FileSpreadsheet,
    title: 'Administrasi data siswa tersebar',
    description:
      'Profil siswa, catatan pembayaran, dan dokumen pendaftaran berada di file serta buku yang berbeda-beda, lalu harus diketik ulang untuk setiap rekap.',
  },
  {
    Icon: Calculator,
    title: 'Rekap SPP dilakukan manual',
    description:
      'Pembayaran SPP dicatat satu per satu. Mengetahui siapa yang menunggak dan berapa total per kelas memakan waktu dan rawan salah hitung.',
  },
  {
    Icon: Coins,
    title: 'Kas tidak transparan untuk yayasan',
    description:
      'Uang masuk dan keluar baru terlihat setelah admin merangkum. Owner atau yayasan sulit memantau posisi kas sekolah secara langsung.',
  },
] as const;

const helps = [
  {
    Icon: Users,
    title: 'Data siswa terpusat',
    description:
      'Profil siswa tersimpan di satu tempat dan bisa diimpor dari Excel sehingga tim tidak mulai dari halaman kosong.',
  },
  {
    Icon: WalletCards,
    title: 'Pencatatan SPP dan tunggakan',
    description:
      'Catat pembayaran per siswa dan lihat status tunggakan setiap kelas tanpa menyusun rekap manual.',
  },
  {
    Icon: Coins,
    title: 'Kas dengan riwayat yang jelas',
    description:
      'Setiap pemasukan dan pengeluaran dicatat dengan kategori, lengkap dengan riwayat aktivitas yang bisa ditelusuri.',
  },
  {
    Icon: BarChart3,
    title: 'Laporan operasional dan keuangan',
    description:
      'Rekap pembayaran, pemasukan, dan pengeluaran tersusun dari pencatatan harian tanpa merangkum ulang.',
  },
  {
    Icon: BookOpenCheck,
    title: 'Pendaftaran online (Pro)',
    description:
      'Terima data calon siswa melalui formulir online yang masuk langsung ke dashboard untuk diproses.',
  },
] as const;

const checklist = [
  'Profil siswa tersimpan rapi, impor data awal dari Excel',
  'Pembayaran SPP tercatat per siswa dengan status tunggakan',
  'Pemasukan dan pengeluaran kas dikategorikan',
  'Riwayat aktivitas dan perubahan data dapat ditelusuri',
  'Rekap laporan bulanan tanpa menyusun ulang manual',
  'Data sekolah dipisahkan dari sekolah lain (Row Level Security)',
  'Formulir pendaftaran online untuk calon siswa (paket Pro)',
] as const;

const faqs = [
  {
    q: 'Apakah data sekolah kami aman dan terpisah dari sekolah lain?',
    a: 'Ya. Setiap akun terikat pada identitas sekolah dengan kebijakan Row Level Security, sehingga data operasional dipisahkan antar sekolah.',
  },
  {
    q: 'Apakah bisa digunakan saat internet terganggu?',
    a: 'SekolahRapi memiliki dukungan PWA dan kemampuan offline untuk alur tertentu. Cakupannya dijelaskan saat demo sesuai kebutuhan sekolah.',
  },
  {
    q: 'Haruskah semua data lama dipindahkan sekaligus?',
    a: 'Tidak. Mulai dari data dan alur yang paling penting, lalu lanjutkan secara bertahap. Impor data awal dari Excel dibantu saat onboarding.',
  },
  {
    q: 'Apakah pantauan realtime tersedia di semua paket?',
    a: 'Pantauan aktivitas realtime tersedia di paket Pro. Pada paket lain, pencatatan dan rekap tetap bisa dilakukan melalui dashboard.',
  },
] as const;

export default function SolusiSekolahSwastaPage() {
  return (
    <MarketingLayout>
      <Breadcrumb
        items={[
          { label: 'Solusi', href: '/solusi' },
          { label: 'Sekolah Swasta' },
        ]}
      />

      <section className="mx-auto max-w-7xl px-4 pb-14 pt-12 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#26735d]/30 bg-[#dfe99a]/45 px-3 py-1 text-xs font-semibold text-[#26735d]">
            <School className="h-3.5 w-3.5" /> Sekolah Swasta
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
            Solusi Sekolah Swasta
          </h1>
          <p className="mt-5 text-lg leading-8 text-[#59645d]">
            SekolahRapi membantu sekolah swasta kecil-menengah merapikan
            administrasi data siswa, rekap SPP, dan kas sekolah — sehingga
            yayasan atau owner bisa memantau tanpa menunggu rekap manual.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#26735d]">
            Masalah yang sering terjadi
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">
            Tiga titik yang paling sering berantakan.
          </h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {painPoints.map((pain) => {
            const Icon = pain.Icon;
            return (
              <div
                key={pain.title}
                className="rounded-2xl border border-[#173f35]/10 bg-white/70 p-7"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#173f35] to-[#26735d] text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-bold">{pain.title}</h3>
                <p className="mt-2 text-sm leading-7 text-[#59645d]">
                  {pain.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#26735d]">
            Cara SekolahRapi membantu
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">
            Catatan yang rapi, mulai dari yang paling sering dipakai.
          </h2>
          <p className="mt-3 leading-7 text-[#59645d]">
            Alih-alih mengganti semua kebiasaan sekaligus, SekolahRapi
            merapikan alur pencatatan yang paling menyita waktu admin.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {helps.map((help) => {
            const Icon = help.Icon;
            return (
              <div
                key={help.title}
                className="rounded-2xl border border-[#173f35]/10 bg-white/70 p-7"
              >
                <Icon className="h-6 w-6 text-[#26735d]" />
                <h3 className="mt-5 text-lg font-bold">{help.title}</h3>
                <p className="mt-2 text-sm leading-7 text-[#59645d]">
                  {help.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#26735d]">
            Checklist
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">
            Apa yang bisa dirapikan di admin sekolah swasta
          </h2>
        </div>
        <ul className="mt-10 grid gap-3 sm:grid-cols-2">
          {checklist.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 rounded-xl border border-[#173f35]/10 bg-white/70 px-5 py-4 text-sm leading-6"
            >
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#26735d]" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#26735d]">
            Pertanyaan umum
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">
            Sebelum mencoba SekolahRapi
          </h2>
        </div>
        <div className="mt-8 space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-2xl border border-[#173f35]/10 bg-white/70"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 font-semibold">
                {faq.q}
                <span className="shrink-0 text-[#6f7972] transition-transform duration-200 group-open:rotate-180">
                  ▼
                </span>
              </summary>
              <p className="px-6 pb-5 text-sm leading-7 text-[#59645d]">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      <RelatedLinks
        links={[
          {
            href: '/fitur/keuangan-sekolah',
            label: 'Fitur Keuangan Sekolah',
            description: 'Pencatatan kas, kategori, dan laporan operasional.',
          },
          {
            href: '/fitur/pembayaran-spp',
            label: 'Fitur Pembayaran SPP',
            description: 'Catat pembayaran dan pantau tunggakan per siswa.',
          },
          {
            href: '/solusi/madrasah',
            label: 'Solusi Madrasah',
            description: 'Administrasi harian madrasah: SPP, data siswa, laporan.',
          },
          {
            href: '/panduan/administrasi-sekolah-swasta-yang-perlu-dirapikan',
            label: 'Panduan Administrasi Sekolah Swasta',
            description:
              'Checklist administrasi sekolah swasta yang perlu dirapikan.',
          },
        ]}
      />

      <CtaSection
        title="Mulai rapikan administrasi sekolah swasta Anda."
        description="Coba gratis, atau lihat paket yang sesuai dengan kebutuhan sekolah."
      />
    </MarketingLayout>
  );
}
