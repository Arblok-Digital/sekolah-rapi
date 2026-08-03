import type { MetadataRoute } from 'next';
import { APP_URL } from '@/shared/constants';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          // Auth & account surfaces
          '/login',
          '/register',
          '/register-student',
          '/onboarding',
          '/pending-approval',
          '/rejected',
          // Dashboard (app) surfaces
          '/overview',
          '/students',
          '/spp',
          '/transactions',
          '/categories',
          '/audit',
          '/enrollment',
          '/inventory',
          '/payroll',
          '/reports',
          '/dev',
          // Internal API
          '/api/',
        ],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
