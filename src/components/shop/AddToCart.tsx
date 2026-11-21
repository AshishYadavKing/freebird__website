"use client";

import Link from "next/link";
import { useState } from "react";
import { money } from "@/lib/format";
import { cart, type ShopProduct } from "@/lib/shop";

/** Option picker, quantity and "Add to cart" for a product page. */
export function AddToCart({ product }: { product: ShopProduct }) {
  const firstInStock = product.variants.find((v) => v.in_stock) ?? product.variants[0];
  const [variantId, setVariantId] = useState(firstInStock?.id);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(0);
  const v = product.variants.find((x) => x.id === variantId) ?? firstInStock;
  if (!v) return null;

  const max = Math.max(1, v.max_quantity);
  const many = product.variants.length > 1;

  function add() {
    cart.add({ variant_id: v!.id, slug: product.slug, name: product.name, label: many ? v!.label ?? null : null, price: v!.price, image_url: product.image_url, max }, qty);
    setAdded((n) => n + 1);
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="font-display text-5xl font-extrabold">{money(v.price, { cents: true })}</p>

      {many && (
        <fieldset>
          <legend className="field-label">Option</legend>
          <div role="radiogroup" aria-label="Option" className="mt-2 flex flex-wrap gap-2">
            {product.variants.map((x) => (
              <button key={x.id} type="button" role="radio" aria-checked={x.id === v.id} disabled={!x.in_stock}
                onClick={() => { setVariantId(x.id); setQty(1); }}
                className={`rounded-[10px] border-2 px-3 py-2 text-sm font-bold transition-colors duration-300 ${x.id === v.id ? "border-fire bg-fire text-ink" : x.in_stock ? "border-line bg-white hover:border-ink" : "cursor-not-allowed border-line bg-mist text-subtle line-through"}`}>
                {x.label ?? x.sku ?? `Option ${x.id}`}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {v.in_stock ? (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-[12px] border-2 border-line" aria-label="Quantity">
            <button type="button" aria-label="Fewer" onClick={() => setQty(Math.max(1, qty - 1))} className="h-11 w-11 text-xl font-bold">−</button>
            <span className="w-10 text-center font-bold" aria-live="polite">{qty}</span>
            <button type="button" aria-label="More" onClick={() => setQty(Math.min(max, qty + 1))} disabled={qty >= max} className="h-11 w-11 text-xl font-bold disabled:opacity-30">+</button>
          </div>
          <button type="button" onClick={add} className="btn-primary flex-1 sm:flex-none">Add to cart</button>
        </div>
      ) : (
        <p className="rounded-[12px] bg-mist px-4 py-3 font-semibold text-ink-soft">Sold out — ask at the front desk when it’s back.</p>
      )}

      {added > 0 && (
        <div key={added} role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-go/30 bg-go-tint px-4 py-3 text-sm font-semibold text-go">
          Added to your cart.
          <Link href="/store/cart" className="btn-dark !min-h-9 !py-1.5">View cart & checkout</Link>
        </div>
      )}
    </div>
  );
}
