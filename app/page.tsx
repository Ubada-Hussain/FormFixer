'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { MARQUEE_NAMES } from '@/lib/presets';

export default function HomePage() {
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Build marquee pills
    if (marqueeRef.current) {
      const names = [...MARQUEE_NAMES, ...MARQUEE_NAMES];
      marqueeRef.current.innerHTML = '';
      names.forEach((name) => {
        const pill = document.createElement('div');
        pill.className = 'pill';
        pill.innerHTML = '<span class="swatch"></span>' + name;
        marqueeRef.current!.appendChild(pill);
      });
    }

    // Reveal on scroll
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

    // Counter animation
    let counted = false;
    const statsIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !counted) {
            counted = true;
            document.querySelectorAll<HTMLElement>('.counter').forEach((c) => {
              const target = parseInt(c.dataset.target || '0', 10);
              const suffix = c.dataset.suffix || '';
              let startTime: number | null = null;
              const duration = 1100;
              function step(ts: number) {
                if (!startTime) startTime = ts;
                const progress = Math.min((ts - startTime) / duration, 1);
                c.textContent = Math.round(target * progress) + suffix;
                if (progress < 1) requestAnimationFrame(step);
              }
              requestAnimationFrame(step);
            });
          }
        });
      },
      { threshold: 0.4 }
    );
    document.querySelectorAll('.stats-band').forEach((el) => statsIo.observe(el));

    return () => {
      io.disconnect();
      statsIo.disconnect();
    };
  }, []);

  return (
    <>
      <header className="hero">
        <div className="wrap hero-grid">
          <div>
            <span className="eyebrow">
              <span className="dot animate-pulse-dot" />
              No ads. No sign-up needed.
            </span>
            <h1>
              Turn your files into <em>exactly</em> what the form wants.
            </h1>
            <p className="lede">
              Compress photos and convert documents to the precise size a portal demands — no
              guesswork, no sketchy tools, no popups telling you it&apos;s still too big.
            </p>
            <div className="hero-actions">
              <Link href="/compress" className="btn btn-primary">
                Fix a file free
              </Link>
              <Link href="/presets" className="btn btn-ghost">
                See supported portals
              </Link>
            </div>
            <p className="hero-note">
              Compression happens 100% on your device. Document conversion is processed securely on our servers and deleted immediately after.
            </p>
          </div>

          <div className="demo-stage">
            {/* Floating decorative SVGs */}
            <span className="floaty f1 animate-drift-1">
              <svg viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                <path d="M14 2v6h6" />
              </svg>
            </span>
            <span className="floaty f2 animate-drift-2">
              <svg viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </span>
            <span className="floaty f3 animate-drift-3">
              <svg viewBox="0 0 24 24">
                <path d="M4 4h16v16H4z" />
                <path d="M4 9h16M9 4v16" />
              </svg>
            </span>

            <div className="demo-frame">
              <div className="target-label">200 × 230 · under 200KB</div>
              <div className="target-outline animate-frame-pulse" />
              <div className="photo-card animate-photo-fit" />
              <div className="check-badge animate-check-pop">
                <svg viewBox="0 0 24 24">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <span className="ruler-tick rt-w">230px</span>
              <span className="ruler-tick rt-h">200px</span>
            </div>
          </div>
        </div>
      </header>

      <div className="wrap">
        <div className="divider" />
      </div>

      {/* How it works */}
      <section id="how">
        <div className="wrap">
          <div className="section-head">
            <span className="tag">How it works</span>
            <h2>Three steps. No dashboard to get lost in.</h2>
            <p>
              You already have enough forms to fill out. Fixing the file shouldn&apos;t be one
              more chore.
            </p>
          </div>
          <div className="steps">
            <div className="step-card reveal">
              <span className="step-num">step 1</span>
              <div className="step-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                </svg>
              </div>
              <h3>Drop your file</h3>
              <p>
                A photo, signature, or PDF — dragged in or picked from your phone, no account
                required.
              </p>
            </div>
            <div className="step-card reveal">
              <span className="step-num">step 2</span>
              <div className="step-icon">
                <svg viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
              <h3>Pick the portal</h3>
              <p>
                Search your scholarship or admission form, and we set the exact size and format
                automatically.
              </p>
            </div>
            <div className="step-card reveal">
              <span className="step-num">step 3</span>
              <div className="step-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <path d="M7 10l5 5 5-5M12 15V3" />
                </svg>
              </div>
              <h3>Download and go</h3>
              <p>
                A correctly sized file lands in seconds. Upload it and get back to the rest of
                the application.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Portal presets marquee */}
      <section id="presets">
        <div className="wrap">
          <div className="section-head">
            <span className="tag">Portal presets</span>
            <h2>Already tuned to the forms you&apos;re filling out.</h2>
            <p>
              Search a growing library of scholarship and admission portals — the exact spec is
              filled in for you.
            </p>
          </div>
        </div>
        <div className="marquee-wrap">
          <div className="marquee animate-scroll-left" ref={marqueeRef} />
        </div>
      </section>

      {/* Features */}
      <section id="features">
        <div className="wrap">
          <div className="section-head">
            <span className="tag">Why FormFit</span>
            <h2>Everything the other compressors got wrong, fixed.</h2>
          </div>
          <div className="features">
            <div className="feature reveal">
              <div className="ic">
                <svg viewBox="0 0 24 24">
                  <rect x="4" y="10" width="16" height="10" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>
              </div>
              <h3>Private by design</h3>
              <p>Compression runs right in your browser. Your ID photo never leaves your device.</p>
            </div>
            <div className="feature reveal">
              <div className="ic">
                <svg viewBox="0 0 24 24">
                  <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
                </svg>
              </div>
              <h3>Instant results</h3>
              <p>No queues, no waiting on a server. See the fixed file the moment you drop it in.</p>
            </div>
            <div className="feature reveal">
              <div className="ic">
                <svg viewBox="0 0 24 24">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              </div>
              <h3>Exact specs, matched</h3>
              <p>Set a target once and every file lands inside it — dimensions and file size both.</p>
            </div>
            <div className="feature reveal">
              <div className="ic">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m4.9 4.9 14.2 14.2" />
                </svg>
              </div>
              <h3>Zero ads, ever</h3>
              <p>No pop-ups, no fake download buttons. Just the tool you came for.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section>
        <div className="wrap">
          <div className="stats-band">
            <div className="stat reveal">
              <div className="num">
                <span className="counter" data-target="20" data-suffix="+">0</span>
              </div>
              <div className="label">portal presets</div>
            </div>
            <div className="stat reveal">
              <div className="num">
                <span className="counter" data-target="100" data-suffix="%">0</span>
              </div>
              <div className="label">secure processing</div>
            </div>
            <div className="stat reveal">
              <div className="num">
                <span className="counter" data-target="0" data-suffix="">0</span>
              </div>
              <div className="label">ads shown, ever</div>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="closing">
        <div className="wrap">
          <h2>Stop fighting the upload button.</h2>
          <Link href="/compress" className="btn btn-primary">
            Fix your first file free
          </Link>
        </div>
      </section>
    </>
  );
}
