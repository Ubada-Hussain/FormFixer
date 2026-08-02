'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PRESETS } from '@/lib/presets';

export default function PresetsPage() {
  const [query, setQuery] = useState('');

  const filtered = query
    ? PRESETS.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    : PRESETS;

  return (
    <>
      <header className="page-hero">
        <div className="wrap">
          <span className="tag">Portal presets</span>
          <h1>Search the form. We&apos;ll fill in the spec.</h1>
          <p>
            Every preset here sets the exact file size limit a portal expects, so you don&apos;t
            have to hunt for it in a help page.
          </p>
        </div>
      </header>

      <section style={{ paddingTop: 12 }}>
        <div className="wrap">
          <div className="search-bar">
            <svg viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              id="search"
              placeholder="Search for a scholarship or admission portal"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {filtered.length === 0 ? (
            <div className="empty show">
              No presets match that search yet — try the manual compressor instead.
            </div>
          ) : (
            <div className="preset-grid" id="grid">
              {filtered.map((p) => (
                <div key={p.name} className="preset-card">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-semibold text-[var(--ink)]">{p.name}</h3>
                    {p.verified && (
                      <span className="text-[11px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <div className="spec-row">
                    <span>Max File Size</span>
                    <span>{p.kb} KB</span>
                  </div>
                  <Link href={`/presets/${p.slug}`} className="go">
                    View Requirements &rarr;
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
