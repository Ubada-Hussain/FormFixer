import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { BLOG_POSTS } from '@/lib/blog';

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = BLOG_POSTS.find(p => p.slug === params.slug);
  if (!post) return {};
  
  return {
    title: `${post.title} — FormFixer Blog`,
    description: post.description,
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = BLOG_POSTS.find(p => p.slug === params.slug);
  
  if (!post) {
    notFound();
  }

  return (
    <>
      <header className="page-hero pb-8">
        <div className="wrap max-w-3xl">
          <div className="text-sm text-[var(--teal)] font-semibold mb-4 tracking-wide uppercase">
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
          <h1 className="mb-4">{post.title}</h1>
        </div>
      </header>

      <section style={{ paddingTop: 0, paddingBottom: 64 }}>
        <div className="wrap max-w-3xl mx-auto">
          <article 
            className="prose prose-lg prose-teal max-w-none text-[var(--ink-light)]"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          
          <div className="mt-16 pt-8 border-t border-[var(--sand)] flex justify-between items-center">
            <Link href="/blog" className="text-[var(--teal)] font-semibold hover:underline">
              &larr; Back to all posts
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
