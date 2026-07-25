import type { Metadata } from 'next';
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'FormFixer pricing — 5 free compress or convert actions every day. Upgrade to Pro for unlimited daily actions.',
};

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default function PricingPage() {
  const { sessionClaims } = auth();
  const isPro = sessionClaims?.metadata?.isPro === true;

  return (
    <>
      <header className="page-hero">
        <div className="wrap">
          <span className="tag">Pricing</span>
          <h1>Free for the fix you need today.</h1>
          <p>
            5 free compress or convert actions per day, with every feature included. Upgrade to
            Pro for unlimited daily actions.
          </p>
        </div>
      </header>

      <section style={{ paddingTop: 12 }}>
        <div className="wrap">
          <div className="plans">
            {/* Free plan */}
            <div className="plan">
              <h3>Free</h3>
              <div className="price">$0</div>
              <p className="desc">Everything most applications need every day.</p>
              <ul>
                <li><CheckIcon />5 compress or convert actions per day, every feature included</li>
                <li><CheckIcon />All university portal presets</li>
                <li><CheckIcon />Images to PDF</li>
                <li><CheckIcon />English PDF to Word & Word to PDF</li>
                <li><CheckIcon />On-device processing, zero ads</li>
              </ul>
              <Link href="/compress" className="btn btn-ghost">
                Start for free
              </Link>
            </div>

            {/* Pro plan */}
            <div className="plan featured">
              <span className="badge">Most useful for heavy applications</span>
              <h3>Pro</h3>
              <div className="price">$4<span>/month</span></div>
              <p className="desc">For power users processing large batches of files every day.</p>
              <ul>
                <li><CheckIcon />Unlimited compress and convert actions, every day</li>
                <li><CheckIcon />All university portal presets</li>
                <li><CheckIcon />Images to PDF</li>
                <li><CheckIcon />English PDF to Word & Word to PDF</li>
                <li><CheckIcon />Priority processing, zero daily limits</li>
              </ul>
              {isPro ? (
                <button className="btn btn-primary" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                  ✓ You are on Pro
                </button>
              ) : (
                <button className="btn btn-primary" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                  Upgrade to Pro (Coming soon)
                </button>
              )}
            </div>
          </div>

          {/* FAQ */}
          <div className="faq">
            <div className="faq-item">
              <h4>How does the daily 5-action limit work?</h4>
              <p>
                Every logged-in account gets 5 free actions per calendar day across both file
                compression and file conversion combined (e.g. 3 compresses + 2 converts = 5 total
                actions). Your counter resets automatically at midnight.
              </p>
            </div>
            <div className="faq-item">
              <h4>Can I cancel Pro anytime?</h4>
              <p>
                Yes — Pro is month-to-month with no lock-in. Cancel anytime and you&apos;ll keep 5
                free daily actions on the Free tier.
              </p>
            </div>
            <div className="faq-item">
              <h4>Do you show ads on the Free plan?</h4>
              <p>No. FormFixer never shows ads or popups on any plan, free or paid.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
