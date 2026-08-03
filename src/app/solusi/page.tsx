import type { Metadata } from 'next';
import Link from 'next/link';
import MarketingLayout from '@/shared/components/marketing/MarketingLayout';
import { CtaSection } from '@/shared/components/marketing/CtaSection';
import { APP_URL } from '@/shared/constants';
import {
  ArrowRight,
  LayoutDashboard,
  MoonStar,
  School,
  Sparkles,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Solusi SekolahRapi',
  description:
    'Solusi SekolahRapi untuk sekolah swasta dan madrasah: rapi data siswa, pencatatan SPP, kas sekolah, dan laporan administrasi dalam satu sistem.',
  alternates: { canonical: '/solusi' },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: `${APP_URL}/solusi`,
    title: 'Solusi SekolahRapi | Sekolah Swasta dan Madrasah',
    description:
      'SekolahRapi membantu sekolah swasta dan madrasah merapikan administrasi siswa, SPP, dan kas sekolah.',
  },
};

const solutions = [
  {
    href: '/solusi/sekolah-swasta',
    Icon: School,
    tag: 'Sekolah Swasta',
    title: 'Sekolah swasta kecil-menengah',
    description:
      'Rapikan administrasi data siswa, rekap SPP, dan kas sekolah agar yayasan atau owner dapat memantau tanpa menunggu rekap manual.',
    points: ['Data siswa terpusat', 'Pencatatan SPP', 'Kas dengan riwayat'],
  },
  {
    href: '/solusi/madrasah',
    Icon: MoonStar,
    tag: 'Madrasah',
    title: 'Madrasah (MI, MTs, MA)',
    description:
      'Alat pencatatan untuk administrasi harian madrasah: rekap SPP dan iuran santri, data siswa, serta laporan keuangan yang rapi.',
    points: ['Rekap SPP santri', 'Data siswa terpusat', 'Laporan bulanan'],
  },
] as const;

export default function SolusiIndexPage() {
  return (
    <MarketingLayout>
      <section className="mx-auto max-w-7xl px-4 pb-14 pt-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#7c5cff]/30 bg-[#7c5cff]/10 px-3 py-1 text-xs font-semibold text-[#a892ff]">
            <Sparkles className="h-3.5 w-3.5" /> Solusi
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
            Solusi untuk Sekolah Anda
          </h1>
          <p className="mt-5 text-lg leading-8 text-white/70">
            SekolahRapi membantu sekolah swasta dan madrasah merapikan
            administrasi harian — data siswa, SPP, kas, sampai laporan — dalam
            satu sistem.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2">
          {solutions.map((solution) => {
            const Icon = solution.Icon;
            return (
              <Link
                key={solution.href}
                href={solution.href}
                className="group rounded-2xl border border-white/10 bg-white/[.06] p-7 transition-all duration-200 hover:border-[#7c5cff]/50 hover:bg-white/[.09]"
              >
                <div className="flex items-start justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#3a1fb8] text-white">
                    <Icon className="h-6 w-6" />
                  </span>
                  <ArrowRight className="h-5 w-5 text-white/40 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[#7c5cff]" />
                </div>
                <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-[#a892ff]">
                  {solution.tag}
                </p>
                <h2 className="mt-1 text-xl font-bold">{solution.title}</h2>
                <p className="mt-3 text-sm leading-7 text-white/70">
                  {solution.description}
                </p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {solution.points.map((point) => (
                    <li
                      key={point}
                      className="rounded-full border border-white/10 bg-white/[.06] px-3 py-1 text-xs text-white/70"
                    >
                      {point}
                    </li>
                  ))}
                </ul>
              </Link>
            );
          })}
        </div>

        <Link
          href="/fitur"
          className="group mt-6 flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[.06] p-6 transition-all duration-200 hover:border-[#7c5cff]/50 hover:bg-white/[.09]"
        >
          <span className="flex items-center gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/10 text-[#a892ff]">
              <LayoutDashboard className="h-6 w-6" />
            </span>
            <span>
              <span className="block font-bold">Lihat Fitur</span>
              <span className="mt-1 block text-sm text-white/70">
                Siswa, SPP, kas, laporan, inventaris, penggajian, dan
                pendaftaran online.
              </span>
            </span>
          </span>
          <ArrowRight className="h-5 w-5 shrink-0 text-white/40 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[#7c5cff]" />
        </Link>
      </section>

      <CtaSection
        title="Bawa masalah administrasi sekolah Anda."
        description="Coba gratis atau lihat paket yang sesuai — setup dan impor data awal dibantu."
      />
    </MarketingLayout>
  );
}
