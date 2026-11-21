"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FormAlert } from "@/components/forms/Fields";
import { getJson } from "@/lib/client-api";
import { money } from "@/lib/format";
import { cart, type ShopOrder } from "@/lib/shop";

/**
 * Where Stripe sends the buyer after paying. Polls the CRM until the payment is
 * confirmed (usually instant), then shows the receipt and empties the cart.
 */
export function OrderStatus({ number }: { number: string }) {
  const token = useSearchParams().get("t") ?? "";
  const [order, setOrder] = useState<ShopOrder | null>(null);
  const [missing, setMissing] = useState(!token);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (!token) return;
    let live = true;
    let tries = 0;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      const r = await getJson<ShopOrder>(`shop/orders/${encodeURIComponent(number)}?t=${encodeURIComponent(token)}`);
      if (!live) return;
      if (r.status === 404) { setMissing(true); return; }
      if (r.ok && r.data) {
        setOrder(r.data);
        if (r.data.state === "paid") { cart.clear(); return; }
        if (r.data.state === "expired") return;
      }
      tries += 1;
      if (tries === 10) setSlow(true);
      if (tries < 40) timer = setTimeout(poll, tries < 10 ? 1500 : 4000);
    };
    poll();
    return () => { live = false; clearTimeout(timer); };
  }, [number, token]);

  if (missing) {
    return (
      <div className="card flex flex-col items-start gap-3">
        <h1 className="text-2xl font-bold">We couldn’t find that order</h1>
        <p className="text-ink-soft">Please use the link in your confirmation email, or call your club with order number <strong>{number}</strong>.</p>
        <Link href="/store" className="btn-secondary">Back to the store</Link>
      </div>
    );
  }

  if (!order || order.state === "pending" || order.state === "processing") {
    return (
      <div className="card flex flex-col items-center gap-4 py-12 text-center" role="status">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-line border-t-fire" aria-hidden="true" />
        <h1 className="text-2xl font-bold">Confirming your payment…</h1>
        <p className="max-w-md text-muted">
          {slow ? "This is taking longer than usual. You can close this page — we’ll email your receipt as soon as it’s confirmed." : "This only takes a moment."}
        </p>
      </div>
    );
  }

  if (order.state === "expired") {
    return (
      <div className="card flex flex-col items-start gap-3">
        <h1 className="text-2xl font-bold">This checkout expired</h1>
        <p className="text-ink-soft">No payment was taken. Your cart is still saved — you can check out again.</p>
        <Link href="/store/cart" className="btn-primary">Go to cart</Link>
      </div>
    );
  }

  const pickup = order.fulfillment === "pickup";
  return (
    <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-start">
      <div className="flex flex-col gap-6">
        <div className="swap-in flex flex-col gap-3">
          <p className="eyebrow">Order {order.order_number}</p>
          <h1 className="h-display text-5xl">Thank you! Your order is confirmed.</h1>
          <p className="lead">We’ve emailed your receipt to {order.email ?? "you"}.</p>
        </div>
        <FormAlert kind="success">
          {pickup
            ? <>Pick up at <strong>Free Bird {order.pickup?.club}</strong>{order.pickup?.address ? ` — ${order.pickup.address}` : ""}. We’ll let you know when it’s ready; just give your order number at the front desk.</>
            : <>We’ll deliver to <strong>{order.delivery_address}</strong> and email you when it ships.</>}
        </FormAlert>
        <div className="flex flex-wrap gap-3">
          <Link href="/store" className="btn-secondary">Keep shopping</Link>
          <Link href="/app" className="btn-secondary">Get the Free Bird app</Link>
        </div>
      </div>

      <aside aria-label="Receipt" className="card flex flex-col gap-3">
        <h2 className="text-lg font-bold">Receipt</h2>
        <ul className="flex flex-col gap-2 text-sm">
          {order.items?.map((i, n) => (
            <li key={n} className="flex justify-between gap-3">
              <span>{i.quantity} × {i.name}{i.options ? <span className="text-muted"> ({i.options})</span> : null}</span>
              <span className="font-semibold">{money(i.line_total, { cents: true })}</span>
            </li>
          ))}
        </ul>
        <dl className="flex flex-col gap-1.5 border-t border-line pt-3 text-sm">
          <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{money(order.subtotal ?? 0, { cents: true })}</dd></div>
          {(order.discount ?? 0) > 0 && <div className="flex justify-between"><dt className="text-muted">Discount</dt><dd>−{money(order.discount ?? 0, { cents: true })}</dd></div>}
          {!pickup && <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd>{(order.shipping ?? 0) > 0 ? money(order.shipping ?? 0, { cents: true }) : "Free"}</dd></div>}
          <div className="flex justify-between"><dt className="text-muted">Tax</dt><dd>{money(order.tax ?? 0, { cents: true })}</dd></div>
          <div className="flex justify-between border-t border-line pt-2 text-base font-bold"><dt>Total paid</dt><dd>{money(order.total ?? 0, { cents: true })}</dd></div>
        </dl>
      </aside>
    </div>
  );
}
