"use client";

import { useState } from "react";
import { COACHING_PLANS, CoachingSignupForm } from "@/components/forms/ExtraForms";

/** Online coaching prices with "Start now" buttons that pick the plan in the sign-up form. */
export function CoachingSection() {
  const [plan, setPlan] = useState<string>(COACHING_PLANS[0].id);

  function start(id: string) {
    setPlan(id);
    document.getElementById("start")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <div className="grid gap-5 md:grid-cols-2">
        {COACHING_PLANS.map((p, i) => (
          <article key={p.id} className={`lift flex flex-col gap-4 ${i === 1 ? "card-dark" : "card"}`}>
            <h3 className={`text-sm font-semibold uppercase tracking-[0.08em] ${i === 1 ? "text-ink-muted" : "text-muted"}`}>{p.label}</h3>
            <p className="flex flex-wrap items-baseline gap-2">
              <span className="font-display text-6xl font-extrabold leading-none">${p.price}</span>
              <span className={i === 1 ? "text-ink-muted" : "text-muted"}>{p.per}</span>
              <s className={`text-lg ${i === 1 ? "text-ink-muted" : "text-subtle"}`}>${p.was}</s>
            </p>
            <button type="button" onClick={() => start(p.id)} className={`mt-auto w-full ${i === 1 ? "btn-primary" : "btn-secondary"}`}>Start now</button>
          </article>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted">
        For all online coaching subscriptions there is a <strong>2-week cancellation notice and no refunds</strong>. Online coaching does not include access to Free Bird gyms — a membership is purchased separately.
      </p>

      <div id="start" className="card mt-10 scroll-mt-24">
        <h3 className="h-section mb-6 !text-4xl">Let’s get started</h3>
        <CoachingSignupForm plan={plan} />
      </div>
    </>
  );
}
