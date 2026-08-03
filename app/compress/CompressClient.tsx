'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { PRESET_SELECT_OPTIONS } from '@/lib/presets';
import { triggerCreditRefresh, updateCreditMeter } from '@/components/CreditMeter';

/** Credit cost for image compression: 150 cr/MB, minimum 300 */
function calcCompressCost(fileSizeBytes: number): number {
  const mb = fileSizeBytes / (1024 * 1024);
  return Math.max(300, Math.ceil(mb * 150));
}

// ── Toast helper ─────────────────────────────────────────────────────────────
function CreditToast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, maxWidth: 380, width: '90vw',
      background: '#fff',
      border: '1px solid var(--coral-200)',
      borderRadius: 14,
      padding: '14px 18px',
      boxShadow: '0 8px 32px rgba(22,36,31,0.14)',
      display: 'flex', alignItems: 'flex-start', gap: 12,
      animation: 'toast-in 0.2s ease',
    }}>
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateX(-50%) translateY(12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
      <span style={{ fontSize: 20, lineHeight: 1 }}>⚡</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--coral-700)', marginBottom: 3 }}>
          Not enough credits
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
          {message}
        </div>
      </div>
      <button
        onClick={onClose}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--ink-faint)', lineHeight: 1, padding: 0 }}
        aria-label="Dismiss"
      >✕</button>
    </div>
  );
}

