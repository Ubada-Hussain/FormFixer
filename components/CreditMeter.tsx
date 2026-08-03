'use client';

import { useEffect, useState, useCallback } from 'react';

const DAILY_CREDITS = 5000;
const POLL_INTERVAL_MS = 60_000; // refresh every 60s

interface CreditData {
  credits_remaining: number;
  credits_used: number;
  daily_limit: number;
  isPro?: boolean;
}

// Exported so CompressClient and ConvertClient can trigger a refresh
let globalRefreshFn: (() => void) | null = null;
export function triggerCreditRefresh() {
  globalRefreshFn?.();
}

function formatCredits(n: number): string {
  return n.toLocaleString('en-US');
}

function getArcColor(remaining: number): { stroke: string; glow: string } {
  if (remaining > 2000) return { stroke: '#1D9E75', glow: 'rgba(29,158,117,0.35)' };
  if (remaining > 500) return { stroke: '#D4A017', glow: 'rgba(212,160,23,0.35)' };
  return { stroke: '#D85A30', glow: 'rgba(216,90,48,0.4)' };
}

export default function CreditMeter() {
  const [data, setData] = useState<CreditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const fetchCredits = useCallback(async () => {
    try {
      const res = await fetch('/api/usage');
      if (!res.ok) return;
      const json = await res.json();
      setData({
        credits_remaining: json.credits_remaining ?? json.remaining ?? DAILY_CREDITS,
        credits_used: json.credits_used ?? 0,
        daily_limit: json.daily_limit ?? DAILY_CREDITS,
        isPro: json.isPro,
      });
    } catch {
      // silently fail — don't block UI
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    globalRefreshFn = fetchCredits;
    fetchCredits();
    const interval = setInterval(fetchCredits, POLL_INTERVAL_MS);
    return () => {
      clearInterval(interval);
      globalRefreshFn = null;
    };
  }, [fetchCredits]);

  if (loading || !data) return null;

  const remaining = data.isPro ? DAILY_CREDITS : data.credits_remaining;
  const limit = data.daily_limit || DAILY_CREDITS;
  const pct = Math.max(0, Math.min(1, remaining / limit));
  const { stroke, glow } = getArcColor(remaining);

  // SVG arc math
  const size = 36;
  const cx = size / 2;
  const cy = size / 2;
  const r = 13;
  const circumference = 2 * Math.PI * r;
  const dash = pct * circumference;

  return (
    <div style={{ position: 'relative' }}>
      <button
        id="credit-meter-btn"
        onClick={() => setPopoverOpen((v) => !v)}
        aria-label={`${formatCredits(remaining)} credits remaining`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 6px',
          borderRadius: 10,
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(22,36,31,0.06)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
      >
        {/* Arc ring */}
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', flexShrink: 0 }}>
          {/* Glow filter */}
          <defs>
            <filter id="cm-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Track */}
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke="rgba(22,36,31,0.12)"
            strokeWidth="2.5"
          />

          {/* Progress arc */}
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={stroke}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
            strokeDashoffset={0}
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{
              transition: 'stroke-dasharray 0.6s ease, stroke 0.4s ease',
              filter: `drop-shadow(0 0 3px ${glow})`,
            }}
          />

          {/* Inner lightning bolt icon */}
          <text
            x={cx} y={cy + 1}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="9"
            fill={stroke}
            style={{ userSelect: 'none', fontFamily: 'system-ui', transition: 'fill 0.4s ease' }}
          >
            ⚡
          </text>
        </svg>

        {/* Credit count label */}
        <span style={{
          fontSize: 12,
          fontWeight: 600,
          color: remaining < 500 ? '#D85A30' : 'var(--ink-soft)',
          fontVariantNumeric: 'tabular-nums',
          transition: 'color 0.3s ease',
          letterSpacing: '-0.01em',
        }}>
          {data.isPro ? '∞' : formatCredits(remaining)}
        </span>
      </button>

      {/* Popover */}
      {popoverOpen && (
        <>
          {/* Backdrop */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 99 }}
            onClick={() => setPopoverOpen(false)}
          />
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            zIndex: 100,
            background: '#fff',
            border: '1px solid rgba(22,36,31,0.13)',
            borderRadius: 16,
            padding: '20px 22px',
            width: 240,
            boxShadow: '0 8px 32px rgba(22,36,31,0.12)',
            animation: 'cm-pop 0.15s ease',
          }}>
            <style>{`
              @keyframes cm-pop {
                from { opacity: 0; transform: translateY(-6px) scale(0.97); }
                to   { opacity: 1; transform: translateY(0) scale(1); }
              }
            `}</style>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>
                Daily Credits
              </span>
              {data.isPro && (
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  background: 'var(--teal-100)', color: 'var(--teal-700)',
                  borderRadius: 6, padding: '2px 7px',
                }}>Pro ∞</span>
              )}
            </div>

            {/* Bar */}
            <div style={{
              height: 7, borderRadius: 10,
              background: 'rgba(22,36,31,0.08)',
              overflow: 'hidden', marginBottom: 10,
            }}>
              <div style={{
                height: '100%',
                width: `${pct * 100}%`,
                borderRadius: 10,
                background: stroke,
                boxShadow: `0 0 6px ${glow}`,
                transition: 'width 0.6s ease, background 0.4s ease',
              }} />
            </div>

            <div style={{ fontSize: 12, color: 'var(--ink-soft)', display: 'flex', justifyContent: 'space-between' }}>
              <span>{data.isPro ? '∞' : formatCredits(remaining)} left</span>
              <span>{formatCredits(limit)} / day</span>
            </div>

            <div style={{
              marginTop: 14, paddingTop: 12,
              borderTop: '1px solid rgba(22,36,31,0.09)',
              fontSize: 11, color: 'var(--ink-faint)', lineHeight: 1.5,
            }}>
              Resets at midnight PKT · Compress costs 150 cr/MB (min 300) · Convert costs 300 cr/MB (min 500)
            </div>
          </div>
        </>
      )}
    </div>
  );
}
