import type { Metadata } from "next";
import LandingPage from "./landing-page";
import { APP_NAME, APP_URL } from "@/shared/constants";

const description =
  "Hubungkan pendaftaran siswa, SPP, kas, dan pekerjaan admin dalam satu web app agar tim tidak terus menyalin data dan owner tidak menunggu rekap.";

export const metadata: Metadata = {
  title: 'Aplikasi Administrasi Sekolah',
  description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: APP_NAME,
    title: 'Pendaftaran, SPP, dan Kas dalam Satu Alur | SekolahRapi',
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
