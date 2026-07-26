import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import CookieBanner from '@/components/CookieBanner';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  display: 'swap',
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'FormFixer - fix your file for any form',
    template: '%s - FormFixer',
  },
  description:
    "Compress photos and convert documents to the precise size a portal demands - no guesswork, no sketchy tools, and no popups telling you it's still too big.",
};

const clerkAppearance = {
  variables: {
    colorPrimary: '#0d7c71',
    colorBackground: '#ffffff',
    colorText: '#1c2826',
    colorTextSecondary: '#62706d',
    colorInputBackground: '#faf8f5',
    colorInputText: '#1c2826',
    borderRadius: '0.75rem',
    fontFamily: 'var(--font-geist-sans), sans-serif',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const hasValidClerkKey = Boolean(
    publishableKey &&
    publishableKey.startsWith('pk_') &&
    !publishableKey.includes('YOUR_PUBLISHABLE_KEY')
  );

  const innerBody = (
    <body>
      <Navbar />
      {children}
      <Footer />
      <CookieBanner />
    </body>
  );

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      {gaMeasurementId && <GoogleAnalytics measurementId={gaMeasurementId} />}
      {hasValidClerkKey ? (
        <ClerkProvider appearance={clerkAppearance}>
          {innerBody}
        </ClerkProvider>
      ) : innerBody}
    </html>
  );
}
