import type { Metadata } from 'next';
import MarketingLayout from '@/shared/components/marketing/MarketingLayout';
import { Breadcrumb } from '@/shared/components/marketing/Breadcrumb';
import { CtaSection } from '@/shared/components/marketing/CtaSection';
import { RelatedLinks } from '@/shared/components/marketing/RelatedLinks';
import { APP_URL } from '@/shared/constants';
import {
  BarChart3,
  BookOpen,
  BookOpenCheck,
  Check,
  Coins,
  MoonStar,
  Users,
  WalletCards,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Solusi Madrasah',
  description:
    'SekolahRapi untuk madrasah: alat pencatatan administrasi harian — rekap SPP dan iuran santri, data siswa, dan laporan keuangan yang rapi.',
  alternates: { canonical: '/solusi/madrasah' },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: `${APP_URL}/solusi/madrasah`,
    title: 'Solusi Madrasah | SekolahRapi',
    description:
      'Pencatatan SPP, data siswa, dan laporan keuangan untuk madrasah dalam satu sistem.',
  },
};

const painPoints = [
  {
    Icon: WalletCards,
    title: 'Rekap iuran dan SPP masih manual',
    description:
      'Pembayaran SPP dan iuran santri dicatat di buku atau file terpisah. Rekap bulanan memakan waktu dan sering telat untuk diketahui pimpinan madrasah.',
  },
  {
    Icon: BookOpen,
    title: 'Administrasi santri tersebar',
    description:
      'Data santri, kelas, dan riwayat pembayaran berada di tempat berbeda sehingga mencari riwayat satu santri butuh waktu lama.',
  },
  {
    Icon: BarChart3,
    title: 'Laporan keuangan sulit disusun',
    description:
      'Bendahara menyusun laporan dari catatan yang terpencar, dan hasilnya mudah berbeda antara catatan dan kenyataan di lapangan.',
  },
] as const;

const helps = [
  {
    Icon: WalletCards,
    title: 'Pencatatan SPP dan iuran santri',
    description:
      'Catat pembayaran per santri dan lihat status tunggakan setiap kelas tanpa rekap manual.',
  },
  {
    Icon: Users,
    title: 'Data santri terpusat',
    description:
      'Profil santri tersimpan di satu tempat dan bisa diimpor dari Excel untuk memulai dengan cepat.',
  },
  {
    Icon: Coins,
    title: 'Kas madrasah dengan riwayat jelas',
    description:
      'Setiap pemasukan dan pengeluaran dicatat dengan kategori, lengkap dengan riwayat aktivitas yang bisa ditelusuri.',
  },
  {
    Icon: BarChart3,
    title: 'Laporan rekap bulanan',
    description:
      'Rekap pembayaran, pemasukan, dan pengeluaran tersusun dari pencatatan harian tanpa merangkum ulang.',
  },
  {
    Icon: BookOpenCheck,
    title: 'Pendaftaran online (Pro)',
    description:
      'Terima data calon santri melalui formulir online yang masuk langsung ke dashboard untuk diproses.',
  },
] as const;

const checklist = [
  'Data santri tersimpan terpusat, impor awal dari Excel',
  'Pembayaran SPP dan iuran tercatat per santri dengan status tunggakan',
  'Pemasukan dan pengeluaran kas dikategorikan',
  'Riwayat aktivitas dan perubahan data dapat ditelusuri',
  'Rekap laporan bulanan tanpa menyusun ulang manual',
  'Data madrasah dipisahkan dari sekolah lain (Row Level Security)',
  'Formulir pendaftaran online untuk calon santri (paket Pro)',
] as const;

const faqs = [
  {
    q: 'Apakah SekolahRapi terintegrasi dengan Kemenag atau EMIS?',
    a: 'Tidak. SekolahRapi adalah alat pencatatan yang membantu administrasi harian madrasah — pencatatan SPP, data siswa, dan laporan keuangan. SekolahRapi tidak terhubung dengan Kemenag, EMIS, atau sistem pelaporan resmi lainnya.',
  },
  {
    q: 'Apakah data madrasah kami terpisah dari sekolah lain?',
    a: 'Ya. Setiap akun terikat pada identitas sekolah dengan kebijakan Row Level Security, sehingga data operasional dipisahkan antar madrasah.',
  },
  {
    q: 'Apakah bisa digunakan saat internet terganggu?',
    a: 'SekolahRapi memiliki dukungan PWA dan kemampuan offline untuk alur tertentu. Cakupannya dijelaskan saat demo sesuai kebutuhan madrasah.',
  },
  {
    q: 'Haruskah semua data lama dipindahkan sekaligus?',
    a: 'Tidak. Mulai dari data dan alur yang paling penting, lalu lanjutkan secara bertahap. Impor data awal dari Excel dibantu saat onboarding.',
  },
] as const;

export default function SolusiMadrasahPage() {
  return (
    <MarketingLayout>
      <Breadcrumb
        items={[
          { label: 'Solusi', href: '/solusi' },
          { label: 'Madrasah' },
        ]}
      />

      <section className="mx-auto max-w-7xl px-4 pb-14 pt-12 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#26735d]/30 bg-[#dfe99a]/45 px-3 py-1 text-xs font-semibold text-[#26735d]">
            <MoonStar className="h-3.5 w-3.5" /> Madrasah
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
            Solusi Madrasah
          </h1>
          <p className="mt-5 text-lg leading-8 text-[#59645d]">
            SekolahRapi adalah alat pencatatan yang membantu administrasi harian
            madrasah — rekap SPP dan iuran santri, data siswa, serta laporan
            keuangan yang rapi dalam satu sistem.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#26735d]">
            Masalah yang sering terjadi
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">
            Pencatatan harian yang menyita waktu bendahara.
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
            Catatan madrasah yang rapi setiap hari.
          </h2>
          <p className="mt-3 leading-7 text-[#59645d]">
            SekolahRapi merapikan alur pencatatan yang paling sering dipakai
            tim madrasah, tanpa mengubah seluruh kebiasaan sekaligus.
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
        <p className="mt-6 max-w-4xl rounded-xl border border-[#173f35]/10 bg-white/70 px-4 py-3 text-xs leading-6 text-[#59645d]">
          SekolahRapi adalah alat pencatatan untuk administrasi harian madrasah
          dan tidak terhubung dengan Kemenag, EMIS, atau sistem pelaporan resmi
          lainnya.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#26735d]">
            Checklist
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">
            Apa yang bisa dirapikan di madrasah
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
            href: '/fitur/pembayaran-spp',
            label: 'Fitur Pembayaran SPP',
            description: 'Catat pembayaran dan pantau tunggakan per siswa.',
          },
          {
            href: '/fitur/laporan-sekolah',
            label: 'Fitur Laporan Sekolah',
            description: 'Rekap pembayaran, pemasukan, dan pengeluaran.',
          },
          {
            href: '/solusi/sekolah-swasta',
            label: 'Solusi Sekolah Swasta',
            description:
              'Administrasi siswa, SPP, dan kas sekolah swasta dalam satu sistem.',
          },
          {
            href: '/pricing',
            label: 'Harga dan Paket',
            description: 'Bandingkan paket Gratis, Basic, dan Pro SekolahRapi.',
          },
        ]}
      />

      <CtaSection
        title="Rapikan administrasi harian madrasah Anda."
        description="Coba gratis, atau lihat paket yang sesuai dengan kebutuhan madrasah."
      />
    </MarketingLayout>
  );
}
