import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { QueryProvider } from '@/shared/components/QueryProvider';
import { AuthProvider } from '@/shared/providers/AuthProvider';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { Toaster } from '@/shared/components/ui/toaster';
import { ToastProvider } from '@/shared/components/ui/toast';
import { APP_NAME, APP_URL } from '@/shared/constants';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#4F46E5',
};

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: 'Administrasi keuangan sekolah swasta',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/favicon-school.ico',
    shortcut: '/icons/favicon-school.ico',
    apple: '/icons/school-512.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_NAME,
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: APP_NAME,
    url: APP_URL,
    title: APP_NAME,
    description: 'Administrasi keuangan sekolah swasta',
  },
  twitter: {
    card: 'summary',
    title: APP_NAME,
    description: 'Administrasi keuangan sekolah swasta',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <ToastProvider>
          <QueryProvider>
            <AuthProvider>
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </AuthProvider>
          </QueryProvider>
          <Toaster />
        </ToastProvider>
      </body>
    </html>
  );
}
