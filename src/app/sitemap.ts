import type { MetadataRoute } from 'next';
import { APP_URL } from '@/shared/constants';
import { PANDUAN_ARTICLES } from '@/content/panduan';

// Hanya halaman publik yang layak diindeks. Auth/dashboard tidak masuk sitemap.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: APP_URL, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${APP_URL}/pricing`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${APP_URL}/fitur`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${APP_URL}/fitur/keuangan-sekolah`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${APP_URL}/fitur/pembayaran-spp`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${APP_URL}/fitur/pendaftaran-siswa-online`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${APP_URL}/fitur/laporan-sekolah`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${APP_URL}/solusi`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${APP_URL}/solusi/sekolah-swasta`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${APP_URL}/solusi/madrasah`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${APP_URL}/panduan`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
  ];

  const articleRoutes: MetadataRoute.Sitemap = PANDUAN_ARTICLES.map((article) => ({
    url: `${APP_URL}/panduan/${article.slug}`,
    lastModified: new Date(article.date),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...articleRoutes];
}
