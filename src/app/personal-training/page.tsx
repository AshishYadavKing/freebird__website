import type { Metadata } from "next";
import Image from "next/image";
import { ConsultationBooking } from "@/components/booking/ConsultationBooking";
import { PageHero } from "@/components/PageHero";
import { tiersOf } from "@/components/PlanCard";
import { clubOptions, getClubs, getPlans } from "@/lib/crm";
import { money } from "@/lib/format";
import { fullPlanLabel } from "@/lib/plans";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Personal training",
  description: "1-on-1 personal training in Mississauga and Brampton. Custom workouts, diet guidance and weekly progress reviews. Book a free consultation.",
};

const INCLUDED = ["Customized workout plan", "Diet & nutrition guidance", "One-on-one coaching", "Progress tracking & weekly reviews", "Injury prevention & safe training", "Motivation & accountability"];

export default async function PersonalTrainingPage() {
  const [clubs, options] = await Promise.all([getClubs(), clubOptions()]);
  const ptClub = clubs.find((c) => c.branch);
  const ptTiers = ptClub?.branch ? tiersOf((await getPlans(ptClub.branch.id)).pt).slice(0, 3) : [];

  return (
    <>
      <PageHero eyebrow="Personal training" title="Transform your body with experts" image>
        Fat loss, muscle gain or overall fitness — your certified coach builds a plan for your body and your schedule.
      </PageHero>

      <section className="container-site flex flex-wrap items-center gap-12 py-16">
        <div className="flex flex-1 basis-[420px] flex-col gap-5">
          <h2 className="h-section">What’s included</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {INCLUDED.map((i) => (
              <li key={i} className="flex gap-2 text-ink-soft">
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF6A00" strokeWidth="2.5"><path d="M5 12l5 5 9-10" /></svg>{i}
              </li>
            ))}
          </ul>
        </div>
        <Image src="/images/transformation-2.webp" alt="Member progress with a Free Bird coach" width={520} height={520} className="w-full max-w-[520px] flex-1 basis-[360px] rounded-[20px] object-cover" />
      </section>

      {ptTiers.length > 0 && ptClub?.branch && (
        <section className="border-y border-line bg-mist">
          <div className="container-site py-16">
            <h2 className="h-section mb-8">Training packages</h2>
            <div className="grid gap-5 md:grid-cols-3">
              {ptTiers.map(({ plan, price }) => (
                <article key={price.id} className="card flex flex-col gap-3">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-muted">{fullPlanLabel(plan.name, price)}</h3>
                  <p><span className="font-display text-5xl font-extrabold">{money(price.price)}</span> <span className="text-muted">{price.billing_label} + tax</span></p>
                  {price.total_sessions ? <p className="text-ink-soft">{price.total_sessions} sessions</p> : null}
                  <a href="#consult" className="btn-secondary mt-auto">Start with a free consult</a>
                </article>
              ))}
            </div>
            <p className="mt-4 text-sm text-subtle">Your coach recommends the right package at your free consultation.</p>
          </div>
        </section>
      )}

      <section id="consult" className="container-site flex scroll-mt-24 flex-col gap-8 py-16">
        <div>
          <p className="eyebrow">Free consultation</p>
          <h2 className="h-section mt-2">Talk to a coach first</h2>
          <p className="mt-2 text-muted">A no-pressure chat about your goals, history and the best way to start.</p>
        </div>
        <ConsultationBooking clubs={options} />
      </section>
    </>
  );
}
