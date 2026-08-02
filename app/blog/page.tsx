import type { Metadata } from 'next';
import Link from 'next/link';
import { BLOG_POSTS } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog & Resources — FormFixer',
  description: 'Helpful guides, tips, and tutorials for compressing photos and converting documents for scholarship and admission forms.',
};

export default function BlogIndexPage() {
  return (
    <>
      <header className="page-hero">
        <div className="wrap">
          <span className="tag">Resources</span>
          <h1>FormFixer Blog</h1>
          <p>
            Guides and tips to make your university and scholarship applications go smoothly.
          </p>
        </div>
      </header>

      <section style={{ paddingTop: 24, paddingBottom: 64 }}>
        <div className="wrap max-w-3xl mx-auto">
          <div className="flex flex-col gap-8">
            {BLOG_POSTS.map((post) => (
              <article key={post.slug} className="preset-card hover:border-[var(--teal)] transition-colors">
                <Link href={`/blog/${post.slug}`} className="block">
                  <div className="text-sm text-[var(--ink-light)] mb-2">
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <h2 className="text-xl font-bold text-[var(--ink)] mb-2">
                    {post.title}
                  </h2>
                  <p className="text-[var(--ink-light)] mb-4">
                    {post.description}
                  </p>
                  <span className="text-[var(--teal)] font-semibold hover:underline">
                    Read article &rarr;
                  </span>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
