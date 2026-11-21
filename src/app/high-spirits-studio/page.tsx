import type { Metadata } from "next";
import { StudioRequestForm } from "@/components/forms/ExtraForms";
import { PageHero } from "@/components/PageHero";
import { GoogleReviews } from "@/components/Social";

export const metadata: Metadata = {
  title: "High Spirits Studio — podcast studio for rent",
  description: "Rent Free Bird’s professional podcast studio in Brampton: pro microphones, soundproof room, on-site help. From $200/hour or monthly packages from $2,400.",
};

const WHY = [
  { t: "Professional equipment", d: "Top-tier microphones, mixers and audio interfaces capture every word with crystal clarity." },
  { t: "Soundproof isolation", d: "Our soundproof room removes background noise for a clean, polished sound." },
  { t: "A creative space", d: "Customisable lighting and acoustics, plus a comfortable lounge, so you can focus on your content." },
  { t: "Expert help on site", d: "Our audio team helps with setup, recording and anything technical — no tech skills needed." },
  { t: "Flexible booking", d: "Book by the hour, half-day, full day, or monthly for regular access. No long-term commitment." },
  { t: "Editing & post-production", d: "Optional professional editing, so you walk out ready to publish." },
  { t: "Easy to reach", d: "A prime location with easy access and ample parking." },
  { t: "Lounge with refreshments", d: "Relax before and after recording in a well-equipped lounge." },
];

const STEPS = [
  { t: "Choose your option", d: "By the hour or by the month — pick what fits your podcast." },
  { t: "Send a request", d: "Use the form below. Our team contacts you to confirm your booking." },
  { t: "Arrive & set up", d: "Come a few minutes early; our team gets you set up with the equipment." },
  { t: "Record", d: "Focus on your content while we handle the technical side." },
  { t: "Leave with your files", d: "We help save and transfer your files — and handle editing if you chose it." },
];

export default function StudioPage() {
  return (
    <>
      <PageHero eyebrow="High Spirits Studio" title="Rent our podcast studio" image>
        Bring your voice to life in Free Bird’s professional-grade podcast studio — everything you need to record, produce and edit, without setting up your own space.
      </PageHero>

      <section className="container-site flex flex-col gap-8 py-16">
        <div className="max-w-2xl">
          <p className="eyebrow">Why choose our studio?</p>
          <h2 className="h-section mt-2">Everything you need for top-notch content</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {WHY.map((w) => <div key={w.t} className="card lift"><h3 className="text-lg font-bold">{w.t}</h3><p className="mt-1 text-muted">{w.d}</p></div>)}
        </div>
      </section>

      <section id="prices" className="scroll-mt-24 border-y border-line bg-mist">
        <div className="container-site flex flex-col gap-8 py-16">
          <div>
            <p className="eyebrow">Rental prices</p>
            <h2 className="h-section mt-2">Simple, transparent pricing</h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <article className="card flex flex-col gap-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-muted">Hourly rental <span className="normal-case tracking-normal">(without editing)</span></h3>
              <p><span className="font-display text-6xl font-extrabold">$250</span> <span className="text-muted">/hour · under 4 hours</span></p>
              <p><span className="font-display text-6xl font-extrabold">$200</span> <span className="text-muted">/hour · 4 hours or more</span></p>
              <a href="#book" className="btn-secondary mt-auto">Request a booking</a>
            </article>
            <article className="card-dark flex flex-col gap-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-ink-muted">Monthly rental · 4 days/month, 3 hours/day</h3>
              <p><span className="font-display text-6xl font-extrabold">$2,400</span> <span className="text-ink-muted">/month</span></p>
              <p><span className="font-display text-6xl font-extrabold">$2,700</span> <span className="text-ink-muted">/month · full package</span></p>
              <p className="text-[#C9D0DC]">Full package includes 4 long-form and 4 short-form edited videos.</p>
              <a href="#book" className="btn-primary mt-auto">Request a booking</a>
            </article>
          </div>
        </div>
      </section>

      <section className="container-site flex flex-col gap-8 py-16">
        <h2 className="h-section">How it works</h2>
        <ol className="grid gap-5 md:grid-cols-5">
          {STEPS.map((s, i) => (
            <li key={s.t} className="card">
              <p className="font-display text-5xl font-extrabold text-fire">{i + 1}</p>
              <h3 className="mt-2 font-bold">{s.t}</h3>
              <p className="mt-1 text-sm text-muted">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="book" className="container-site grid scroll-mt-24 gap-10 pb-20 lg:grid-cols-[1fr_1.3fr]">
        <div className="flex flex-col gap-4">
          <p className="eyebrow">Request form</p>
          <h2 className="h-section">Book your studio time</h2>
          <p className="text-muted">Tell us your preferred date, time and how many hours you need. One of our team will contact you shortly to confirm your booking.</p>
          <p className="text-ink-soft">Want to see it first? Mention it in the details and we’ll arrange a tour.</p>
        </div>
        <div className="card"><StudioRequestForm /></div>
      </section>

      <GoogleReviews only="brampton" />
    </>
  );
}
