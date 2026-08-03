import type { Metadata } from 'next';
import { APP_URL } from '@/shared/constants';

export const metadata: Metadata = {
  title: 'Harga dan Paket',
  description:
    'Paket Gratis, Basic, dan Pro SekolahRapi untuk administrasi sekolah swasta dan madrasah. Siswa, SPP, kas, laporan, pendaftaran online, penggajian, dan inventaris.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: `${APP_URL}/pricing`,
    title: 'Harga dan Paket | SekolahRapi',
    description:
      'Paket Gratis, Basic, dan Pro SekolahRapi untuk administrasi sekolah swasta dan madrasah.',
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
