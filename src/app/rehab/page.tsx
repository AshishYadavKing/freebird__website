import type { Metadata } from "next";
import { FacilityBooking } from "@/components/booking/FacilityBooking";
import { PageHero } from "@/components/PageHero";
import { getClubs, getFacilities } from "@/lib/crm";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Rehab & mobility",
  description: "Recover from injury and move pain-free. Request a rehab and mobility assessment at Free Bird.",
};

const STEPS = [
  { t: "Assessment", d: "We look at how you move, where it hurts and what you want to get back to." },
  { t: "Your plan", d: "A step-by-step programme of mobility, strength and recovery work." },
  { t: "Progress", d: "Regular check-ins so your plan adapts as you get stronger." },
];

export default async function RehabPage() {
  const clubs = await getClubs();
  const services = [];
  for (const c of clubs) {
    if (!c.branch) continue;
    const list = await getFacilities(c.branch.id, "rehab");
    if (list.length) services.push({ ...c, list });
  }

  return (
    <>
      <PageHero eyebrow="Rehab & mobility" title="Move pain-free again" image>
        Guided rehab for back pain, sports injuries and post-surgery recovery — with coaches who know how to train around it.
      </PageHero>

      <section className="container-site grid gap-5 py-16 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <div key={s.t} className="card">
            <p className="font-display text-5xl font-extrabold text-fire">{i + 1}</p>
            <h2 className="mt-2 text-xl font-bold">{s.t}</h2>
            <p className="mt-1 text-muted">{s.d}</p>
          </div>
        ))}
      </section>

      <section className="border-t border-line bg-mist">
        <div className="container-site flex flex-col gap-10 py-16">
          <div>
            <p className="eyebrow">Request an appointment</p>
            <h2 className="h-section mt-2">Pick a time that suits you</h2>
            <p className="mt-2 text-muted">We’ll confirm your appointment by phone or email.</p>
          </div>
          {services.length === 0 && (
            <p className="card text-ink-soft">Online rehab booking is coming soon. Call <a href="tel:+19054596255" className="font-semibold text-sky underline">905 459 6255</a> to book.</p>
          )}
          {services.map(({ club, list }) => (
            <div key={club.slug} className="flex flex-col gap-5 rounded-[24px] bg-white p-5 sm:p-8">
              <h3 className="font-display text-3xl font-extrabold uppercase">{club.name}</h3>
              <FacilityBooking facilities={list} kind="rehab" />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
