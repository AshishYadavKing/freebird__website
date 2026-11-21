"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { FormAlert, Honeypot, TextField } from "@/components/forms/Fields";
import { attribution, getJson, postJson } from "@/lib/client-api";
import { money } from "@/lib/format";
import { cart, useCart, type Quote, type ShopOptions } from "@/lib/shop";

type Address = { street: string; unit: string; city: string; province: string; postal_code: string };
const EMPTY_ADDRESS: Address = { street: "", unit: "", city: "", province: "ON", postal_code: "" };

/** Cart, pickup/delivery choice, contact details and the hand-off to Stripe's secure checkout. */
export function CartCheckout() {
  const lines = useCart();
  const params = useSearchParams();
  const [options, setOptions] = useState<ShopOptions | null>(null);
  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">("pickup");
  const [branchId, setBranchId] = useState<number | null>(null);
  const [address, setAddress] = useState<Address>(EMPTY_ADDRESS);
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const cancelHandled = useRef(false);

  // Pickup clubs + whether delivery is offered.
  useEffect(() => {
    getJson<{ options: ShopOptions }>("shop/categories").then((r) => {
      if (r.ok && r.data) setOptions(r.data.options);
    });
  }, []);

  // Back from Stripe without paying: free the reserved stock right away.
  useEffect(() => {
    const number = params.get("cancelled");
    const t = params.get("t");
    if (!number || !t || cancelHandled.current) return;
    cancelHandled.current = true;
    postJson<{ state: string }>(`shop/orders/${encodeURIComponent(number)}/cancel`, { t }).then((r) => {
      if (r.data?.state === "paid") window.location.replace(`/store/order/${number}?t=${encodeURIComponent(t)}`);
      else setNotice("Payment cancelled — nothing was charged. Your cart is still here.");
    });
  }, [params]);

  // Until the buyer picks a club, the CRM suggests one that has everything in stock.
  const pickupBranch = branchId;
  const addressReady = fulfillment === "pickup" || (address.street.trim() && address.city.trim() && /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(address.postal_code.trim()));
  const items = useMemo(() => lines.map((l) => ({ variant_id: l.variant_id, quantity: l.quantity })), [lines]);
  const cartInput = useMemo(() => ({
    items,
    fulfillment,
    ...(fulfillment === "pickup" ? (pickupBranch ? { branch_id: pickupBranch } : {}) : { address: { ...address, postal_code: address.postal_code.trim().toUpperCase() } }),
    ...(coupon ? { coupon_code: coupon } : {}),
  }), [items, fulfillment, pickupBranch, address, coupon]);

  // Live price check (debounced): CRM prices, stock at the club, tax, coupon.
  const inputKey = JSON.stringify(cartInput);
  useEffect(() => {
    if (!items.length || !addressReady) return;
    let live = true;
    const t = setTimeout(async () => {
      setQuoting(true);
      const r = await postJson<Quote>("shop/quote", JSON.parse(inputKey));
      if (!live) return;
      setQuoting(false);
      if (r.ok && r.data) { setQuote(r.data); setQuoteError(null); }
      else { setQuote(null); setQuoteError(Object.values(r.errors)[0] ?? r.message); }
    }, 350);
    return () => { live = false; clearTimeout(t); };
  }, [inputKey, items.length, addressReady]);

  async function checkout(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const contact = {
      full_name: String(fd.get("full_name") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim(),
      website: String(fd.get("website") ?? ""),
      marketing_consent: fd.get("marketing_consent") === "1",
    };
    const errs: Record<string, string> = {};
    if (contact.full_name.length < 2) errs.full_name = "Enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(contact.email)) errs.email = "Enter a valid email for your receipt.";
    if (contact.phone.replace(/\D/g, "").length < 10) errs.phone = "Enter your phone number.";
    setErrors(errs);
    setMessage(null);
    if (Object.keys(errs).length) return;
    if (!quote) { setMessage(quoteError ?? "Please wait a moment for your total."); return; }

    setBusy(true);
    const club = fulfillment === "pickup" ? { branch_id: pickupBranch ?? quote.branch.id } : {};
    const r = await postJson<{ checkout_url: string }>("shop/checkout", { ...cartInput, ...club, ...contact, ...attribution() });
    if (r.ok && r.data?.checkout_url) {
      window.location.assign(r.data.checkout_url); // Stripe's secure payment page
      return;
    }
    setBusy(false);
    const fieldErrors: Record<string, string> = {};
    for (const [k, v] of Object.entries(r.errors)) fieldErrors[k.replace(/^address\./, "")] = v;
    setErrors(fieldErrors);
    setMessage(Object.keys(fieldErrors).length ? "Please check the highlighted details." : r.message);
  }

  if (!lines.length) {
    return (
      <div className="flex flex-col gap-6">
        {notice && <FormAlert kind="success">{notice}</FormAlert>}
        <div className="card flex flex-col items-start gap-4">
          <h2 className="text-2xl font-bold">Your cart is empty</h2>
          <p className="text-ink-soft">Find supplements, apparel and gear in the Free Bird Store.</p>
          <Link href="/store" className="btn-primary">Shop now</Link>
        </div>
      </div>
    );
  }

  const shownTotal = quote?.total;

  return (
    <form onSubmit={checkout} noValidate className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-start">
      <Honeypot />
      <div className="flex flex-col gap-8">
        {notice && <FormAlert kind="success">{notice}</FormAlert>}

        {/* Items */}
        <section aria-labelledby="cart-items" className="card flex flex-col gap-4">
          <h2 id="cart-items" className="text-xl font-bold">Items</h2>
          <ul className="flex flex-col divide-y divide-line">
            {lines.map((l) => {
              const q = quote?.lines.find((x) => x.variant_id === l.variant_id);
              return (
                <li key={l.variant_id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <Link href={`/store/product/${l.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[12px] bg-mist">
                    {l.image_url && <Image src={l.image_url} alt="" fill sizes="80px" className="object-cover" />}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex justify-between gap-3">
                      <div className="min-w-0">
                        <Link href={`/store/product/${l.slug}`} className="font-semibold hover:text-ember">{l.name}</Link>
                        {l.label && <p className="text-sm text-muted">{l.label}</p>}
                      </div>
                      <p className="shrink-0 font-bold">{money(q?.line_total ?? l.price * l.quantity, { cents: true })}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center rounded-[10px] border border-line" aria-label={`Quantity of ${l.name}`}>
                        <button type="button" aria-label="Fewer" onClick={() => cart.setQuantity(l.variant_id, l.quantity - 1)} disabled={l.quantity <= 1} className="h-9 w-9 font-bold disabled:opacity-30">−</button>
                        <span className="w-8 text-center text-sm font-bold">{l.quantity}</span>
                        <button type="button" aria-label="More" onClick={() => cart.setQuantity(l.variant_id, l.quantity + 1)} disabled={l.quantity >= l.max} className="h-9 w-9 font-bold disabled:opacity-30">+</button>
                      </div>
                      <button type="button" onClick={() => cart.remove(l.variant_id)} className="text-sm font-semibold text-muted underline-offset-2 hover:text-ink hover:underline">Remove</button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Pickup / delivery */}
        <section aria-labelledby="cart-get" className="card flex flex-col gap-4">
          <h2 id="cart-get" className="text-xl font-bold">How would you like it?</h2>
          <div role="radiogroup" aria-label="Pickup or delivery" className="grid gap-2 sm:grid-cols-2">
            <button type="button" role="radio" aria-checked={fulfillment === "pickup"} onClick={() => setFulfillment("pickup")}
              className={`rounded-[12px] border-2 p-4 text-left transition-colors duration-300 ${fulfillment === "pickup" ? "border-fire bg-[#FFF4EB]" : "border-line hover:border-ink"}`}>
              <span className="block font-bold">Pick up at a club</span><span className="text-sm text-muted">Free · ready at the front desk</span>
            </button>
            <button type="button" role="radio" aria-checked={fulfillment === "delivery"} disabled={!options?.delivery_available} onClick={() => setFulfillment("delivery")}
              className={`rounded-[12px] border-2 p-4 text-left transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${fulfillment === "delivery" ? "border-fire bg-[#FFF4EB]" : "border-line hover:border-ink"}`}>
              <span className="block font-bold">Delivery</span>
              <span className="text-sm text-muted">{options?.delivery_available ? "Priced by distance" : "Coming soon"}</span>
            </button>
          </div>

          {fulfillment === "pickup" ? (
            <label className="field-label">
              Pickup club
              <select className="field" value={pickupBranch ?? quote?.branch.id ?? ""} onChange={(e) => setBranchId(Number(e.target.value))}>
                {!pickupBranch && !quote && <option value="" disabled>Finding a club with your items…</option>}
                {(options?.pickup_branches ?? []).map((b) => <option key={b.id} value={b.id}>{b.name}{b.address ? ` — ${b.address}` : ""}</option>)}
              </select>
            </label>
          ) : (
            <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
              <TextField label="Street address" name="street" autoComplete="address-line1" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} error={errors.street} />
              <TextField label="Unit (optional)" name="unit" autoComplete="address-line2" value={address.unit} onChange={(e) => setAddress({ ...address, unit: e.target.value })} />
              <TextField label="City" name="city" autoComplete="address-level2" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} error={errors.city} />
              <TextField label="Postal code" name="postal_code" autoComplete="postal-code" value={address.postal_code} onChange={(e) => setAddress({ ...address, postal_code: e.target.value })} error={errors.postal_code} />
            </div>
          )}
        </section>

        {/* Contact */}
        <section aria-labelledby="cart-contact" className="card grid gap-4 sm:grid-cols-2">
          <h2 id="cart-contact" className="text-xl font-bold sm:col-span-2">Your details</h2>
          <TextField label="Full name" name="full_name" autoComplete="name" required error={errors.full_name} />
          <TextField label="Phone" name="phone" type="tel" autoComplete="tel" required error={errors.phone} />
          <TextField label="Email (for your receipt)" name="email" type="email" autoComplete="email" required error={errors.email} className="sm:col-span-2" />
          <label className="flex items-start gap-3 text-sm text-muted sm:col-span-2">
            <input type="checkbox" name="marketing_consent" value="1" className="mt-0.5 h-5 w-5 shrink-0 accent-fire" />
            Send me offers and new products by email. I can unsubscribe anytime.
          </label>
        </section>
      </div>

      {/* Summary */}
      <aside aria-label="Order summary" className="card-dark flex flex-col gap-4 lg:sticky lg:top-24">
        <h2 className="text-xl font-bold">Order summary</h2>
        <dl className="flex flex-col gap-2 text-sm">
          <Row k="Subtotal" v={quote ? money(quote.subtotal, { cents: true }) : "—"} />
          {quote && quote.discount > 0 && <Row k={`Discount (${quote.coupon?.code})`} v={`−${money(quote.discount, { cents: true })}`} />}
          <Row k={fulfillment === "pickup" ? "Pickup" : "Delivery"} v={!quote ? "—" : quote.shipping > 0 ? money(quote.shipping, { cents: true }) : "Free"} />
          <Row k={`Tax${quote ? ` (${quote.tax_rate}%)` : ""}`} v={quote ? money(quote.tax, { cents: true }) : "—"} />
        </dl>
        <p className="flex items-baseline justify-between border-t border-ink-line pt-4">
          <span className="font-bold">Total</span>
          <span className="font-display text-4xl font-extrabold">{shownTotal != null ? money(shownTotal, { cents: true }) : quoting ? "…" : "—"}</span>
        </p>

        <div className="flex gap-2">
          <label className="sr-only" htmlFor="coupon">Promo code</label>
          <input id="coupon" value={couponInput} onChange={(e) => setCouponInput(e.target.value)} placeholder="Promo code"
            className="min-w-0 flex-1 rounded-[10px] border border-ink-line bg-white/5 px-3 py-2 text-white placeholder:text-ink-muted" />
          <button type="button" onClick={() => setCoupon(couponInput.trim().toUpperCase())} className="btn-light !min-h-10 !py-2">Apply</button>
        </div>
        {quote?.coupon && !quote.coupon.applied && <p className="text-sm text-fire-light">{quote.coupon.message}</p>}

        {quoteError && <p role="alert" className="rounded-[10px] bg-red-50 px-3 py-2 text-sm font-semibold text-red-800">{quoteError}</p>}
        {message && <p role="alert" className="rounded-[10px] bg-red-50 px-3 py-2 text-sm font-semibold text-red-800">{message}</p>}

        <button type="submit" className="btn-primary w-full" disabled={busy || !quote}>
          {busy ? "Opening secure payment…" : `Pay${shownTotal != null ? ` ${money(shownTotal, { cents: true })}` : ""} securely`}
        </button>
        <p className="text-center text-xs text-ink-muted">You’ll pay on Stripe’s secure page. Card, Apple Pay and Google Pay accepted.</p>
      </aside>
    </form>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between gap-4"><dt className="text-ink-muted">{k}</dt><dd className="font-semibold">{v}</dd></div>;
}
