import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/ArticleCard";
import { PageHero } from "@/components/PageHero";
import { getArticles } from "@/lib/crm";

export const metadata: Metadata = {
  title: "Articles — training, nutrition & club news",
  description: "Training tips, nutrition advice and news from the coaches at Free Bird Gym in Mississauga and Brampton.",
};

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<{ category?: string; page?: string }> }) {
  const q = await searchParams;
  const category = q.category?.slice(0, 60);
  const page = Math.max(1, Number(q.page) || 1);
  const data = await getArticles({ category, page });
  const [lead, ...rest] = data.articles;
  const showLead = !!lead && page === 1 && !category;
  const href = (p: number) => `/articles?${new URLSearchParams({ ...(category ? { category } : {}), ...(p > 1 ? { page: String(p) } : {}) })}`;

  return (
    <>
      <PageHero eyebrow="Articles" title="Train smarter">
        Tips, nutrition advice and news from our coaches.
      </PageHero>

      <section className="container-site flex flex-col gap-8 py-14">
        {data.categories.length > 0 && (
          <nav aria-label="Categories" className="flex flex-wrap gap-2">
            <Link href="/articles" aria-current={!category ? "page" : undefined}
              className={`rounded-full border-2 px-4 py-1.5 text-sm font-bold ${!category ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink"}`}>All</Link>
            {data.categories.map((c) => (
              <Link key={c} href={`/articles?category=${encodeURIComponent(c)}`} aria-current={c === category ? "page" : undefined}
                className={`rounded-full border-2 px-4 py-1.5 text-sm font-bold ${c === category ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink"}`}>{c}</Link>
            ))}
          </nav>
        )}

        {data.articles.length === 0 ? (
          <p className="card text-ink-soft">No articles {category ? `in ${category} ` : ""}yet — check back soon.</p>
        ) : (
          <>
            {showLead && <ArticleCard a={lead} large />}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {(showLead ? rest : data.articles).map((a) => <ArticleCard key={a.slug} a={a} />)}
            </div>
          </>
        )}

        {data.last_page > 1 && (
          <nav aria-label="Pages" className="flex items-center justify-center gap-3">
            {page > 1 && <Link href={href(page - 1)} className="btn-secondary">Newer</Link>}
            <span className="text-sm text-muted">Page {page} of {data.last_page}</span>
            {page < data.last_page && <Link href={href(page + 1)} className="btn-secondary">Older</Link>}
          </nav>
        )}
      </section>
    </>
  );
}
