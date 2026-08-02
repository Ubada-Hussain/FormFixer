'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';

type Mode = 'img2pdf' | 'pdf2word' | 'word2pdf';

interface FileEntry {
  file: File;
  id: number;
}

let nextId = 0;

export default function ConvertPage() {
  const [mode, setMode] = useState<Mode>('img2pdf');
  const [fileEntries, setFileEntries] = useState<FileEntry[]>([]);
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');
  const [isRtlError, setIsRtlError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [isDrag, setIsDrag] = useState(false);

  const [remainingActions, setRemainingActions] = useState<number | null>(null);
  const [isLimitReached, setIsLimitReached] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const singleFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/usage')
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.remaining === 'number') {
          setRemainingActions(d.remaining);
          if (d.remaining <= 0) setIsLimitReached(true);
        }
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

  // ── 1. Client-side Images → PDF ───────────────────────────────────────────
  const makePdfFromImages = useCallback(async () => {
    if (!fileEntries.length || isLimitReached) return;
    setBusy(true);
    setStatus('Checking usage limit…');

    try {
      const usageRes = await fetch('/api/usage', { method: 'POST' });
      if (usageRes.status === 403) {
        setIsLimitReached(true);
        setRemainingActions(0);
        setStatus("You've used today's 5 free actions. Come back tomorrow or upgrade to Pro.");
        return;
      }
      const ud = await usageRes.json();
      if (typeof ud.remaining === 'number') setRemainingActions(ud.remaining);

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
  }, [fileEntries, isLimitReached]);

  // ── 2. Server-side conversions (PDF→Word, Word→PDF) ──────────────────────
  const runServerConversion = useCallback(async () => {
    if (!singleFile || isLimitReached) return;
    setBusy(true);
    setIsRtlError(false);

    const label =
      mode === 'pdf2word'
        ? 'Converting PDF to Word — this may take 10–30 seconds…'
        : 'Converting Word to PDF…';
    setStatus(label);

    try {
      const body = new FormData();
      body.append('file', singleFile);

      const res = await fetch('/api/convert', { method: 'POST', body });

      if (res.status === 403) {
        const d = await res.json();
        setIsLimitReached(true);
        setRemainingActions(0);
        setStatus(d.error ?? "You've used today's 5 free actions. Come back tomorrow or upgrade to Pro.");
        return;
      }

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

      // refresh counter
      fetch('/api/usage').then((r) => r.json()).then((d) => {
        if (typeof d.remaining === 'number') setRemainingActions(d.remaining);
      }).catch(() => {});

      setStatus(`Downloaded: ${dlName}`);
    } catch (err) {
      const e = err as Error;
      console.error(e);
      setStatus(e.message || 'Conversion failed. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [singleFile, isLimitReached, mode]);

  // ── Helper: clear file state when switching tabs ───────────────────────────
  const switchMode = (m: Mode) => {
    setMode(m);
    setSingleFile(null);
    setStatus('');
    setIsRtlError(false);
  };

  return (
    <>
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

          {/* Usage counter */}
          {remainingActions !== null && (
            <p className="text-xs font-medium mb-4 text-center" style={{ color: 'var(--ink-soft)' }}>
              {remainingActions} of 5 free actions left today.
            </p>
          )}

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
                  disabled={fileEntries.length === 0 || busy || isLimitReached}
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
                  disabled={!singleFile || busy || isLimitReached}
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
                  disabled={!singleFile || busy || isLimitReached}
                  onClick={runServerConversion}
                >
                  {busy ? 'Converting — please wait…' : 'Convert Word to PDF'}
                </button>
                {status && <span className="status-line show">{status}</span>}
              </div>
            </div>
          )}

          {/* Upgrade prompt */}
          {isLimitReached && (
            <div className="mt-6 p-6 border border-[var(--coral-200)] bg-[var(--coral-100)] rounded-2xl text-center space-y-3 max-w-xl mx-auto">
              <h4 className="text-base font-bold text-[var(--coral-700)]">Daily Limit Reached</h4>
              <p className="text-sm text-[var(--coral-700)] leading-relaxed">
                You&apos;ve used today&apos;s 5 free actions. Upgrade to Pro for unlimited
                actions, or come back tomorrow.
              </p>
              <Link href="/pricing" className="btn btn-primary text-xs py-2 px-5 inline-block">
                Upgrade to Pro
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
