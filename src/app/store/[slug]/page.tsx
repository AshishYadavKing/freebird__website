import { permanentRedirect } from "next/navigation";

/**
 * Old freebirdgym.com store links (/store/<old-product>, /store/category/…, /store/page/2,
 * /store/checkout). Product addresses changed, so they all land on the store home,
 * except "checkout", which goes to the cart.
 */
export default async function OldStoreLink({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  permanentRedirect(slug === "checkout" ? "/store/cart" : "/store");
}
