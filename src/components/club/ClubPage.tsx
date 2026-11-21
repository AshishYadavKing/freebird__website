import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { GoogleReviews } from "@/components/Social";
import type { Club } from "@/lib/site";

/** Full page for one club: intro, what's inside, features, a sign-up form and reviews. */
export function ClubPage({ club, form, formTitle, formIntro }: { club: Club; form: ReactNode; formTitle: string; formIntro: string }) {
  const p = club.page;
  return (
    <>
      <section className="relative overflow-hidden bg-ink text-ink-text">
        <Image src="/images/gym-floor.webp" alt="" fill sizes="100vw" className="hero-photo object-cover opacity-45" priority />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-ink/95 to-ink/40" />
        <div className="hero-in container-site relative flex flex-col gap-5 py-20 sm:py-24">
          <p className="font-display text-base font-bold uppercase tracking-[0.14em] text-fire-light">Free Bird Gym {club.name}</p>
          <h1 className="h-display max-w-4xl text-5xl sm:text-7xl">{p.title}</h1>
          <p className="max-w-2xl text-lg text-[#DDE2EA]">{p.intro}</p>
          <div className="flex flex-wrap gap-3">
            <a href="#get-started" className="btn-primary">{club.openNow247 ? "Claim your free 3-day pass" : "Get started"}</a>
            <a href={club.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-light">Get directions</a>
          </div>
        </div>
      </section>

      <section className="container-site grid gap-10 py-16 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <h2 className="h-section">{club.openNow247 ? "Built for your growth" : "Your new training home"}</h2>
          <p className="lead">{p.sizeLine}</p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {p.includes.map((i) => (
              <li key={i} className="flex gap-2 text-ink-soft">
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF6A00" strokeWidth="2.5" className="mt-0.5 shrink-0"><path d="M5 12l5 5 9-10" /></svg>{i}
              </li>
            ))}
          </ul>
        </div>
        <div className="card-dark flex flex-col justify-center gap-3">
          <h3 className="h-display text-4xl">{p.highlight.title}</h3>
          <p className="text-[#C9D0DC]">{p.highlight.text}</p>
          <dl className="mt-4 grid gap-3 border-t border-ink-line pt-4 text-sm sm:grid-cols-2">
            <div><dt className="text-ink-muted">Address</dt><dd className="font-semibold">{club.address} {club.postal}</dd></div>
            <div><dt className="text-ink-muted">Phone</dt><dd><a href={club.phoneHref} className="font-semibold hover:text-fire-light">{club.phone}</a></dd></div>
            <div className="sm:col-span-2"><dt className="text-ink-muted">Hours</dt><dd className="font-semibold">{club.hours.join(" · ")}</dd></div>
          </dl>
        </div>
      </section>

      <section className="border-y border-line bg-mist">
        <div className="container-site py-16">
          <h2 className="h-section mb-8">{club.openNow247 ? `Amenities at ${club.name}` : "Why train with us?"}</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {p.features.map((f) => (
              <div key={f.t} className="card lift"><h3 className="text-lg font-bold">{f.t}</h3><p className="mt-1 text-muted">{f.d}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section id="get-started" className="container-site grid scroll-mt-24 gap-10 py-16 lg:grid-cols-[1fr_1.3fr]">
        <div className="flex flex-col gap-4">
          <p className="eyebrow">{club.name}</p>
          <h2 className="h-section">{formTitle}</h2>
          <p className="text-muted">{formIntro}</p>
          <p className="text-ink-soft">📞 <a href={club.phoneHref} className="font-semibold hover:text-ember">{club.phone}</a><br />📍 {club.address} {club.postal}</p>
          <Link href="/locations" className="text-sm font-semibold text-sky underline-offset-2 hover:underline">See both clubs →</Link>
        </div>
        <div className="card">{form}</div>
      </section>

      <GoogleReviews only={club.slug} />
    </>
  );
}