export default function CompressPage() {
  // Store File in a ref — never stale, safe from React Concurrent Mode copies
  const fileRef = useRef<File | null>(null);
  const originalUrlRef = useRef<string | null>(null);
  const compressedUrlRef = useRef<string | null>(null);
  const [hasFile, setHasFile] = useState(false);
  const [origUrl, setOrigUrl] = useState('');
  const [origKb, setOrigKb] = useState('');
  const [compUrl, setCompUrl] = useState('');
  const [compKb, setCompKb] = useState('');
  const [compKbOk, setCompKbOk] = useState(false);
  const [status, setStatus] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [busy, setBusy] = useState(false);
  const [isDrag, setIsDrag] = useState(false);
  const [targetKb, setTargetKb] = useState(200);
  const [dropzoneName, setDropzoneName] = useState('Drop a photo here');
  const [downloadHref, setDownloadHref] = useState('');

  // Credit state
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/usage')
      .then((res) => res.json())
      .then((data) => {
        const rem = data.credits_remaining ?? data.remaining ?? null;
        if (typeof rem === 'number') setCreditsRemaining(rem);
      })
      .catch((err) => console.error('Failed to load credits:', err));

    return () => {
      if (originalUrlRef.current) URL.revokeObjectURL(originalUrlRef.current);
      if (compressedUrlRef.current) URL.revokeObjectURL(compressedUrlRef.current);
    };
  }, []);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file.');
      return;
    }
    fileRef.current = file;
    setHasFile(true);
    setEstimatedCost(calcCompressCost(file.size));
    if (originalUrlRef.current) URL.revokeObjectURL(originalUrlRef.current);
    if (compressedUrlRef.current) URL.revokeObjectURL(compressedUrlRef.current);
    const url = URL.createObjectURL(file);
    originalUrlRef.current = url;
    setOrigUrl(url);
    compressedUrlRef.current = null;
    setCompUrl('');
    setCompKb('');
    setCompKbOk(false);
    setShowDownload(false);
    setOrigKb((file.size / 1024).toFixed(1) + ' KB');
    setShowPreview(true);
    setDropzoneName(file.name);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDrag(false);
      if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    },
    [handleFile]
  );

  const onPresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!e.target.value) return;
    setTargetKb(Number(e.target.value));
  };

  const compress = useCallback(async () => {
    const file = fileRef.current;
    if (!file) return;
    setBusy(true);
    setStatus('Checking credits…');

    const cost = calcCompressCost(file.size);

    try {
      // Deduct credits before running the Canvas API
      const usageRes = await fetch('/api/usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cost }),
      });

      if (usageRes.status === 403) {
        const d = await usageRes.json();
        setToastMsg(d.error ?? 'Not enough credits to compress this file.');
        setStatus('');
        setBusy(false);
        return;
      }

      const usageData = await usageRes.json();
      if (typeof usageData.credits_remaining === 'number') {
        setCreditsRemaining(usageData.credits_remaining);
        updateCreditMeter({
          credits_remaining: usageData.credits_remaining,
          credits_used: usageData.credits_used,
          daily_limit: usageData.daily_limit,
        });
      } else {
        triggerCreditRefresh();
      }

      setStatus('Compressing…');
      const objectUrl = URL.createObjectURL(file);
      const img = new Image();

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        setStatus('Could not load the image. Please try a different file.');
        setBusy(false);
      };

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            setStatus('Canvas unavailable in this browser. Please try again.');
            setBusy(false);
            return;
          }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          let quality = 0.92;
          let attempts = 0;

          const finish = (blob: Blob, kb: number, att: number) => {
            const url = URL.createObjectURL(blob);
            if (compressedUrlRef.current) URL.revokeObjectURL(compressedUrlRef.current);
            compressedUrlRef.current = url;
            setCompUrl(url);
            setCompKb(kb.toFixed(1) + ' KB');
            setCompKbOk(kb <= targetKb);
            setStatus(
              kb <= targetKb
                ? `Fit inside ${targetKb}KB after ${att} pass${att > 1 ? 'es' : ''}.`
                : `Got as low as ${kb.toFixed(1)}KB — couldn't reach ${targetKb}KB at this quality.`
            );
            setDownloadHref(url);
            setShowDownload(true);
            setBusy(false);
          };

          const tryCompress = () => {
            canvas.toBlob(
              (blob) => {
                try {
                  if (!blob) {
                    setStatus('Compression produced no output. Try a different file or format.');
                    setBusy(false);
                    return;
                  }
                  attempts++;
                  const kb = blob.size / 1024;
                  if (kb <= targetKb || quality <= 0.1 || attempts > 14) {
                    finish(blob, kb, attempts);
                  } else {
                    quality -= 0.07;
                    tryCompress();
                  }
                } catch (err) {
                  console.error('Compression loop error:', err);
                  setStatus('Compression failed. Please try again.');
                  setBusy(false);
                }
              },
              'image/jpeg',
              quality
            );
          };

          tryCompress();
        } catch (err) {
          console.error('Compression setup error:', err);
          setStatus('Compression failed. Please try again.');
          setBusy(false);
        }
      };

      img.src = objectUrl;
    } catch (err) {
      console.error('Compress action error:', err);
      setStatus('Something went wrong. Please try again.');
      setBusy(false);
    }
  }, [targetKb]);

  return (
    <>
      {toastMsg && (
        <CreditToast message={toastMsg} onClose={() => setToastMsg(null)} />
      )}

      <header className="page-hero">
        <div className="wrap">
          <span className="tag">Image compressor</span>
          <h1>
            Compress a photo to <em>exactly</em> what the form needs.
          </h1>
          <p>
            Set a target file size. Everything runs in your browser — nothing is uploaded anywhere.
          </p>
        </div>
      </header>

      <section id="tool" style={{ paddingTop: 24 }}>
        <div className="wrap">
          <div className="tool-grid">
            {/* Left: dropzone + preview */}
            <div>
              <div
                id="dropzone"
                className={`dropzone${isDrag ? ' drag' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDrag(true); }}
                onDragLeave={() => setIsDrag(false)}
                onDrop={onDrop}
              >
                <div className="ic">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                  </svg>
                </div>
                <h3>{dropzoneName}</h3>
                <p>or click to browse — JPG, PNG, or WEBP</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.length) handleFile(e.target.files[0]);
                  }}
                />
              </div>

              <div className={`preview-row${showPreview ? ' show' : ''}`}>
                <div className="preview-card">
                  <div style={{ fontSize: 12, color: 'var(--ink-faint)', marginBottom: 8 }}>
                    Original
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {origUrl && <img src={origUrl} alt="Original photo preview" />}
                  <div className="kb">{origKb}</div>
                </div>
                <div className="preview-card">
                  <div style={{ fontSize: 12, color: 'var(--ink-faint)', marginBottom: 8 }}>
                    Compressed
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {compUrl && <img src={compUrl} alt="Compressed photo preview" />}
                  <div className={`kb${compKbOk ? ' ok' : ''}`}>{compKb}</div>
                </div>
              </div>

              {status && (
                <p className="status-line show">{status}</p>
              )}

              <div className={`download-row${showDownload ? ' show' : ''}`}>
                <a className="btn btn-primary" href={downloadHref} download="compressed.jpg">
                  Download compressed file
                </a>
              </div>
            </div>

            {/* Right: settings panel */}
            <div className="panel">
              <h3>Target settings</h3>
              <div className="field">
                <label htmlFor="presetSelect">Portal preset</label>
                <select id="presetSelect" onChange={onPresetChange} defaultValue="">
                  <option value="">Custom (set below)</option>
                  {PRESET_SELECT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="targetKb">Target size (KB, max)</label>
                <input
                  type="number"
                  id="targetKb"
                  placeholder="e.g. 200"
                  value={targetKb}
                  min="1"
                  onChange={(e) => setTargetKb(Math.max(1, Number(e.target.value) || 1))}
                />
              </div>

              {/* Credit cost estimate */}
              {estimatedCost !== null && (
                <div style={{
                  marginBottom: 12, padding: '10px 14px',
                  background: 'var(--teal-100)', borderRadius: 10,
                  fontSize: 12, color: 'var(--teal-700)', fontWeight: 500,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span>⚡ Cost for this file</span>
                  <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                    {estimatedCost.toLocaleString('en-US')} credits
                  </span>
                </div>
              )}

              {creditsRemaining !== null && (
                <div style={{
                  fontSize: 12, color: creditsRemaining < 500 ? 'var(--coral-700)' : 'var(--ink-soft)',
                  fontWeight: 500, marginBottom: 14,
                }}>
                  {creditsRemaining.toLocaleString('en-US')} credits remaining today
                </div>
              )}

              <button
                id="compressBtn"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={!hasFile || busy}
                onClick={compress}
              >
                {busy ? 'Compressing…' : 'Compress file'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
