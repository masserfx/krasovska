import { Metadata } from "next";
import Link from "next/link";
import { blogPosts } from "./posts";

export const metadata: Metadata = {
  title: "Blog — Novinky z Haly Krasovská",
  description:
    "Aktuality, tipy a novinky ze sportovní haly Krasovská v Plzni-Bolevci. Badminton, turnaje, bistro, akce.",
  openGraph: {
    title: "Blog — Hala Krasovská",
    description: "Aktuality a novinky ze sportovní haly v Plzni.",
    url: "https://hala-krasovska.vercel.app/blog",
  },
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  return (
    <>
      <section className="bg-primary px-4 py-12 text-white">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold">Blog & Aktuality</h1>
          <p className="mt-2 text-white/80">
            Novinky, tipy a události z Haly Krasovská
          </p>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blogPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group rounded-xl border border-border bg-white p-6 transition-shadow hover:shadow-md"
              >
                <time className="text-xs text-muted">{post.date}</time>
                <h2 className="mt-2 text-lg font-bold text-foreground group-hover:text-primary">
                  {post.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {post.excerpt}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-background px-2 py-0.5 text-xs text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
