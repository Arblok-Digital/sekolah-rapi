import type { Metadata } from "next";
import LandingPage from "./landing-page";
import { APP_NAME, APP_URL } from "@/shared/constants";

const description =
  "Terima pendaftaran siswa online, pantau uang masuk dan keluar tanpa menunggu rekap, lalu kelola administrasi sekolah dalam satu sistem.";

export const metadata: Metadata = {
  title: 'Aplikasi Administrasi Sekolah',
  description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: APP_NAME,
    title: 'Pendaftaran Online dan Pantauan Kas Sekolah | SekolahRapi',
    description,
  },
  twitter: {
    card: 'summary',
    title: 'Aplikasi Administrasi Sekolah | SekolahRapi',
    description,
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: APP_NAME,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: APP_URL,
  description,
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <LandingPage />
    </>
  );
}
