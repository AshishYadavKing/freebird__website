import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderStatus } from "@/components/shop/OrderStatus";

export const metadata: Metadata = { title: "Your order", robots: { index: false, follow: false } };

export default async function OrderPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  return (
    <section className="container-site py-12">
      <Suspense fallback={<div className="skeleton h-64" />}>
        <OrderStatus number={number.toUpperCase().replace(/[^A-Z0-9-]/g, "")} />
      </Suspense>
    </section>
  );
}
