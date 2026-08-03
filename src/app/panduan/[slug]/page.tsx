import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import MarketingLayout from '@/shared/components/marketing/MarketingLayout';
import { Breadcrumb } from '@/shared/components/marketing/Breadcrumb';
import { CtaSection } from '@/shared/components/marketing/CtaSection';
import { RelatedLinks } from '@/shared/components/marketing/RelatedLinks';
import { APP_NAME, APP_URL } from '@/shared/constants';
import {
  CATEGORY_LABEL,
  PANDUAN_ARTICLES,
  PILLAR_TITLES,
  formatPanduanDate,
  getArticle,
  type PanduanArticle,
} from '@/content/panduan';

export function generateStaticParams() {
  return PANDUAN_ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = getArticle(params.slug);
  if (!article) {
    return {};
  }
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `/panduan/${article.slug}` },
    openGraph: {
      type: 'article',
      locale: 'id_ID',
      url: `${APP_URL}/panduan/${article.slug}`,
      title: article.title,
      description: article.description,
    },
  };
}

export default function PanduanArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const article = getArticle(params.slug);
  if (!article) {
    notFound();
  }

  const related = article.relatedSlugs
    .map((slug) => getArticle(slug))
    .filter((item): item is PanduanArticle => item !== undefined);

  const links = [
    {
      label: PILLAR_TITLES[article.pillarHref] ?? 'Fitur Terkait',
      href: article.pillarHref,
    },
    ...related.map((item) => ({
      label: item.title,
      href: `/panduan/${item.slug}`,
    })),
  ];

  const articleUrl = `${APP_URL}/panduan/${article.slug}`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: article.title,
        description: article.description,
        datePublished: article.date,
        author: { '@type': 'Organization', name: article.author },
        publisher: {
          '@type': 'Organization',
          name: APP_NAME,
          url: APP_URL,
        },
        mainEntityOfPage: articleUrl,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: APP_URL },
          { '@type': 'ListItem', position: 2, name: 'Panduan', item: `${APP_URL}/panduan` },
          { '@type': 'ListItem', position: 3, name: article.title, item: articleUrl },
        ],
      },
      ...(article.faq && article.faq.length > 0
        ? [
            {
              '@type': 'FAQPage',
              mainEntity: article.faq.map((item) => ({
                '@type': 'Question',
                name: item.q,
                acceptedAnswer: { '@type': 'Answer', text: item.a },
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <MarketingLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <article className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Panduan', href: '/panduan' },
            { label: article.title },
          ]}
        />

        <div className="mt-8">
          <Link
            href={`/panduan#${article.category}`}
            className="inline-block rounded-full bg-[#dfe99a]/45 px-3 py-1 text-xs font-bold text-[#26735d]"
          >
            {CATEGORY_LABEL[article.category]}
          </Link>
        </div>

        <h1 className="mt-4 text-3xl font-black tracking-tight text-[#17211b] sm:text-4xl">
          {article.title}
        </h1>
        <p className="mt-4 leading-relaxed text-[#59645d]">
          {article.description}
        </p>
        <p className="mt-4 text-sm font-semibold text-[#6f7972]">
          {formatPanduanDate(article.date)} · {article.readMinutes} menit baca ·{' '}
          {article.author}
        </p>

        {article.sections.map((section, index) => (
          <section key={index} className="mt-10">
            <h2 className="text-xl font-bold text-[#17211b] sm:text-2xl">
              {section.heading}
            </h2>
            {section.paragraphs?.map((paragraph, paragraphIndex) => (
              <p
                key={paragraphIndex}
                className="mt-3 leading-relaxed text-[#526158]"
              >
                {paragraph}
              </p>
            ))}
            {section.list ? (
              <ul className="mt-4 space-y-2">
                {section.list.map((item, listIndex) => (
                  <li
                    key={listIndex}
                    className="flex items-start gap-2 text-[#526158]"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#26735d]" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {section.steps ? (
              <ol className="mt-4 space-y-3">
                {section.steps.map((step, stepIndex) => (
                  <li
                    key={stepIndex}
                    className="flex items-start gap-3 text-[#526158]"
                  >
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#173f35] text-xs font-black text-white">
                      {stepIndex + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            ) : null}
          </section>
        ))}

        {article.faq && article.faq.length > 0 ? (
          <section className="mt-14">
            <h2 className="text-2xl font-black tracking-tight text-[#17211b]">
              Pertanyaan Umum
            </h2>
            <div className="mt-6 space-y-3">
              {article.faq.map((item, index) => (
                <details
                  key={index}
                  className="group rounded-2xl border border-[#173f35]/10 bg-white/70 px-6 py-4"
                >
                  <summary className="cursor-pointer font-bold text-[#17211b]">
                    {item.q}
                  </summary>
                  <p className="mt-3 leading-relaxed text-[#59645d]">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-14">
          <RelatedLinks title="Baca Juga" links={links} />
        </section>

        <section className="mt-14">
          <CtaSection
            title="Praktikkan panduan ini dengan alat bantu pencatatan"
            description="SekolahRapi membantu mencatat siswa, SPP, kas, dan laporan dalam satu tempat — dengan import/export Excel, realtime di plan Pro, dan dukungan offline terbatas."
            primaryLabel="Lihat Harga"
            primaryHref="/pricing"
          />
        </section>
      </article>
    </MarketingLayout>
  );
}
