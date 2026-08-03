import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Wallet,
  Receipt,
  UserPlus,
  FileSpreadsheet,
  ArrowRight,
} from 'lucide-react';
import MarketingLayout from '@/shared/components/marketing/MarketingLayout';
import { CtaSection } from '@/shared/components/marketing/CtaSection';
import { APP_URL } from '@/shared/constants';

const description =
  'Fitur SekolahRapi untuk administrasi sekolah: pencatatan kas masuk dan keluar, pembayaran SPP, pendaftaran siswa online, dan laporan keuangan bulanan dalam satu sistem.';

export const metadata: Metadata = {
  title: 'Fitur SekolahRapi',
  description,
  alternates: { canonical: '/fitur' },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: `${APP_URL}/fitur`,
    title: 'Fitur SekolahRapi',
    description,
  },
};

const features = [
  {
    icon: Wallet,
    href: '/fitur/keuangan-sekolah',
    title: 'Keuangan Sekolah',
    description:
      'Catat kas masuk dan keluar per kategori, pantau riwayat dengan saldo berjalan, dan ekspor data sebagai CSV.',
  },
  {
    icon: Receipt,
    href: '/fitur/pembayaran-spp',
    title: 'Pembayaran SPP',
    description:
      'Catat pembayaran SPP per siswa per bulan dengan status lunas, angsuran, atau belum. Rekap tunggakan jadi lebih mudah.',
  },
  {
    icon: UserPlus,
    href: '/fitur/pendaftaran-siswa-online',
    title: 'Pendaftaran Siswa Online',
    description:
      'Terima data calon siswa lewat formulir online yang bisa dibagikan, lalu review dan konfirmasi langsung di sistem.',
  },
  {
    icon: FileSpreadsheet,
    href: '/fitur/laporan-sekolah',
    title: 'Laporan Sekolah',
    description:
      'Rekap keuangan bulanan (pemasukan, pengeluaran, net) dan rekap SPP yang bisa diekspor sebagai CSV.',
  },
] as const;

export default function FiturPage() {
  return (
    <MarketingLayout>
      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            Fitur SekolahRapi
          </h1>
          <p className="text-lg leading-relaxed text-white/70">
            Modul administrasi sekolah yang saling terhubung: dari pencatatan kas
            dan pembayaran SPP sampai pendaftaran siswa baru dan laporan bulanan.
            Data yang sama dipakai di seluruh alur, tanpa mengetik ulang di
            tempat terpisah.
          </p>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.href}
                href={feature.href}
                className="group rounded-xl border border-white/10 bg-white/[.06] p-8 transition-all duration-200 hover:border-[#7c5cff]/50 hover:bg-white/[.08]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#3a1fb8] shadow-lg shadow-[#7c5cff]/20">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-white/30 transition-all duration-200 group-hover:translate-x-1 group-hover:text-[#7c5cff]" />
                </div>
                <h2 className="mt-6 text-xl font-bold">{feature.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-white/70">
                  {feature.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <CtaSection
        title="Mulai rapikan administrasi sekolah Anda"
        description="SekolahRapi bisa dicoba gratis. Setup, impor data awal, dan onboarding dibantu untuk tim sekolah."
      />
    </MarketingLayout>
  );
}
