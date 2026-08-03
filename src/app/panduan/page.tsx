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
        <p className="text-sm font-bold tracking-wider text-[#26735d] uppercase">
          Knowledge Hub
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-[#17211b] sm:text-5xl">
          Panduan
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-[#59645d]">
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
            className="rounded-full bg-[#173f35] px-4 py-2 text-sm font-bold text-white"
          >
            Semua
          </a>
          {PANDUAN_CATEGORIES.map((category) => (
            <a
              key={category.key}
              href={`#${category.key}`}
              className="rounded-full border border-[#173f35]/15 px-4 py-2 text-sm font-bold text-[#526158] transition-colors hover:border-[#26735d] hover:text-[#26735d]"
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
              <h2 className="text-2xl font-black tracking-tight text-[#17211b]">
                {category.label}
              </h2>
              <p className="mt-1 text-[#6f7972]">{category.description}</p>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {articles.map((article) => (
                  <Link
                    key={article.slug}
                    href={`/panduan/${article.slug}`}
                    className="group rounded-2xl border border-[#173f35]/10 bg-white/70 p-6 transition-all hover:-translate-y-0.5 hover:border-[#26735d]/40 hover:shadow-lg hover:shadow-[#173f35]/10"
                  >
                    <h3 className="text-lg font-bold text-[#17211b] transition-colors group-hover:text-[#26735d]">
                      {article.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#59645d]">
                      {article.description}
                    </p>
                    <p className="mt-4 text-xs font-semibold text-[#6f7972]">
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
