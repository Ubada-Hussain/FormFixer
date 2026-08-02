import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'Compress Photo for Scholarship & Admission Forms — FormFixer',
  description: 'Easily compress photos and convert documents to the exact size and format required by scholarship and admission forms. Free, secure, and instant.',
};

export default function Page() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'FormFixer',
    operatingSystem: 'Any',
    applicationCategory: 'UtilitiesApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description:
      'Compress photos and convert documents to the precise size a portal demands — no guesswork, no sketchy tools.',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient />
    </>
  );
}
