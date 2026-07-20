'use client';

import { useState, useRef, useCallback } from 'react';

type Mode = 'img2pdf' | 'pdf2word' | 'word2pdf';

interface FileEntry {
  file: File;
  id: number;
}

let nextId = 0;

export default function ConvertPage() {
  const [mode, setMode] = useState<Mode>('img2pdf');
  const [fileEntries, setFileEntries] = useState<FileEntry[]>([]);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [isDrag, setIsDrag] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((fileList: FileList) => {
    const newEntries: FileEntry[] = [];
    Array.from(fileList).forEach((f) => {
      if (f.type.startsWith('image/')) {
        newEntries.push({ file: f, id: nextId++ });
      }
    });
    setFileEntries((prev) => [...prev, ...newEntries]);
  }, []);

  const removeFile = (id: number) => {
    setFileEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDrag(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const makePdf = useCallback(async () => {
    if (!fileEntries.length) return;
    setBusy(true);
    setStatus('Building PDF…');

    try {
      const { PDFDocument } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.create();

      for (const entry of fileEntries) {
        const bytes = await entry.file.arrayBuffer();
        const isPng = entry.file.type === 'image/png';
        const img = isPng
          ? await pdfDoc.embedPng(bytes)
          : await pdfDoc.embedJpg(bytes);
        const page = pdfDoc.addPage([img.width, img.height]);
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'formfit-document.pdf';
      a.click();

      const n = fileEntries.length;
      setStatus(`PDF downloaded — ${n} page${n > 1 ? 's' : ''}.`);
    } catch (err) {
      setStatus('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setBusy(false);
    }
  }, [fileEntries]);

  return (
    <>
      <header className="page-hero">
        <div className="wrap">
          <span className="tag">File converter</span>
          <h1>
            Get the file format the portal <em>actually</em> asks for.
          </h1>
          <p>
            Combine photos into a single PDF, or convert between PDF and Word. Basic conversion
            is free — high-fidelity conversion for complex documents is a Pro feature.
          </p>
        </div>
      </header>

      <section id="tool" style={{ paddingTop: 24 }}>
        <div className="wrap">
          {/* Mode tabs */}
          <div className="modes">
            {(['img2pdf', 'pdf2word', 'word2pdf'] as Mode[]).map((m) => (
              <button
                key={m}
                className={`mode-btn${mode === m ? ' active' : ''}`}
                onClick={() => setMode(m)}
              >
                {m === 'img2pdf' && 'Images to PDF'}
                {m === 'pdf2word' && (
                  <>PDF to Word<span className="soon">Pro</span></>
                )}
                {m === 'word2pdf' && (
                  <>Word to PDF<span className="soon">Pro</span></>
                )}
              </button>
            ))}
          </div>

          {/* Images to PDF panel */}
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
                <p>or click to browse — they&apos;ll be combined into a single PDF, in the order added</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) addFiles(e.target.files);
                  }}
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
                    <span className="rm" onClick={() => removeFile(entry.id)}>
                      Remove
                    </span>
                  </div>
                ))}
              </div>

              <div className="action-row">
                <button
                  id="makePdfBtn"
                  className="btn btn-primary"
                  disabled={fileEntries.length === 0 || busy}
                  onClick={makePdf}
                >
                  {busy ? 'Building PDF…' : 'Create PDF'}
                </button>
                {status && <span className="status-line">{status}</span>}
              </div>
            </div>
          )}

          {/* PDF to Word locked panel */}
          {mode === 'pdf2word' && (
            <div id="panel-pdf2word">
              <div className="locked-panel">
                <div className="ic">
                  <svg viewBox="0 0 24 24">
                    <rect x="4" y="10" width="16" height="10" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>
                </div>
                <h3>High-fidelity conversion runs on our servers</h3>
                <p>
                  Keeping tables, formatting, and layout intact needs a proper conversion engine
                  rather than your browser alone. This is part of the Pro plan — see pricing for
                  details.
                </p>
              </div>
            </div>
          )}

          {/* Word to PDF locked panel */}
          {mode === 'word2pdf' && (
            <div id="panel-word2pdf">
              <div className="locked-panel">
                <div className="ic">
                  <svg viewBox="0 0 24 24">
                    <rect x="4" y="10" width="16" height="10" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>
                </div>
                <h3>High-fidelity conversion runs on our servers</h3>
                <p>
                  Same story in reverse — turning a Word doc into a pixel-accurate PDF needs the
                  same server-side engine. Free basic conversion is available on the Pro
                  plan&apos;s lower tier too.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
