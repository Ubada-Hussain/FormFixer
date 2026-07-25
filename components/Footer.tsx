import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-[var(--line)] mt-16 pt-16 pb-8 text-[14px]">
      <div className="wrap flex flex-col md:flex-row justify-between gap-12 mb-12">
        
        {/* Brand column */}
        <div className="flex flex-col gap-4 max-w-xs">
          <Link href="/" className="brand">
            <span className="mark" />
            FormFixer
          </Link>
          <p className="text-[var(--ink-soft)]">
            Fix your file for any form.
          </p>
        </div>

        {/* Links Columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-12 w-full md:w-auto">
          {/* Quick links */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-[var(--ink)] font-[Georgia] text-[15px] mb-2">Tools</h4>
            <Link href="/compress" className="text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors">Compress</Link>
            <Link href="/convert" className="text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors">Convert</Link>
            <Link href="/presets" className="text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors">Presets</Link>
            <Link href="/pricing" className="text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors">Pricing</Link>
            <Link href="/about" className="text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors">About</Link>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-[var(--ink)] font-[Georgia] text-[15px] mb-2">Legal</h4>
            <Link href="/privacy" className="text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors">Terms of Service</Link>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-[var(--ink)] font-[Georgia] text-[15px] mb-2">Contact</h4>
            <a href="https://github.com/Ubada-Hussain/FormFixer" target="_blank" rel="noreferrer" className="text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors">GitHub</a>
            <div className="relative">
              <a href="mailto:ubadahussain23@gmail.com" className="text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors block mt-2">
                ubadahussain23@gmail.com
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="wrap border-t border-[var(--line)] pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[13px] text-[var(--ink-faint)]">
        <span>© {new Date().getFullYear()} FormFixer. All rights reserved.</span>
        <span>Built for students, not advertisers.</span>
      </div>
    </footer>
  );
}
