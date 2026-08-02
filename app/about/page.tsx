import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About FormFixer — Built for Students',
  description:
    'Why FormFixer exists — built after one too many broken compressor sites, for students filling out scholarship and admission forms.',
};

export default function AboutPage() {
  return (
    <>
      <header className="page-hero">
        <div className="wrap">
          <span className="tag">Why FormFixer exists</span>
          <h1>Built after one too many broken compressor sites.</h1>
        </div>
      </header>

      <section style={{ paddingTop: 12 }}>
        <div className="wrap">
          <div className="story">
            <p>
              Every scholarship and admission form seems to have its own idea of what a
              &ldquo;photo&rdquo; should be — a different size, a different file limit, a
              different popup telling you it&apos;s still wrong. The tools meant to fix that are
              worse: pages full of ads, fake download buttons, dashboards that feel abandoned,
              or compressors that quietly cost money for something that should take five seconds.
            </p>
            <p>
              FormFixer exists to be the tool that just works. No account needed for the basics.
              No ad slots to fund. Files are processed right in your browser, so a photo or
              signature never has to leave your device to get resized.
            </p>
          </div>

          <div className="compare">
            <div className="col bad">
              <h4>What we kept running into</h4>
              <ul>
                <li>Pop-up ads before and after every download</li>
                <li>Dashboards that felt half-built or abandoned</li>
                <li>Tools that crashed on larger files</li>
                <li>Vague or fake &ldquo;compress now&rdquo; buttons</li>
              </ul>
            </div>
            <div className="col good">
              <h4>What FormFixer does instead</h4>
              <ul>
                <li>No ads on any plan, free or paid</li>
                <li>One clear tool per page, nothing hidden</li>
                <li>Processing runs on your device, so it doesn&apos;t stall</li>
                <li>Presets tuned to real portals, not guesswork</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
