import type { Metadata } from 'next';
import Link from 'next/link';
import MarketingLayout from '@/shared/components/marketing/MarketingLayout';
import { CtaSection } from '@/shared/components/marketing/CtaSection';
import { APP_URL } from '@/shared/constants';
import {
  PANDUAN_ARTICLES,
  PANDUAN_CATEGORIES,
  formatPanduanDate,
} from '@/content/panduan';

export const metadata: Metadata = {
  title: 'Panduan Sekolah',
  description:
    'Kumpulan panduan praktis mengelola administrasi sekolah: keuangan, SPP, pendaftaran siswa baru, dan checklist administrasi — ditulis untuk bendahara dan kepala sekolah.',
  alternates: { canonical: '/panduan' },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: `${APP_URL}/panduan`,
    title: 'Panduan Sekolah | SekolahRapi',
    description:
      'Panduan praktis keuangan, SPP, pendaftaran siswa baru, dan administrasi untuk sekolah swasta.',
  },
};

export default function PanduanIndexPage() {
  return (
    <MarketingLayout>
      <section className="mx-auto max-w-5xl px-5 pt-16 pb-10 sm:px-8">
        <p className="text-sm font-bold tracking-wider text-indigo-300 uppercase">
          Knowledge Hub
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
          Panduan
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-white/70">
          Kumpulan panduan praktis untuk mengelola administrasi sekolah: keuangan,
          SPP, pendaftaran siswa baru, dan checklist administrasi — ditulis untuk
          bendahara, operator, dan kepala sekolah.
        </p>
      </section>

      <nav
        aria-label="Kategori panduan"
        className="mx-auto max-w-5xl px-5 sm:px-8"
      >
        <div className="flex flex-wrap gap-2">
          <a
            href="#daftar-panduan"
            className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-bold text-white"
          >
            Semua
          </a>
          {PANDUAN_CATEGORIES.map((category) => (
            <a
              key={category.key}
              href={`#${category.key}`}
              className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/80 transition-colors hover:border-indigo-400 hover:text-indigo-300"
            >
              {category.label}
            </a>
          ))}
        </div>
      </nav>

      <div
        id="daftar-panduan"
        className="mx-auto max-w-5xl space-y-16 px-5 py-14 sm:px-8"
      >
        {PANDUAN_CATEGORIES.map((category) => {
          const articles = PANDUAN_ARTICLES.filter(
            (article) => article.category === category.key,
          );
          return (
            <section
              key={category.key}
              id={category.key}
              className="scroll-mt-24"
            >
              <h2 className="text-2xl font-black tracking-tight text-white">
                {category.label}
              </h2>
              <p className="mt-1 text-white/60">{category.description}</p>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {articles.map((article) => (
                  <Link
                    key={article.slug}
                    href={`/panduan/${article.slug}`}
                    className="group rounded-2xl border border-white/10 bg-white/[.06] p-6 transition-all hover:-translate-y-0.5 hover:border-indigo-400/40 hover:shadow-lg hover:shadow-indigo-900/20"
                  >
                    <h3 className="text-lg font-bold text-white transition-colors group-hover:text-indigo-300">
                      {article.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/65">
                      {article.description}
                    </p>
                    <p className="mt-4 text-xs font-semibold text-white/45">
                      {formatPanduanDate(article.date)} · {article.readMinutes}{' '}
                      menit baca
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <section className="mx-auto max-w-5xl px-5 pb-20 sm:px-8">
        <CtaSection title="Siap merapikan administrasi sekolah?" />
      </section>
    </MarketingLayout>
  );
}
