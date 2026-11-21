import type { Metadata } from "next";
import Link from "next/link";
import { CoachingSection } from "@/components/CoachingSection";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Online coaching",
  description: "Free Bird online coaching: a personal plan, expert guidance and accountability from anywhere. $250/month or $600 for 3 months.",
};

const STATS = [
  { n: "15+", t: "years of coaching experience", d: "Over 15 years guiding physical transformations." },
  { n: "1,500+", t: "client transformations", d: "Living proof of what expert guidance and a personal plan can do." },
  { n: "25+", t: "certified coaches", d: "A deep team with a wide range of training styles." },
];

const FEATURES = [
  { t: "Your coach in your pocket", d: "Chat with your coach and get feedback in the Free Bird app." },
  { t: "Workouts built for you", d: "Programmes that match your goals, equipment and schedule — at home, at work or at the gym." },
  { t: "Meal plans & tracking", d: "Nutrition guidance, a food diary and progress photos to keep you on track." },
];

export default function OnlineTrainingPage() {
  return (
    <>
      <PageHero eyebrow="Free Bird online coaching" title="Step into a stronger version of you" image>
        Lose weight, get stronger, become more flexible or prepare for competition — with a personal plan, expert guidance and accountability, wherever you are.
      </PageHero>

      <section className="container-site grid gap-5 py-16 md:grid-cols-3">
        {STATS.map((s) => (
          <div key={s.t} className="card">
            <p className="font-display text-5xl font-extrabold text-fire">{s.n}</p>
            <h2 className="mt-1 text-lg font-bold">{s.t}</h2>
            <p className="mt-1 text-muted">{s.d}</p>
          </div>
        ))}
      </section>

      <section className="border-y border-line bg-mist">
        <div className="container-site grid gap-5 py-16 md:grid-cols-3">
          {FEATURES.map((f) => <div key={f.t} className="card"><h2 className="text-xl font-bold">{f.t}</h2><p className="mt-1 text-muted">{f.d}</p></div>)}
        </div>
      </section>

      <section id="prices" className="container-site scroll-mt-24 py-16">
        <p className="eyebrow">Pricing</p>
        <h2 className="h-section mb-8 mt-2">Choose your plan</h2>
        <CoachingSection />
      </section>

      <section className="container-site pb-20">
        <div className="flex flex-wrap items-center justify-between gap-5 rounded-[24px] bg-ink p-8 text-ink-text sm:p-10">
          <div>
            <h2 className="h-display text-4xl">Not sure it’s right for you?</h2>
            <p className="mt-2 text-[#C9D0DC]">Book a free consult and talk it through with a coach first.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/personal-training#consult" className="btn-primary">Book a free consult</Link>
            <Link href="/app" className="btn-light">Get the app</Link>
          </div>
        </div>
      </section>
    </>
  );
}
