import type { Metadata } from "next";
import { CorporateForm } from "@/components/forms/Forms";
import { PageHero } from "@/components/PageHero";
import { clubOptions } from "@/lib/crm";

export const revalidate = 300;
export const metadata: Metadata = { title: "Corporate memberships", description: "Group gym memberships for your team in Mississauga and Brampton. One invoice, team rates." };

const OFFER = [
  "State-of-the-art equipment", "24/7 access to the facility", "Customized fitness programs", "Fitness challenges and events",
  "Sauna, steam and showers", "Group classes", "Preferred membership rate", "Nutrition, supplement & smoothie bar",
  "1 free assessment and 1 free personal training session for each employee", "Library and lounge area",
];

const BENEFITS = [
  { t: "Improved employee health", d: "Regular exercise lowers the risk of heart disease, diabetes and obesity, and supports better mental health." },
  { t: "Increased productivity", d: "More energy, better focus and less fatigue through the working day." },
  { t: "Reduced absenteeism", d: "Healthier employees take fewer sick days and are less prone to injury." },
  { t: "Lower healthcare costs", d: "Prevention through regular exercise can mean fewer claims over time." },
  { t: "Higher morale & retention", d: "A valued perk that helps people feel supported — and makes them more likely to stay." },
  { t: "Better work-life balance", d: "A healthy outlet for stress, plus group classes and events that bring teams together." },
];

export default async function CorporatePage() {
  const clubs = await clubOptions();
  return (
    <>
      <PageHero eyebrow="Corporate memberships" title="Keep your team strong">
        Give your staff a real perk: a clean, uncrowded gym with coaches on hand.
      </PageHero>
      <section className="container-site grid gap-10 py-16 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <p className="eyebrow">The Free Bird membership solution</p>
          <h2 className="h-section">What we offer your team</h2>
          <p className="text-muted">Strengthen your team and empower your business with Free Bird corporate memberships.</p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {OFFER.map((o) => (
            <li key={o} className="flex gap-2 text-ink-soft">
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF6A00" strokeWidth="2.5" className="mt-0.5 shrink-0"><path d="M5 12l5 5 9-10" /></svg>{o}
            </li>
          ))}
        </ul>
      </section>
      <section className="border-y border-line bg-mist">
        <div className="container-site py-16">
          <h2 className="h-section mb-8">How it benefits your company</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((b) => (
              <div key={b.t} className="card lift"><h3 className="text-xl font-bold">{b.t}</h3><p className="mt-1 text-muted">{b.d}</p></div>
            ))}
          </div>
        </div>
      </section>
      <section className="container-site py-16">
        <div className="card max-w-3xl">
          <h2 className="h-section mb-6 !text-4xl">Request a quote</h2>
          <CorporateForm clubs={clubs} />
        </div>
      </section>
    </>
  );
}
