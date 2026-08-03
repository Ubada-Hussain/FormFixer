'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { triggerCreditRefresh } from '@/components/CreditMeter';

type Mode = 'img2pdf' | 'pdf2word' | 'word2pdf';

interface FileEntry {
  file: File;
  id: number;
}

let nextId = 0;

/** Credit cost for document conversion: 300 cr/MB, minimum 500 */
function calcConvertCost(fileSizeBytes: number): number {
  const mb = fileSizeBytes / (1024 * 1024);
  return Math.max(500, Math.ceil(mb * 300));
}

/** Total cost for a list of image files (img2pdf) */
function calcImg2PdfCost(entries: FileEntry[]): number {
  const totalBytes = entries.reduce((sum, e) => sum + e.file.size, 0);
  return calcConvertCost(totalBytes);
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

export default function ConvertPage() {
  const [mode, setMode] = useState<Mode>('img2pdf');
  const [fileEntries, setFileEntries] = useState<FileEntry[]>([]);
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');
  const [isRtlError, setIsRtlError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [isDrag, setIsDrag] = useState(false);

  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const singleFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/usage')
      .then((r) => r.json())
      .then((d) => {
        const rem = d.credits_remaining ?? d.remaining ?? null;
        if (typeof rem === 'number') setCreditsRemaining(rem);
      })
      .catch(() => {});
  }, []);

  const addFiles = useCallback((fileList: FileList) => {
    const entries: FileEntry[] = [];
    Array.from(fileList).forEach((f) => {
      if (f.type.startsWith('image/')) entries.push({ file: f, id: nextId++ });
    });
    setFileEntries((prev) => [...prev, ...entries]);
  }, []);

  const removeFile = (id: number) =>
    setFileEntries((prev) => prev.filter((e) => e.id !== id));

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDrag(false);
      if (mode === 'img2pdf') addFiles(e.dataTransfer.files);
      else if (e.dataTransfer.files.length) setSingleFile(e.dataTransfer.files[0]);
    },
    [mode, addFiles]
  );

  /** Deduct credits, returns true on success, false if insufficient */
  const deductCredits = useCallback(async (cost: number): Promise<boolean> => {
    const usageRes = await fetch('/api/usage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cost }),
    });

    if (usageRes.status === 403) {
      const d = await usageRes.json();
      setToastMsg(d.error ?? 'Not enough credits to complete this conversion.');
      return false;
    }

    const ud = await usageRes.json();
    if (typeof ud.credits_remaining === 'number') setCreditsRemaining(ud.credits_remaining);
    triggerCreditRefresh();
    return true;
  }, []);

  // ── 1. Client-side Images → PDF ───────────────────────────────────────────
  const makePdfFromImages = useCallback(async () => {
    if (!fileEntries.length) return;
    setBusy(true);
    setStatus('Checking credits…');

    try {
      const cost = calcImg2PdfCost(fileEntries);
      const ok = await deductCredits(cost);
      if (!ok) { setBusy(false); setStatus(''); return; }

      setStatus('Building PDF…');
      const { PDFDocument } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.create();
      for (const entry of fileEntries) {
        const bytes = await entry.file.arrayBuffer();
        const img = entry.file.type === 'image/png'
          ? await pdfDoc.embedPng(bytes)
          : await pdfDoc.embedJpg(bytes);
        const page = pdfDoc.addPage([img.width, img.height]);
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
      }
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'formfixer-document.pdf';
      a.click();
      const n = fileEntries.length;
      setStatus(`PDF downloaded — ${n} page${n > 1 ? 's' : ''}.`);
    } catch (err) {
      setStatus('Something went wrong during PDF creation.');
      console.error(err);
    } finally {
      setBusy(false);
    }
  }, [fileEntries, deductCredits]);

  // ── 2. Server-side conversions (PDF→Word, Word→PDF) ──────────────────────
  const runServerConversion = useCallback(async () => {
    if (!singleFile) return;
    setBusy(true);
    setIsRtlError(false);

    const label =
      mode === 'pdf2word'
        ? 'Converting PDF to Word — this may take 10–30 seconds…'
        : 'Converting Word to PDF…';
    setStatus(label);

    try {
      const cost = calcConvertCost(singleFile.size);
      const ok = await deductCredits(cost);
      if (!ok) { setBusy(false); setStatus(''); return; }

      const body = new FormData();
      body.append('file', singleFile);

      const res = await fetch('/api/convert', { method: 'POST', body });

      if (!res.ok) {
        let msg = 'Conversion failed.';
        let rtlErr = false;
        try {
          const json = await res.json();
          msg = json.error ?? msg;
          rtlErr = !!json.isRtlUnsupported;
        } catch { /* non-JSON */ }

        if (rtlErr) {
          setIsRtlError(true);
          throw new Error(msg);
        }
        throw new Error(msg);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      let dlName = mode === 'pdf2word'
        ? singleFile.name.replace(/\.pdf$/i, '') + '-converted.docx'
        : singleFile.name.replace(/\.(docx?|doc)$/i, '') + '-converted.pdf';

      const disp = res.headers.get('content-disposition');
      if (disp) {
        const m = disp.match(/filename="?([^"]+)"?/);
        if (m?.[1]) dlName = m[1];
      }

      const a = document.createElement('a');
      a.href = url;
      a.download = dlName;
      a.click();

      setStatus(`Downloaded: ${dlName}`);
    } catch (err) {
      const e = err as Error;
      console.error(e);
      setStatus(e.message || 'Conversion failed. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [singleFile, mode, deductCredits]);

  // ── Helper: clear file state when switching tabs ───────────────────────────
  const switchMode = (m: Mode) => {
    setMode(m);
    setSingleFile(null);
    setStatus('');
    setIsRtlError(false);
  };

  // Compute estimated cost for UI
  const estimatedCost = (() => {
    if (mode === 'img2pdf' && fileEntries.length > 0) return calcImg2PdfCost(fileEntries);
    if ((mode === 'pdf2word' || mode === 'word2pdf') && singleFile) return calcConvertCost(singleFile.size);
    return null;
  })();

  return (
    <>
      {toastMsg && (
        <CreditToast message={toastMsg} onClose={() => setToastMsg(null)} />
      )}

      <header className="page-hero">
        <div className="wrap">
          <span className="tag">File converter</span>
          <h1>
            Get the file format the portal <em>actually</em> asks for.
          </h1>
          <p>
            Combine photos into one PDF, convert a PDF to an editable Word file, or convert a
            Word document to PDF — all processed on our servers using real conversion engines.
          </p>
        </div>
      </header>

      <section id="tool" style={{ paddingTop: 24 }}>
        <div className="wrap">
          {/* Mode tabs */}
          <div className="modes">
            <button
              className={`mode-btn${mode === 'img2pdf' ? ' active' : ''}`}
              onClick={() => switchMode('img2pdf')}
            >
              Images to PDF
            </button>
            <button
              className={`mode-btn${mode === 'pdf2word' ? ' active' : ''}`}
              onClick={() => switchMode('pdf2word')}
            >
              PDF to Word
            </button>
            <button
              className={`mode-btn${mode === 'word2pdf' ? ' active' : ''}`}
              onClick={() => switchMode('word2pdf')}
            >
              Word to PDF
            </button>
          </div>

          {/* Credit info strip */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            {creditsRemaining !== null && (
              <span style={{
                fontSize: 12, fontWeight: 500,
                color: creditsRemaining < 500 ? 'var(--coral-700)' : 'var(--ink-soft)',
              }}>
                ⚡ {creditsRemaining.toLocaleString('en-US')} credits remaining today
              </span>
            )}
            {estimatedCost !== null && (
              <span style={{
                fontSize: 12, fontWeight: 600,
                background: 'var(--teal-100)', color: 'var(--teal-700)',
                borderRadius: 8, padding: '4px 10px',
              }}>
                This conversion: {estimatedCost.toLocaleString('en-US')} credits
              </span>
            )}
          </div>

          {/* ── Images to PDF ─────────────────────────────────────────────── */}
          {mode === 'img2pdf' && (
            <div id="panel-img2pdf">
              <div
                className={`dropzone${isDrag ? ' drag' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDrag(true); }}
                onDragLeave={() => setIsDrag(false)}
                onDrop={onDrop}
              >
                <h3>Drop one or more photos here</h3>
                <p>or click to browse — JPG or PNG combined into a single PDF</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png"
                  multiple
                  onChange={(e) => { if (e.target.files) addFiles(e.target.files); }}
                />
              </div>

              <div className="filelist">
                {fileEntries.map((entry) => (
                  <div key={entry.id} className="filerow">
                    <span>
                      {entry.file.name}{' '}
                      <span style={{ color: 'var(--ink-faint)' }}>
                        ({(entry.file.size / 1024).toFixed(0)} KB)
                      </span>
                    </span>
                    <button type="button" className="rm" onClick={() => removeFile(entry.id)}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="action-row">
                <button
                  id="makePdfBtn"
                  className="btn btn-primary"
                  disabled={fileEntries.length === 0 || busy}
                  onClick={makePdfFromImages}
                >
                  {busy ? 'Building PDF…' : 'Create PDF'}
                </button>
                {status && <span className="status-line show">{status}</span>}
              </div>
            </div>
          )}

          {/* ── PDF to Word ────────────────────────────────────────────────── */}
          {mode === 'pdf2word' && (
            <div id="panel-pdf2word">
              <div
                className={`dropzone${isDrag ? ' drag' : ''}`}
                onClick={() => singleFileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDrag(true); }}
                onDragLeave={() => setIsDrag(false)}
                onDrop={onDrop}
              >
                <h3>{singleFile ? singleFile.name : 'Drop a PDF document here'}</h3>
                <p>
                  or click to browse — converts PDF to an editable Word (.docx) file using
                  pdf2docx (takes 10–30 seconds for larger files)
                </p>
                <input
                  type="file"
                  ref={singleFileInputRef}
                  accept=".pdf,application/pdf"
                  onChange={(e) => { if (e.target.files?.length) setSingleFile(e.target.files[0]); }}
                />
              </div>
              <div className="action-row">
                <button
                  className="btn btn-primary"
                  disabled={!singleFile || busy}
                  onClick={runServerConversion}
                >
                  {busy ? 'Converting — please wait…' : 'Convert PDF to Word'}
                </button>
                {status && (
                  <span
                    className={`status-line show ${isRtlError ? 'text-blue-600 bg-blue-50 border border-blue-200 py-3 px-4 rounded-xl mt-4 block whitespace-pre-wrap leading-relaxed' : ''}`}
                    style={isRtlError ? { color: 'var(--ink)' } : undefined}
                  >
                    {status}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ── Word to PDF ────────────────────────────────────────────────── */}
          {mode === 'word2pdf' && (
            <div id="panel-word2pdf">
              <div
                className={`dropzone${isDrag ? ' drag' : ''}`}
                onClick={() => singleFileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDrag(true); }}
                onDragLeave={() => setIsDrag(false)}
                onDrop={onDrop}
              >
                <h3>{singleFile ? singleFile.name : 'Drop a Word document here'}</h3>
                <p>
                  or click to browse — converts Word (.docx) to PDF via LibreOffice on our
                  servers (takes a few seconds)
                </p>
                <input
                  type="file"
                  ref={singleFileInputRef}
                  accept=".docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => { if (e.target.files?.length) setSingleFile(e.target.files[0]); }}
                />
              </div>
              <div className="action-row">
                <button
                  className="btn btn-primary"
                  disabled={!singleFile || busy}
                  onClick={runServerConversion}
                >
                  {busy ? 'Converting — please wait…' : 'Convert Word to PDF'}
                </button>
                {status && <span className="status-line show">{status}</span>}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
