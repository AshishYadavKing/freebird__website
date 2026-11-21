import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/shop/AddToCart";
import { CartButton } from "@/components/shop/CartButton";
import { Gallery } from "@/components/shop/Gallery";
import { apiGetSafe } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize";
import type { ShopProduct } from "@/lib/shop";

export const revalidate = 60;
type Props = { params: Promise<{ slug: string }> };

const getProduct = (slug: string) => apiGetSafe<ShopProduct>(`/website/shop/products/${encodeURIComponent(slug)}`, { revalidate: 60 });

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProduct((await params).slug);
  if (!p) return { title: "Product not found" };
  return {
    title: p.name,
    description: p.short_description ?? `${p.name} from the Free Bird Store.`,
    openGraph: p.image_url ? { images: [p.image_url] } : undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const p = await getProduct((await params).slug);
  if (!p) notFound();

  const looksHtml = /<[a-z][\s\S]*>/i.test(p.description ?? "");
  const images = p.images?.length ? p.images : p.image_url ? [p.image_url] : [];

  return (
    <section className="container-site flex flex-col gap-8 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <Link href="/store" className="hover:text-ink">Store</Link>
          {p.category && <> / <Link href={`/store?category=${p.category.slug}`} className="hover:text-ink">{p.category.name}</Link></>}
        </nav>
        <CartButton />
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <Gallery images={images} alt={p.name} />

        <div className="flex flex-col gap-5">
          {p.brand && <p className="eyebrow">{p.brand}</p>}
          <h1 className="h-display text-4xl sm:text-5xl">{p.name}</h1>
          {p.short_description && p.short_description !== p.name && <p className="lead">{p.short_description}</p>}

          <AddToCart product={p} />

          {p.highlights && p.highlights.length > 0 && (
            <ul className="flex flex-col gap-2">
              {p.highlights.map((h) => (
                <li key={h} className="flex gap-2 text-ink-soft"><span className="text-fire">✓</span>{h}</li>
              ))}
            </ul>
          )}

          <ul className="grid gap-2 rounded-[14px] bg-mist p-4 text-sm text-ink-soft">
            <li>🏪 <strong>Free pickup</strong> at your Free Bird club</li>
            <li>🔒 Secure checkout — card, Apple Pay, Google Pay</li>
          </ul>
        </div>
      </div>

      {(p.description || (p.specifications?.length ?? 0) > 0) && (
        <div className="grid gap-10 border-t border-line pt-10 lg:grid-cols-[1.4fr_1fr]">
          {p.description && (
            <div>
              <h2 className="mb-4 text-2xl font-bold">About this product</h2>
              {looksHtml ? (
                <div className="prose-crm text-ink-soft" dangerouslySetInnerHTML={{ __html: sanitizeHtml(p.description) }} />
              ) : (
                <p className="whitespace-pre-line text-ink-soft">{p.description}</p>
              )}
            </div>
          )}
          {p.specifications && p.specifications.length > 0 && (
            <div>
              <h2 className="mb-4 text-2xl font-bold">Details</h2>
              <dl className="divide-y divide-line rounded-[14px] border border-line">
                {p.specifications.map((s) => (
                  <div key={s.name} className="flex justify-between gap-4 px-4 py-3 text-sm">
                    <dt className="text-muted">{s.name}</dt><dd className="text-right font-semibold">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
