import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Online training", description: "Coaching, workouts and meal plans in the Free Bird app — train with a Free Bird coach from anywhere." };

const FEATURES = [
  { t: "Your coach in your pocket", d: "Chat with your trainer and get feedback in the Free Bird app." },
  { t: "Workouts built for you", d: "Programs that match your goals, equipment and schedule — at home, at work or at the gym." },
  { t: "Meal plans & tracking", d: "Diet plans, a food diary and progress photos to keep you on track." },
];

export default function OnlineTrainingPage() {
  return (
    <>
      <PageHero eyebrow="Online training" title="Train with a coach from anywhere" image>
        Getting to the gym every day can be hard. Online coaching brings the plan, the accountability and the expert to you.
      </PageHero>
      <section className="container-site grid gap-5 py-16 md:grid-cols-3">
        {FEATURES.map((f) => <div key={f.t} className="card"><h2 className="text-xl font-bold">{f.t}</h2><p className="mt-1 text-muted">{f.d}</p></div>)}
      </section>
      <section className="container-site pb-20">
        <div className="flex flex-wrap items-center justify-between gap-5 rounded-[24px] bg-ink p-8 text-ink-text sm:p-10">
          <div>
            <h2 className="h-display text-4xl">Start with a free consultation</h2>
            <p className="mt-2 text-[#C9D0DC]">Talk to a coach, then get set up in the app.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/personal-training#consult" className="btn-primary">Book a free consult</Link>
            <a href={SITE.appStore} className="btn-light">Get the app</a>
          </div>
        </div>
      </section>
    </>
  );
}
