import type { MetadataRoute } from 'next';
import { APP_URL } from '@/shared/constants';

// Halaman yang tidak perlu di-crawl (auth, dashboard, API internal).
const disallow = [
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
];

// Crawler/AI agent diizinkan eksplisit (AEO/GEO — jawaban engine & crawl model).
// Rules sama persis dengan '*' — daftar ini biar kebaca jelas di robots.txt.
const aiCrawlers = [
  'GPTBot', // OpenAI (crawl)
  'OAI-SearchBot', // ChatGPT search
  'ChatGPT-User', // ChatGPT fetch atas permintaan user
  'ClaudeBot', // Anthropic (crawl)
  'Claude-Web', // Anthropic (legacy)
  'anthropic-ai', // Anthropic (legacy)
  'PerplexityBot', // Perplexity
  'Google-Extended', // Gemini (training/extension)
  'Applebot-Extended', // Apple Intelligence
  'CCBot', // Common Crawl
  'Bytespider', // ByteDance
  'Amazonbot', // Amazon
  'Meta-ExternalAgent', // Meta
  'cohere-ai', // Cohere
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: aiCrawlers,
        allow: '/',
        disallow,
      },
      {
        userAgent: '*',
        allow: '/',
        disallow,
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
