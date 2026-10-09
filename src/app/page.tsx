import type { Metadata } from "next";
import LandingPage, { faqs } from "./landing-page";
import { APP_NAME, APP_URL } from "@/shared/constants";

const description =
  "Aplikasi administrasi sekolah: pendaftaran, SPP, dan kas dalam satu web app, plus Tanya Arblok yang menjawab pertanyaan fitur dan harga 24 jam.";

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

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: {
      "@type": "Answer",
      text: answer,
    },
  })),
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <LandingPage />
    </>
  );
}
