"use client";

import Link from "next/link";
import { cartCount, useCart } from "@/lib/shop";

/** Cart link with item count — used in the header and on store pages. */
export function CartButton({ compact = false, hideWhenEmpty = false }: { compact?: boolean; hideWhenEmpty?: boolean }) {
  const n = cartCount(useCart());
  if (hideWhenEmpty && n === 0) return null;
  return (
    <Link href="/store/cart" aria-label={n ? `Cart, ${n} item${n === 1 ? "" : "s"}` : "Cart"}
      className={`relative inline-flex items-center justify-center rounded-[10px] border-2 border-ink ${compact ? "h-10 w-10" : "h-11 gap-2 px-4 font-bold"}`}>
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 7h12l-1 13H7L6 7Z" /><path d="M9 7a3 3 0 0 1 6 0" />
      </svg>
      {!compact && <span>Cart</span>}
      {n > 0 && (
        <span key={n} className="swap-in absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-fire px-1 text-xs font-extrabold text-ink">
          {n > 99 ? "99+" : n}
        </span>
      )}
    </Link>
  );
}
