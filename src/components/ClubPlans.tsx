"use client";

import { useState } from "react";
import { PlanCard, type PlanTier } from "./PlanCard";

export type ClubPlansData = { name: string; branchId: number; online: boolean; tiers: PlanTier[] };

export function ClubPlans({ clubs }: { clubs: ClubPlansData[] }) {
  const [active, setActive] = useState(0);
  const club = clubs[active];
  if (!club) return null;

  return (
    <div className="flex flex-col gap-10">
      {clubs.length > 1 && (
        <div role="group" aria-label="Choose your club" className="mx-auto inline-flex rounded-[14px] border border-line bg-white p-1.5">
          {clubs.map((c, i) => (
            <button key={c.branchId} type="button" aria-pressed={i === active} onClick={() => setActive(i)}
              className={`rounded-[10px] px-6 py-3 text-[15px] font-bold transition ${i === active ? "bg-ink text-white" : "text-ink-soft hover:bg-mist"}`}>
              {c.name}
            </button>
          ))}
        </div>
      )}

      {!club.online && (
        <p className="mx-auto max-w-xl rounded-xl border border-line bg-mist px-4 py-3 text-center text-sm text-ink-soft">
          Online sign-up isn’t open at {club.name} yet — visit or call the club to join.
        </p>
      )}

      {club.tiers.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {club.tiers.map((t, i) => <PlanCard key={t.price.id} tier={t} branchId={club.branchId} featured={t.plan.is_popular || (i === 0 && !club.tiers.some((x) => x.plan.is_popular))} />)}
        </div>
      ) : (
        <p className="card text-center text-ink-soft">No plans are listed online for {club.name} right now. Please call the club for pricing.</p>
      )}
    </div>
  );
}
