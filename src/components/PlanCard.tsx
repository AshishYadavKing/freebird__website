import Link from "next/link";
import type { Plan, PlanPrice } from "@/lib/crm";
import { money } from "@/lib/format";
import { fullPlanLabel } from "@/lib/plans";

export type PlanTier = { plan: Plan; price: PlanPrice };

/** Every sellable (plan, price) pair, popular first, then cheapest. */
export function tiersOf(plans: Plan[] = []): PlanTier[] {
  return plans
    .flatMap((plan) => plan.prices.filter((p) => p.price > 0 || p.initiation_fee > 0).map((price) => ({ plan, price })))
    .sort((a, b) => Number(b.plan.is_popular) - Number(a.plan.is_popular) || a.price.price - b.price.price);
}

function terms(p: PlanPrice): string[] {
  const out: string[] = [];
  if (p.initiation_fee > 0) out.push(`${money(p.initiation_fee)} initiation fee`);
  else out.push("No initiation fee");
  if (p.has_commitment) out.push(`${p.commitment_months ?? 12}-month commitment`);
  else if (p.billing_cycle !== "one-time") out.push("No long-term contract");
  if (p.total_sessions) out.push(`${p.total_sessions} personal-training sessions`);
  return out;
}

export function PlanCard({ tier, branchId, featured = false }: { tier: PlanTier; branchId: number; featured?: boolean }) {
  const { plan, price } = tier;
  const label = fullPlanLabel(plan.name, price);
  const features = plan.features.slice(0, 4);
  const href = `/join?club=${branchId}&plan=${plan.id}&price=${price.id}`;

  return (
    <article className={`relative flex flex-col gap-5 ${featured ? "card-dark" : "card"}`}>
      {featured && (
        <span className="absolute -top-3.5 left-6 rounded-full bg-fire px-3 py-1 text-xs font-extrabold uppercase tracking-[0.08em] text-ink">
          Most popular
        </span>
      )}
      <h3 className={`text-sm font-semibold uppercase tracking-[0.08em] ${featured ? "text-ink-muted" : "text-muted"}`}>{label}</h3>
      <p className="flex items-baseline gap-1.5">
        <span className="font-display text-6xl font-extrabold leading-none">{money(price.price)}</span>
        <span className={featured ? "text-ink-muted" : "text-muted"}>{price.billing_label} + tax</span>
      </p>
      <ul className={`flex flex-col gap-2 ${featured ? "text-[#C9D0DC]" : "text-ink-soft"}`}>
        {features.map((f) => <li key={f.name} className="flex gap-2"><Check />{f.name}</li>)}
        {terms(price).map((t) => <li key={t} className="flex gap-2"><Check />{t}</li>)}
      </ul>
      <Link href={href} className={`mt-auto w-full ${featured ? "btn-primary" : "btn-secondary"}`}>
        Choose {plan.name}
      </Link>
    </article>
  );
}

function Check() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mt-0.5 shrink-0 text-fire">
      <path d="M5 12l5 5 9-10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
