import Image from "next/image";
import Link from "next/link";
import { ClubCard } from "@/components/ClubCard";
import { FreePassForm } from "@/components/forms/Forms";
import { PlanCard, tiersOf } from "@/components/PlanCard";
import { getClubs, getPlans } from "@/lib/crm";
import { SITE } from "@/lib/site";

export const revalidate = 300;

const PROGRAMS = [
  { href: "/personal-training", title: "1-on-1 Personal Training", text: "Custom plan, diet guidance and weekly progress reviews with a certified coach.", cta: "Book a free consult", icon: "M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12" },
  { href: "/online-training", title: "Online Training", text: "Coaching, workouts and meal plans in the Free Bird app, wherever you train.", cta: "See how it works", icon: "M3 4h18v12H3zM8 20h8M12 16v4" },
  { href: "/rehab", title: "Rehab & Mobility", text: "Recover from injury and move pain-free with guided rehab sessions.", cta: "Request an assessment", icon: "M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10zM9 12h2l1-2 1 4 1-2h1" },
  { href: "/badminton", title: "Badminton Courts", text: "See live court availability and book a slot in seconds.", cta: "Book a court", icon: "M14 8 5 17l2 2 9-9M4 20l1-1M16 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" },
  { href: "/high-spirits-studio", title: "High Spirits Studio", text: "Group classes in a dedicated studio room.", cta: "Learn more", icon: "M12 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM12 7v6M7 10l5 3 5-3M9 21l3-8 3 8" },
];

export default async function Home() {
  const clubs = await getClubs();
  const options = clubs.filter((c) => c.branch).map((c) => ({ id: c.branch!.id, label: c.club.name }));
  const planClub = clubs.find((c) => c.branch?.online_membership_sales) ?? clubs.find((c) => c.branch);
  const tiers = planClub?.branch ? tiersOf((await getPlans(planClub.branch.id)).membership).slice(0, 3) : [];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-ink-text">
        <Image src="/images/gym-floor.webp" alt="" fill priority sizes="100vw" className="object-cover opacity-60" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/75 to-ink/20" />
        <div className="container-site relative flex flex-col gap-7 pb-20 pt-24 sm:pt-28">
          <p className="font-display text-lg font-bold uppercase tracking-[0.14em] text-fire-light">{SITE.years} years of building muscle</p>
          <h1 className="h-display max-w-3xl text-6xl sm:text-8xl lg:text-[112px]">Fly with<br />high spirits.</h1>
          <p className="max-w-xl text-lg text-[#DDE2EA] sm:text-xl">
            Mississauga’s cleanest 24/7 gym and a personal-training studio in Brampton. Custom-built strength equipment, real coaches, and never an overcrowded floor.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/free-pass" className="btn-primary !px-7 !py-4 text-lg">Claim your free 3-day pass</Link>
            <Link href="/memberships" className="btn-light !px-7 !py-4 text-lg">See memberships</Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container-site">
        <dl className="relative -mt-11 grid grid-cols-2 gap-px overflow-hidden rounded-[18px] border border-line bg-line shadow-[var(--shadow-lift)] lg:grid-cols-4">
          {[["24/7", "Access and on-site staff"], [SITE.sqft, "Sq ft in Mississauga"], [SITE.memberCap, "Member cap, never crowded"], ["Hourly", "Cleaning, every day"]].map(([v, l]) => (
            <div key={l} className="bg-white px-6 py-6">
              <dt className="sr-only">{l}</dt>
              <dd className="font-display text-4xl font-extrabold leading-none sm:text-[42px]">{v}</dd>
              <dd className="text-sm text-muted">{l}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Clubs */}
      <section className="container-site py-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 className="h-section">Two clubs. One membership app.</h2>
          <p className="max-w-md text-muted">Pick your home club when you join. Book trainers, courts and classes from the Free Bird app.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {clubs.map(({ club }) => <ClubCard key={club.slug} club={club} />)}
        </div>
      </section>

      {/* Plans */}
      <section className="border-y border-line bg-mist">
        <div className="container-site py-20">
          <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <p className="eyebrow">Memberships</p>
              <h2 className="h-section">Simple plans. Join online in minutes.</h2>
            </div>
            <Link href="/memberships" className="font-semibold text-sky hover:underline">Compare all plans →</Link>
          </div>
          {tiers.length && planClub?.branch ? (
            <div className="grid gap-5 md:grid-cols-3">
              {tiers.map((t, i) => <PlanCard key={t.price.id} tier={t} branchId={planClub.branch!.id} featured={i === 0} />)}
            </div>
          ) : (
            <p className="card text-ink-soft">Our plans are being updated. <Link href="/contact" className="font-semibold text-sky underline">Contact us</Link> for current pricing.</p>
          )}
        </div>
      </section>

      {/* Programs */}
      <section className="container-site py-20">
        <h2 className="h-section mb-8">More than a gym floor</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {PROGRAMS.map((p) => (
            <Link key={p.href} href={p.href} className="card group flex min-h-52 flex-col gap-3 !p-6 transition hover:border-ink">
              <span className="flex h-13 w-13 items-center justify-center rounded-[14px] bg-[#FFF1E6] p-3">
                <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C24E00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={p.icon} /></svg>
              </span>
              <h3 className="text-xl font-bold">{p.title}</h3>
              <p className="text-[15px] text-muted">{p.text}</p>
              <span className="mt-auto font-semibold text-sky group-hover:underline">{p.cta} →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Transformation */}
      <section className="border-t border-line bg-mist">
        <div className="container-site flex flex-wrap items-center gap-12 py-20">
          <Image src="/images/transformation-1.webp" alt="A Free Bird member’s before-and-after transformation" width={560} height={560} className="w-full max-w-[560px] flex-1 basis-[420px] rounded-[20px] object-cover" />
          <div className="flex flex-1 basis-[420px] flex-col gap-5">
            <p className="eyebrow">Real transformations</p>
            <h2 className="h-section">We deliver what we promise.</h2>
            <p className="lead">Personal coaching, a plan built for your body, and weekly check-ins that keep you on track.</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/transformations" className="btn-secondary">See transformations</Link>
              <Link href="/personal-training" className="btn-secondary">Start with a free consult</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Free pass */}
      <section className="container-site py-20">
        <div className="flex flex-wrap items-center gap-10 rounded-[28px] bg-ink p-8 text-ink-text sm:p-12">
          <div className="flex flex-1 basis-[340px] flex-col gap-3">
            <h2 className="h-display text-5xl sm:text-6xl">Try us free for 3 days</h2>
            <p className="text-lg text-[#C9D0DC]">No payment needed. Our front desk will contact you to activate your pass.</p>
          </div>
          <div className="flex-1 basis-[440px] rounded-2xl bg-white p-6 text-ink">
            <FreePassForm clubs={options} />
          </div>
        </div>
      </section>
    </>
  );
}
