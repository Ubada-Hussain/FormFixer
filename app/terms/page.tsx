import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'FormFixer Terms of Service and acceptable use.',
};

export default function TermsPage() {
  return (
    <>
      <header className="page-hero">
        <div className="wrap">
          <span className="tag">Terms of Service</span>
          <h1>Rules of the road.</h1>
        </div>
      </header>

      <section style={{ paddingTop: 24, paddingBottom: 120 }}>
        <div className="wrap">
          <div className="max-w-3xl story">
            <div className="bg-[var(--coral-100)] text-[var(--coral-700)] p-4 rounded-lg mb-8 text-sm font-medium border border-[var(--coral-200)]">
              <strong>Disclaimer:</strong> This is a standard template for the FormFixer tool. It has not been reviewed by a lawyer and does not constitute formal legal advice.
            </div>

            <h3 className="text-xl font-bold font-[Georgia] text-[var(--ink)] mt-10 mb-4">1. Acceptable Use</h3>
            <p>
              FormFixer is designed to help you prepare your own personal documents, photos, and forms for upload. You agree not to use the service to process illegal materials, distribute malware, bypass security protocols, or attempt to reverse-engineer our conversion infrastructure.
            </p>

            <h3 className="text-xl font-bold font-[Georgia] text-[var(--ink)] mt-10 mb-4">2. Free Tier Limits</h3>
            <p>
              We provide a generous free tier to help students and applicants. This tier is strictly limited to 5 combined conversion/compression actions per calendar day per user. Attempting to bypass these limits via automated scripts or multiple burner accounts is a violation of these terms and may result in an IP or account ban.
            </p>

            <h3 className="text-xl font-bold font-[Georgia] text-[var(--ink)] mt-10 mb-4">3. Pro Subscription</h3>
            <p>
              Users who require unlimited daily processing may upgrade to the Pro tier. The Pro subscription is billed on a recurring basis. You may cancel at any time through the billing portal. Upon cancellation, you will retain your Pro benefits until the end of your current billing cycle, after which your account will revert to the standard 5-action daily limit.
            </p>

            <h3 className="text-xl font-bold font-[Georgia] text-[var(--ink)] mt-10 mb-4">4. Liability</h3>
            <p>
              We strive to provide accurate compression sizes and perfect document formatting. However, FormFixer is provided &quot;as is&quot; without warranties of any kind. You are solely responsible for reviewing your processed documents before submitting them to any official portal or authority. We are not liable for rejected applications resulting from converted documents.
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
