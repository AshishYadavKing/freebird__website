import type { Metadata } from "next";
import { FacilityBooking } from "@/components/booking/FacilityBooking";
import { PageHero } from "@/components/PageHero";
import { getClubs, getFacilities } from "@/lib/crm";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Rehab & mobility",
  description: "Recover from injury and move pain-free. Request a rehab and mobility assessment at Free Bird.",
};

const APPROACHES = [
  { t: "Manual therapy", s: "Osteopathy, deep tissue, joint mobilization", d: "Hands-on treatment to release restrictions, reduce pain and restore natural movement." },
  { t: "Corrective exercise", s: "Retraining movement patterns", d: "Guided exercises that rebuild balance, improve mobility and make your progress last." },
  { t: "Performance-based care", s: "Building strength and confidence", d: "Performance drills and strength work that leave you feeling capable and resilient in everyday life." },
];
const GOALS = ["Get rid of chronic pain", "Recover from an injury", "Finally feel strong and confident again"];

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
      <PageHero eyebrow="The Prime Motion · Rehab" title="Redefine your prime motion" image>
        Feel better. Move better. Live better. You don’t have to settle for pain, stiffness or feeling limited — recover fully, move freely and perform at your best with our in-house osteopath.
      </PageHero>

      <section className="container-site grid gap-10 py-16 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <p className="eyebrow">Who we help</p>
          <h2 className="h-section">Movement is for everyone</h2>
          <p className="text-ink-soft">Whether you’re chasing peak performance, bouncing back from injury, or just tired of nagging aches and pains, we’re here to get you moving freely again.</p>
          <p className="text-ink-soft">From elite athletes and weekend warriors to busy professionals and parents, our osteopathic care adapts to your lifestyle so you can get back to doing what you love.</p>
        </div>
        <div className="card-dark flex flex-col justify-center gap-3">
          <p className="text-ink-muted">Our mission</p>
          <p className="h-display text-3xl sm:text-4xl">Empower every individual to move freely, recover fully and perform at their highest potential.</p>
        </div>
      </section>

      <section className="border-y border-line bg-mist">
        <div className="container-site flex flex-col gap-8 py-16">
          <div className="max-w-2xl">
            <p className="eyebrow">Not every body needs the same care</p>
            <h2 className="h-section mt-2">Three proven approaches</h2>
            <p className="mt-2 text-muted">We combine them to help you heal, move and perform at your best.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {APPROACHES.map((a, i) => (
              <div key={a.t} className="card lift">
                <p className="font-display text-5xl font-extrabold text-fire">{i + 1}</p>
                <h3 className="mt-2 text-xl font-bold">{a.t}</h3>
                <p className="text-sm font-semibold text-ember">{a.s}</p>
                <p className="mt-2 text-muted">{a.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-site flex flex-wrap items-center justify-between gap-8 py-16">
        <div>
          <h2 className="h-section">Take the first step today</h2>
          <p className="mt-2 text-muted">Your journey to freedom of movement starts here. Whether you want to:</p>
          <ul className="mt-4 flex flex-col gap-2">
            {GOALS.map((g) => <li key={g} className="flex gap-2 text-ink-soft"><span className="text-fire">✓</span>{g}</li>)}
          </ul>
        </div>
        <div className="flex flex-col items-start gap-2">
          <a href="#book" className="btn-primary">Move better — book now</a>
          <p className="text-sm text-muted">Appointments fill up quickly — secure your spot today.</p>
        </div>
      </section>

      <section id="book" className="scroll-mt-24 border-t border-line bg-mist">
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
