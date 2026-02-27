import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { blogPosts } from "../posts";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return { title: "Článek nenalezen" };

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://hala-krasovska.vercel.app/blog/${slug}`,
      type: "article",
      publishedTime: post.date,
    },
    alternates: { canonical: `/blog/${slug}` },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    url: `https://hala-krasovska.vercel.app/blog/${slug}`,
    author: {
      "@type": "Organization",
      name: "Hala Krasovská",
    },
  };

  // Simple markdown-to-html (headers, bold, lists, links)
  const html = post.content
    .replace(/^### (.+)$/gm, '<h3 class="mt-6 mb-2 text-lg font-bold text-foreground">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="mt-8 mb-3 text-xl font-bold text-foreground">$1</h2>')
    .replace(/^# (.+)$/gm, '<h2 class="mt-8 mb-3 text-2xl font-bold text-foreground">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-foreground">$1</li>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-primary hover:underline">$1</a>')
    .replace(/\n\n/g, '</p><p class="mt-3 leading-relaxed text-foreground">')
    .replace(/^(?!<)(.+)$/gm, '$1');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="bg-primary px-4 py-12 text-white">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/blog"
            className="mb-4 inline-block text-sm text-white/60 hover:text-white"
          >
            &larr; Zpět na blog
          </Link>
          <time className="block text-sm text-white/60">{post.date}</time>
          <h1 className="mt-2 text-3xl font-bold">{post.title}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/10 px-3 py-0.5 text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      <article className="px-4 py-12">
        <div
          className="prose mx-auto max-w-3xl"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>
    </>
  );
}
