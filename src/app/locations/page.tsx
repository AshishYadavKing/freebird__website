import type { Metadata } from "next";
import Link from "next/link";
import { ClubCard } from "@/components/ClubCard";
import { PageHero } from "@/components/PageHero";
import { CLUBS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Locations — Mississauga & Brampton",
  description: "Free Bird Gym locations: 24/7 gym at 1331 Crestlawn Dr, Mississauga, and personal-training studio at 284 Orenda Rd, Brampton.",
};

export default function LocationsPage() {
  return (
    <>
      <PageHero eyebrow="Locations" title="Find your club">
        One membership app across both clubs. Pick your home club when you join.
      </PageHero>
      <section className="container-site grid gap-5 py-16 md:grid-cols-2">
        {CLUBS.map((c) => <ClubCard key={c.slug} club={c} />)}
      </section>
      <section className="container-site pb-20">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] bg-ink p-8 text-ink-text">
          <h2 className="h-display text-4xl">Not sure which club?</h2>
          <Link href="/free-pass" className="btn-primary">Try both — free 3-day pass</Link>
        </div>
      </section>
    </>
  );
}
