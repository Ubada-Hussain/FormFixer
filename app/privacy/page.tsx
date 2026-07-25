import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How FormFixer protects your data and documents.',
};

export default function PrivacyPage() {
  return (
    <>
      <header className="page-hero">
        <div className="wrap">
          <span className="tag">Privacy Policy</span>
          <h1>Honest Data Practices.</h1>
        </div>
      </header>

      <section style={{ paddingTop: 24, paddingBottom: 120 }}>
        <div className="wrap">
          <div className="max-w-3xl story">
            <p>
              At FormFixer, our entire philosophy is built around a secure and private utility. We don't want your data, and we don't have ad slots to sell to third parties. Here is exactly what we collect and how it is used.
            </p>

            <h3 className="text-xl font-bold font-[Georgia] text-[var(--ink)] mt-10 mb-4">1. Document Processing</h3>
            <p>
              <strong>Image & Photo Compression:</strong> All photo compressions and Image-to-PDF operations are executed 100% on your device directly within your browser. Your images are never uploaded to any server.
            </p>
            <p>
              <strong>Document Conversion (Word / PDF):</strong> Complex formatting conversions (PDF to Word, and Word to PDF) require our server-side conversion engines. When you convert a document, it is securely transmitted over HTTPS to our isolated microservices. <strong>The document is processed entirely in memory, returned to you, and deleted immediately after.</strong> We do not log, read, or store the contents of your uploaded documents.
            </p>

            <h3 className="text-xl font-bold font-[Georgia] text-[var(--ink)] mt-10 mb-4">2. Account Information & Usage Logging</h3>
            <p>
              We use Clerk to securely handle authentication. If you create an account, Clerk stores the basic information you provide (like your email address or Google profile). FormFixer does not have access to your passwords.
            </p>
            <p>
              To enforce our free tier limit, we log a simple numeric counter of your daily actions associated with your user ID in a secure Supabase database. We do not log what files you processed, only that an action occurred.
            </p>

            <h3 className="text-xl font-bold font-[Georgia] text-[var(--ink)] mt-10 mb-4">3. Payment Data</h3>
            <p>
              All payments and subscriptions are processed by our secure, third-party payment gateway (upcoming). FormFixer does not process, touch, or store your credit card or bank details. We only receive a secure webhook confirming your subscription status.
            </p>

            <h3 className="text-xl font-bold font-[Georgia] text-[var(--ink)] mt-10 mb-4">4. No Data Selling & No Ads</h3>
            <p>
              We absolutely do not sell, rent, or trade your personal information or document history to any third parties. FormFixer is entirely ad-free.
            </p>

            <p className="mt-12 text-sm text-[var(--ink-faint)]">
              Last Updated: July 2026
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
