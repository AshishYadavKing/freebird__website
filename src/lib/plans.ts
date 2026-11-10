import type { PlanPrice } from "./crm";

const CYCLE: Record<string, string> = {
  weekly: "Weekly",
  "bi-weekly": "Bi-weekly",
  monthly: "Monthly",
  "3-month": "Every 3 months",
  "6-month": "Every 6 months",
  "9-month": "Every 9 months",
  yearly: "Yearly",
};

/**
 * Customer-facing name for a price tier. Staff name tiers with internal codes
 * ("Commitment-biweekly-60$", "Prepaid-12mo-$1099"), so recurring tiers are described
 * from their real terms and one-time tiers get a cleaned-up version of their name.
 */
export function tierLabel(p: Pick<PlanPrice, "name" | "billing_cycle" | "has_commitment" | "commitment_months">): string {
  // A tier name that already reads like words ("8 sessions / month") is kept as written.
  if (p.name && !looksLikeCode(p.name)) return p.name.trim();
  const cycle = CYCLE[(p.billing_cycle ?? "").toLowerCase()];
  if (cycle) {
    return p.has_commitment ? `${cycle} · ${p.commitment_months ?? 12}-month commitment` : `${cycle} · No commitment`;
  }
  return cleanName(p.name) || (p.billing_cycle === "one-time" ? "Paid in full" : "");
}

/** Staff codes: contain a price ("60$", "$650") or words glued with dashes ("Prepaid-12mo"). */
function looksLikeCode(name: string): boolean {
  return /\$/.test(name) || /\w-\w/.test(name);
}

/** "Prepaid-12mo-$1099" → "Prepaid 12 months", "10 Day Pass - $169.99" → "10 Day Pass". */
export function cleanName(name: string | null): string {
  if (!name) return "";
  return name
    .replace(/[-–—]?\s*\$\s?\d+(?:[.,]\d+)?|\d+(?:[.,]\d+)?\s?\$/g, "") // prices
    .replace(/(\d+)\s?mo\b/gi, (_, n) => `${n} month${n === "1" ? "" : "s"}`)
    .replace(/(\d+)\s?yr\b/gi, (_, n) => `${n} year${n === "1" ? "" : "s"}`)
    .replace(/[-_]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** "General Membership · Bi-weekly · 12-month commitment" (skips the tier part when it adds nothing). */
export function fullPlanLabel(planName: string, p: Parameters<typeof tierLabel>[0]): string {
  let tier = tierLabel(p);
  // "Prepaid · Prepaid 12 months" → "Prepaid · 12 months"
  if (tier.toLowerCase().startsWith(planName.toLowerCase() + " ")) tier = tier.slice(planName.length).trim();
  return tier && tier.toLowerCase() !== planName.toLowerCase() ? `${planName} · ${tier}` : planName;
}
