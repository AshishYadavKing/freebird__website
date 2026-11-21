import Image from "next/image";
import Link from "next/link";
import { money } from "@/lib/format";
import type { ShopProduct } from "@/lib/shop";

export function ProductCard({ p }: { p: ShopProduct }) {
  return (
    <Link href={`/store/product/${p.slug}`} className="lift group flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-white hover:border-ink">
      <div className="zoom-on-hover relative aspect-square w-full bg-mist">
        {p.image_url ? (
          <Image src={p.image_url} alt={p.name} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-2xl font-extrabold uppercase text-line-strong">Free Bird</div>
        )}
        {!p.in_stock && <span className="absolute left-3 top-3 rounded-full bg-ink px-3 py-1 text-xs font-bold text-white">Sold out</span>}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        {p.brand && <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted">{p.brand}</p>}
        <h3 className="font-semibold leading-snug transition-colors duration-300 group-hover:text-ember">{p.name}</h3>
        <p className="mt-auto pt-2 font-display text-2xl font-extrabold">
          {p.variants.length > 1 && <span className="mr-1 text-sm font-semibold text-muted">from</span>}
          {money(p.price_from, { cents: true })}
        </p>
      </div>
    </Link>
  );
}
