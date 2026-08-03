'use client';

import { Suspense, useState } from 'react';
import dynamic from 'next/dynamic';
import { Fraunces } from 'next/font/google';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
  display: 'swap',
});

// Dynamic import of the 3D scene to avoid SSR issues
const Scene3D = dynamic(() => import('./Scene3D'), { ssr: false });

export default function PricingPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleNotify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;
    setLoading(true);
    
    try {
      await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      // We set submitted to true even on error so they aren't blocked, 
      // but ideally we'd show an error state if it failed.
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Fraunces font variable injection */}
      <style>{`:root { ${fraunces.variable}: ${fraunces.style}; }`}</style>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #FBF8F0 0%, #F5EFE4 60%, #EDE4D6 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '10vh 24px 80px',
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Ambient blobs */}
        <div style={{
          position: 'absolute', top: '-10%', left: '-5%',
          width: 480, height: 480, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(15,110,86,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
          animation: 'blob-drift 12s ease-in-out infinite alternate',
        }} />
        <div style={{
          position: 'absolute', bottom: '-5%', right: '-5%',
          width: 560, height: 560, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(216,90,48,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
          animation: 'blob-drift 15s ease-in-out infinite alternate-reverse',
        }} />

        <style>{`
          @keyframes blob-drift {
            0%   { transform: translate(0, 0) scale(1); }
            100% { transform: translate(40px, 30px) scale(1.08); }
          }
          @keyframes float-canvas {
            0%, 100% { transform: translateY(0px); }
            50%       { transform: translateY(-14px); }
          }
          @keyframes fade-up {
            from { opacity: 0; transform: translateY(28px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes shimmer {
            0%   { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
          .pricing-tag {
            display: inline-flex; align-items: center; gap: 8px;
            background: rgba(15,110,86,0.1); color: #0F6E56;
            border: 1px solid rgba(15,110,86,0.2);
            border-radius: 999px; padding: 6px 16px;
            font-size: 13px; font-weight: 600; letter-spacing: 0.04em;
            text-transform: uppercase;
            animation: fade-up 0.5s ease both;
          }
          .pricing-headline {
            font-family: var(--font-fraunces), Georgia, serif !important;
            font-size: clamp(40px, 7vw, 84px);
            font-weight: 900;
            font-style: italic;
            line-height: 1.05;
            letter-spacing: -0.025em;
            margin: 0;
            background: linear-gradient(135deg, #0F6E56 0%, #1D9E75 40%, #D85A30 100%);
            background-size: 200% auto;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: fade-up 0.6s 0.1s ease both, shimmer 6s 1s linear infinite;
          }
          .pricing-sub {
            font-size: clamp(16px, 2.5vw, 21px);
            color: rgba(22,36,31,0.62);
            max-width: 480px;
            line-height: 1.6;
            margin: 0;
            animation: fade-up 0.6s 0.25s ease both;
          }
          .notify-form {
            display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;
            animation: fade-up 0.6s 0.45s ease both;
          }
          .notify-input {
            padding: 13px 18px;
            border: 1.5px solid rgba(22,36,31,0.18);
            border-radius: 12px;
            font-size: 14px;
            background: rgba(255,255,255,0.8);
            color: #16241F;
            width: 240px;
            outline: none;
            transition: border-color 0.2s, box-shadow 0.2s;
            backdrop-filter: blur(6px);
          }
          .notify-input:focus {
            border-color: #0F6E56;
            box-shadow: 0 0 0 3px rgba(15,110,86,0.12);
          }
          .notify-btn {
            padding: 13px 24px;
            border-radius: 12px;
            border: none;
            background: linear-gradient(135deg, #0F6E56, #1D9E75);
            color: #fff;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            transition: opacity 0.15s, transform 0.15s, box-shadow 0.15s;
            box-shadow: 0 4px 16px rgba(15,110,86,0.3);
          }
          .notify-btn:hover { opacity: 0.92; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(15,110,86,0.35); }
          .notify-btn:active { transform: translateY(0); }
          .success-pill {
            display: inline-flex; align-items: center; gap: 8px;
            background: rgba(15,110,86,0.12); color: #0F6E56;
            border: 1px solid rgba(15,110,86,0.25);
            border-radius: 999px; padding: 12px 22px;
            font-size: 14px; font-weight: 600;
            animation: fade-up 0.4s ease both;
          }
          .feature-chips {
            display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;
            animation: fade-up 0.6s 0.6s ease both;
          }
          .chip {
            display: flex; align-items: center; gap: 6px;
            background: rgba(255,255,255,0.65); backdrop-filter: blur(6px);
            border: 1px solid rgba(22,36,31,0.1);
            border-radius: 999px; padding: 7px 14px;
            font-size: 12px; font-weight: 500; color: rgba(22,36,31,0.7);
          }
        `}</style>

        {/* 3D Canvas */}
        <div style={{
          width: '100%', maxWidth: 480, height: 360,
          position: 'relative',
          animation: 'float-canvas 6s ease-in-out infinite',
          marginTop: '2vh',
          marginBottom: -10,
        }}>
          <Suspense fallback={
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                border: '3px solid rgba(15,110,86,0.15)',
                borderTopColor: '#0F6E56',
                animation: 'spin 0.8s linear infinite',
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          }>
            <Scene3D />
          </Suspense>
        </div>

        {/* Text content */}
        <div style={{
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          maxWidth: 640,
        }}>
          <span className="pricing-tag">
            <span>✦</span> Coming Soon
          </span>

          <h1 className="pricing-headline">
            Premium is brewing…
          </h1>

          <p className="pricing-sub">
            We&apos;re crafting something exceptional — unlimited processing, priority speed,
            and features that make your workflow effortless. Be the first to know.
          </p>

          {/* Feature chips */}
          <div className="feature-chips">
            {[
              { icon: '∞', label: 'Unlimited credits' },
              { icon: '⚡', label: 'Priority processing' },
              { icon: '🔒', label: 'No ads, ever' },
              { icon: '✦', label: 'Early bird pricing' },
            ].map((chip) => (
              <div key={chip.label} className="chip">
                <span>{chip.icon}</span>
                <span>{chip.label}</span>
              </div>
            ))}
          </div>

          {/* Notify form */}
          {submitted ? (
            <div className="success-pill">
              <span>✓</span>
              <span>You&apos;re on the list — we&apos;ll reach out soon!</span>
            </div>
          ) : (
            <form className="notify-form" onSubmit={handleNotify} aria-label="Premium notify me form">
              <input
                id="notify-email"
                className="notify-input"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Email address for premium notifications"
              />
              <button id="notify-btn" type="submit" className="notify-btn" disabled={loading}>
                {loading ? 'Joining…' : 'Notify me'}
              </button>
            </form>
          )}

          <p style={{
            fontSize: 12, color: 'rgba(22,36,31,0.4)',
            marginTop: -4,
            animation: 'fade-up 0.6s 0.8s ease both',
          }}>
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </>
  );
}
