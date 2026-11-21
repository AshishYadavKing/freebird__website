import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CartCheckout } from "@/components/shop/CartCheckout";

export const metadata: Metadata = { title: "Your cart", robots: { index: false } };

export default function CartPage() {
  return (
    <section className="container-site flex flex-col gap-8 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="h-display text-5xl">Your cart</h1>
        <Link href="/store" className="font-semibold text-sky underline-offset-2 hover:underline">← Keep shopping</Link>
      </div>
      <Suspense fallback={<div className="skeleton h-64" />}>
        <CartCheckout />
      </Suspense>
    </section>
  );
}
