'use client';

import { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'true');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="mx-auto max-w-wrap flex flex-col sm:flex-row items-center justify-between gap-4 rounded-lg bg-paper p-4 shadow-[0_4px_24px_rgba(22,36,31,0.08)] border border-line">
        <p className="text-sm text-ink-soft">
          We use cookies to understand site usage.
        </p>
        <button
          onClick={acceptCookies}
          className="whitespace-nowrap rounded-md bg-teal-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-offset-2"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
