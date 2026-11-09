import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard, articleDate } from "@/components/ArticleCard";
import { getArticle } from "@/lib/crm";
import { sanitizeHtml } from "@/lib/sanitize";
import { SITE } from "@/lib/site";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = await getArticle((await params).slug);
  if (!a) return { title: "Article not found" };
  return {
    title: a.seo_title,
    description: a.seo_description ?? undefined,
    alternates: { canonical: `/articles/${a.slug}` },
    openGraph: {
      type: "article",
      title: a.seo_title,
      description: a.seo_description ?? undefined,
      publishedTime: a.published_at ?? undefined,
      modifiedTime: a.updated_at ?? undefined,
      authors: a.author_name ? [a.author_name] : undefined,
      images: a.cover_url ? [a.cover_url] : ["/images/gym-floor.webp"],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const a = await getArticle((await params).slug);
  if (!a) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.seo_description ?? undefined,
    image: a.cover_url ? [a.cover_url] : undefined,
    datePublished: a.published_at ?? undefined,
    dateModified: a.updated_at ?? a.published_at ?? undefined,
    author: a.author_name ? { "@type": "Person", name: a.author_name } : { "@type": "Organization", name: SITE.name },
    publisher: { "@type": "Organization", name: SITE.name },
  };

  return (
    <article>
      <header className="border-b border-line bg-mist">
        <div className="container-site flex max-w-4xl flex-col gap-5 py-14">
          <Link href="/articles" className="text-sm font-semibold text-sky hover:underline">← All articles</Link>
          {a.category && (
            <Link href={`/articles?category=${encodeURIComponent(a.category)}`} className="eyebrow self-start hover:underline">{a.category}</Link>
          )}
          <h1 className="h-display text-4xl sm:text-6xl">{a.title}</h1>
          {a.excerpt && <p className="lead">{a.excerpt}</p>}
          <p className="text-sm text-muted">{[a.author_name, articleDate(a.published_at), `${a.reading_minutes} min read`].filter(Boolean).join(" · ")}</p>
        </div>
      </header>

      {a.cover_url && (
        <div className="container-site max-w-5xl pt-10">
          <div className="relative aspect-[1200/630] w-full overflow-hidden rounded-[var(--radius-card)]">
            <Image src={a.cover_url} alt="" fill priority sizes="(min-width: 1024px) 1024px, 100vw" className="object-cover" />
          </div>
        </div>
      )}

      <div className="container-site max-w-3xl py-12">
        {a.body ? (
          <div className="prose-crm prose-article" dangerouslySetInnerHTML={{ __html: sanitizeHtml(a.body) }} />
        ) : null}

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-[24px] bg-ink p-8 text-ink-text">
          <div>
            <p className="font-display text-3xl font-extrabold uppercase">Ready to put it into practice?</p>
            <p className="text-[#C9D0DC]">Train with us free for 3 days, or talk to a coach.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/free-pass" className="btn-primary">Free 3-day pass</Link>
            <Link href="/personal-training#consult" className="btn-light">Free consultation</Link>
          </div>
        </div>
      </div>

      {a.related.length > 0 && (
        <section className="border-t border-line bg-mist">
          <div className="container-site py-14">
            <h2 className="h-section mb-8">Keep reading</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {a.related.map((r) => <ArticleCard key={r.slug} a={r} />)}
            </div>
          </div>
        </section>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </article>
  );
}
