import type { Metadata } from "next";
import Link from "next/link";
import { ClubPlans, type ClubPlansData } from "@/components/ClubPlans";
import { tiersOf } from "@/components/PlanCard";
import { getClubs, getPlans } from "@/lib/crm";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Memberships & prices",
  description: "Free Bird Gym membership plans for Mississauga and Brampton. Join online in minutes — monthly, bi-weekly and paid-in-full options.",
};

const FAQ = [
  { q: "Can I try the gym before I join?", a: "Yes. Claim a free 3-day pass online — no payment needed." },
  { q: "Is tax included in the prices?", a: "Prices are shown before tax. You see the exact total, including tax and any initiation fee, before you pay." },
  { q: "How do I sign up?", a: "Choose a plan, confirm your phone with a text code, enter your details, sign the agreement online and pay by card. Your membership appears in the Free Bird app straight away." },
  { q: "How do I cancel or change my membership?", a: "Your agreement explains the cancellation rules for your plan, including any notice period. Contact the club and we’ll help." },
];

export default async function MembershipsPage() {
  const clubs = await getClubs();
  const data: ClubPlansData[] = [];
  for (const { club, branch } of clubs) {
    if (!branch) continue;
    data.push({ name: club.name, branchId: branch.id, online: branch.online_membership_sales, tiers: tiersOf((await getPlans(branch.id)).membership) });
  }

  return (
    <>
      <section className="border-b border-line bg-mist">
        <div className="container-site flex flex-col items-center gap-5 py-20 text-center">
          <p className="eyebrow">Memberships</p>
          <h1 className="h-display text-5xl sm:text-7xl">A plan for every goal</h1>
          <p className="lead max-w-2xl">Gain strength, lose weight, move better. Join online, pay securely, and your membership appears in the Free Bird app right away.</p>
        </div>
      </section>

      <section className="container-site py-16">
        {data.length ? <ClubPlans clubs={data} /> : <p className="card text-center">Plans are temporarily unavailable. Please try again shortly.</p>}
        <p className="mt-6 text-center text-sm text-subtle">All prices in CAD, before tax. Final total — including tax and initiation fees — is shown before you pay.</p>
      </section>

      <section className="container-site flex flex-wrap gap-6 pb-24">
        <div className="flex flex-1 basis-[400px] flex-col gap-4 rounded-[24px] bg-ink p-10 text-ink-text">
          <h2 className="h-display text-4xl">Corporate memberships</h2>
          <p className="text-[#C9D0DC]">Group rates for teams. Your staff join with a company code and you get one invoice.</p>
          <Link href="/corporate" className="btn-primary self-start">Get a company quote</Link>
        </div>
        <div className="flex flex-1 basis-[480px] flex-col gap-3">
          <h2 className="h-section mb-2">Questions</h2>
          {FAQ.map((f, i) => (
            <details key={f.q} open={i === 0} className="rounded-[14px] border border-line bg-mist px-5 py-4">
              <summary className="cursor-pointer font-semibold">{f.q}</summary>
              <p className="mt-2 text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
