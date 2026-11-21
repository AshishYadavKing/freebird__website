/**
 * Website store: shared types and the cart.
 *
 * The cart lives in the visitor's browser (localStorage) and only holds what's needed to
 * show it; prices, stock and totals always come fresh from the CRM (/shop/quote).
 */
import { useSyncExternalStore } from "react";

export type ShopVariant = { id: number; price: number; in_stock: boolean; max_quantity: number; label?: string | null; sku?: string };

export type ShopProduct = {
  id: number;
  name: string;
  slug: string;
  short_description: string | null;
  brand: string | null;
  category: { name: string; slug: string } | null;
  price_from: number;
  in_stock: boolean;
  image_url: string | null;
  variants: ShopVariant[];
  // detail only
  description?: string | null;
  highlights?: string[];
  images?: string[];
  specifications?: { name: string; value: string }[];
};

export type ShopCategory = { id: number; name: string; slug: string; description: string | null; image_url: string | null; product_count: number };

export type ShopOptions = {
  pickup_branches: { id: number; name: string; address: string | null }[];
  delivery_available: boolean;
  tax_rate: number;
  free_shipping_min: number;
};

export type ProductPage = { items: ShopProduct[]; page: number; last_page: number; total: number; category: { name: string; slug: string; description: string | null } | null };

export type Quote = {
  lines: { variant_id: number; product_slug: string; name: string; variant_label: string | null; image_url: string | null; unit_price: number; quantity: number; line_total: number }[];
  subtotal: number;
  shipping: number;
  tax_rate: number;
  tax: number;
  discount: number;
  total: number;
  fulfillment: "pickup" | "delivery";
  branch: { id: number; name: string; address: string | null };
  coupon: { code: string; applied: boolean; message: string | null } | null;
};

export type ShopOrder = {
  order_number: string;
  state: "paid" | "pending" | "processing" | "expired" | string;
  order_status?: string;
  placed_at?: string;
  fulfillment?: "pickup" | "delivery";
  pickup?: { club: string | null; address: string | null; phone: string | null } | null;
  delivery_address?: string | null;
  email?: string | null;
  items?: { name: string; options: string | null; quantity: number; unit_price: number; line_total: number }[];
  subtotal?: number;
  shipping?: number;
  tax?: number;
  discount?: number;
  total?: number;
};

// ── Cart ─────────────────────────────────────────────────────────────────────────
export type CartLine = { variant_id: number; quantity: number; slug: string; name: string; label: string | null; price: number; image_url: string | null; max: number };

const KEY = "fb-cart-v1";
const EVENT = "fb-cart-change";
const EMPTY: CartLine[] = [];
let cache: { raw: string | null; lines: CartLine[] } = { raw: null, lines: EMPTY };

function read(): CartLine[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return EMPTY;
  }
  if (raw === cache.raw) return cache.lines;
  let lines: CartLine[] = EMPTY;
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) lines = parsed.filter((l) => l && Number.isInteger(l.variant_id) && l.quantity > 0);
  } catch { /* corrupted: start empty */ }
  cache = { raw, lines };
  return lines;
}

function write(lines: CartLine[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(lines));
  } catch { /* storage full / private mode */ }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  const onStorage = (e: StorageEvent) => { if (e.key === KEY) cb(); };
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", onStorage); // other tabs
  return () => { window.removeEventListener(EVENT, cb); window.removeEventListener("storage", onStorage); };
}

/** The cart, kept in sync across components and tabs. Empty during server rendering. */
export function useCart(): CartLine[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export const cart = {
  add(line: Omit<CartLine, "quantity">, quantity = 1) {
    const lines = [...read()];
    const i = lines.findIndex((l) => l.variant_id === line.variant_id);
    if (i >= 0) lines[i] = { ...lines[i], ...line, quantity: Math.min(line.max, lines[i].quantity + quantity) };
    else lines.push({ ...line, quantity: Math.min(line.max, quantity) });
    write(lines);
  },
  setQuantity(variantId: number, quantity: number) {
    write(read().map((l) => (l.variant_id === variantId ? { ...l, quantity: Math.max(1, Math.min(l.max, quantity)) } : l)));
  },
  remove(variantId: number) {
    write(read().filter((l) => l.variant_id !== variantId));
  },
  clear() {
    write([]);
  },
};

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.quantity, 0);
