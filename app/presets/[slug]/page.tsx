import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PRESETS } from '@/lib/presets';
import { UNIVERSITY_INFO } from '@/lib/university-info';

export async function generateStaticParams() {
  return PRESETS.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const preset = PRESETS.find(p => p.slug === params.slug);
  if (!preset) return {};
  
  return {
    title: `${preset.name} Admission Photo Size & KB Requirements — FormFixer`,
    description: `Exact photo and document size requirements for ${preset.name} forms. Compress your files to max ${preset.kb}KB instantly.`,
  };
}

export default function PresetDynamicPage({ params }: { params: { slug: string } }) {
  const preset = PRESETS.find(p => p.slug === params.slug);
  
  if (!preset) {
    notFound();
  }

  const customText = UNIVERSITY_INFO[preset.slug] || `The online admission process for ${preset.name} mandates that all candidate photos and scanned academic records meet specific file size limits. Using our preset ensures your documents will be instantly accepted by the ${preset.name} portal, saving you time during the crucial application window.`;

  return (
    <>
      <header className="page-hero">
        <div className="wrap">
          <span className="tag">Portal Requirement</span>
          <h1>{preset.name}</h1>
          <p className="text-xl mt-4 font-semibold text-[var(--ink)]">
            Max File Size: {preset.kb} KB
          </p>
          {preset.verified && (
            <div className="mt-2 inline-block text-sm bg-teal-100 text-teal-800 font-bold px-3 py-1 rounded-full">
              ✓ Verified Requirement
            </div>
          )}
        </div>
      </header>

      <section style={{ paddingTop: 24, paddingBottom: 64 }}>
        <div className="wrap max-w-2xl mx-auto text-center">
          <p className="text-[var(--ink-light)] leading-relaxed mb-8 text-lg">
            {customText}
          </p>
          <Link href={`/compress?preset=${preset.slug}`} className="btn btn-primary text-lg px-8 py-4">
            Compress for {preset.name}
          </Link>
          <div className="mt-8 text-sm text-[var(--ink-light)]">
            <Link href="/presets" className="underline hover:text-[var(--ink)]">
              &larr; View all university presets
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
