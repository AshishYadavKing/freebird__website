import type { Metadata } from "next";
import { CorporateForm } from "@/components/forms/Forms";
import { PageHero } from "@/components/PageHero";
import { clubOptions } from "@/lib/crm";

export const revalidate = 300;
export const metadata: Metadata = { title: "Corporate memberships", description: "Group gym memberships for your team in Mississauga and Brampton. One invoice, team rates." };

const BENEFITS = [
  { t: "Team rates", d: "Lower monthly pricing for every employee who joins." },
  { t: "One invoice", d: "Simple billing for your company, or staff pay their own discounted rate." },
  { t: "Healthier teams", d: "24/7 access in Mississauga fits any shift pattern." },
];

export default async function CorporatePage() {
  const clubs = await clubOptions();
  return (
    <>
      <PageHero eyebrow="Corporate memberships" title="Keep your team strong">
        Give your staff a real perk: a clean, uncrowded gym with coaches on hand.
      </PageHero>
      <section className="container-site grid gap-5 py-14 md:grid-cols-3">
        {BENEFITS.map((b) => (
          <div key={b.t} className="card"><h2 className="text-xl font-bold">{b.t}</h2><p className="mt-1 text-muted">{b.d}</p></div>
        ))}
      </section>
      <section className="container-site pb-20">
        <div className="card max-w-3xl">
          <h2 className="h-section mb-6 !text-4xl">Request a quote</h2>
          <CorporateForm clubs={clubs} />
        </div>
      </section>
    </>
  );
}
