import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Store", description: "Supplements, apparel and gear from Free Bird — shop in the Free Bird app or at the club." };

export default function StorePage() {
  return (
    <>
      <PageHero eyebrow="Store" title="Fuel & gear">
        Supplements, apparel and accessories — order in the Free Bird app for pickup or delivery, or buy at the front desk.
      </PageHero>
      <section className="container-site py-16">
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-[24px] bg-ink p-8 text-ink-text sm:p-10">
          <div className="max-w-xl">
            <h2 className="h-display text-4xl">Shop in the Free Bird app</h2>
            <p className="mt-2 text-[#C9D0DC]">Browse the full catalog, see club stock and check out securely with the same account you use for your membership.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={SITE.appStore} className="btn-primary">App Store</a>
            <a href={SITE.playStore} className="btn-light">Google Play</a>
          </div>
        </div>
      </section>
    </>
  );
}
