import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { ProductCard } from "@/components/shop/ProductCard";
import { CartButton } from "@/components/shop/CartButton";
import { apiGetSafe } from "@/lib/api";
import type { ProductPage, ShopCategory, ShopOptions } from "@/lib/shop";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Store — supplements, apparel & gear",
  description: "Shop Free Bird supplements, apparel and accessories online. Pay securely and pick up free at your club.",
};

type Search = { category?: string; q?: string; page?: string };

export default async function StorePage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const qs = new URLSearchParams();
  if (sp.category) qs.set("category", sp.category);
  if (sp.q) qs.set("search", sp.q.slice(0, 80));
  qs.set("page", String(page));

  const [meta, list] = await Promise.all([
    apiGetSafe<{ categories: ShopCategory[]; options: ShopOptions }>("/website/shop/categories", { revalidate: 60 }),
    apiGetSafe<ProductPage>(`/website/shop/products?${qs}`, { revalidate: 60 }),
  ]);
  const categories = meta?.categories ?? [];
  const link = (over: Partial<Search>) => {
    const q = new URLSearchParams();
    const next = { category: sp.category, q: sp.q, ...over };
    if (next.category) q.set("category", next.category);
    if (next.q) q.set("q", next.q);
    if (over.page && over.page !== "1") q.set("page", over.page);
    const s = q.toString();
    return s ? `/store?${s}` : "/store";
  };

  return (
    <>
      <PageHero eyebrow="Free Bird Store" title={list?.category?.name ?? "Fuel & gear"}>
        {list?.category?.description && list.category.description !== list.category.name
          ? list.category.description
          : "Supplements, apparel and accessories. Pay securely online and pick up free at your club."}
      </PageHero>

      <section className="container-site flex flex-col gap-8 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <nav aria-label="Categories" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            <Link href={link({ category: undefined, page: "1" })} aria-current={!sp.category ? "page" : undefined}
              className={`shrink-0 rounded-full border-2 px-4 py-2 text-sm font-bold transition-colors duration-300 ${!sp.category ? "border-fire bg-fire text-ink" : "border-line bg-white hover:border-ink"}`}>
              All
            </Link>
            {categories.map((c) => (
              <Link key={c.id} href={link({ category: c.slug, page: "1" })} aria-current={sp.category === c.slug ? "page" : undefined}
                className={`shrink-0 rounded-full border-2 px-4 py-2 text-sm font-bold transition-colors duration-300 ${sp.category === c.slug ? "border-fire bg-fire text-ink" : "border-line bg-white hover:border-ink"}`}>
                {c.name}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <form action="/store" className="flex gap-2" role="search">
              {sp.category && <input type="hidden" name="category" value={sp.category} />}
              <label className="sr-only" htmlFor="store-search">Search products</label>
              <input id="store-search" name="q" type="search" defaultValue={sp.q ?? ""} placeholder="Search products" className="field !mt-0 w-48 sm:w-60" />
              <button type="submit" className="btn-secondary">Search</button>
            </form>
            <CartButton />
          </div>
        </div>

        {!list ? (
          <p className="card text-ink-soft">The store is taking a short break. Please try again in a moment, or call your club.</p>
        ) : list.items.length === 0 ? (
          <div className="card flex flex-col items-start gap-3">
            <p className="text-ink-soft">{sp.q ? `Nothing found for “${sp.q}”.` : "No products here yet."}</p>
            <Link href="/store" className="btn-secondary">See all products</Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {list.items.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
            {list.last_page > 1 && (
              <nav aria-label="Pages" className="flex items-center justify-center gap-3">
                {list.page > 1 && <Link href={link({ page: String(list.page - 1) })} className="btn-secondary">← Previous</Link>}
                <span className="text-sm text-muted">Page {list.page} of {list.last_page}</span>
                {list.page < list.last_page && <Link href={link({ page: String(list.page + 1) })} className="btn-secondary">Next →</Link>}
              </nav>
            )}
          </>
        )}

        <ul className="grid gap-4 rounded-[var(--radius-card)] bg-mist p-6 text-sm text-ink-soft sm:grid-cols-3">
          <li><strong className="block text-ink">Free pickup at your club</strong>Ready at the front desk — we’ll let you know.</li>
          <li><strong className="block text-ink">Secure payment</strong>Card, Apple Pay and Google Pay through Stripe.</li>
          <li><strong className="block text-ink">Questions?</strong>Call Mississauga 905 238 1331 or Brampton 905 459 6255.</li>
        </ul>
      </section>
    </>
  );
}
