import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { QueryProvider } from '@/shared/components/QueryProvider';
import { AuthProvider } from '@/shared/providers/AuthProvider';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { Toaster } from '@/shared/components/ui/toaster';
import { APP_NAME } from '@/shared/constants';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#4F46E5',
};

export const metadata: Metadata = {
  title: APP_NAME,
  description: 'Administrasi keuangan sekolah swasta',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_NAME,
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
        <QueryProvider>
          <AuthProvider>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
            <Toaster />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
