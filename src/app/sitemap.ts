import type { MetadataRoute } from 'next';
import { APP_URL } from '@/shared/constants';

// Hanya halaman publik yang layak diindeks. Auth/dashboard tidak masuk sitemap.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: APP_URL,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${APP_URL}/pricing`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];
}
