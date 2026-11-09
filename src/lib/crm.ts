import "server-only";
import { apiGet, apiGetSafe } from "./api";
import { clubForBranchName, type Club } from "./site";

/* ── Types matching /api/v1/website/* ─────────────────────────────────────── */

export type Tax = { gst: number; pst: number; hst: number; total_rate: number; exempt?: boolean };

export type Branch = {
  id: number;
  name: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  contact_number: string | null;
  email: string | null;
  image_url: string | null;
  tax: Tax;
  online_membership_sales: boolean;
};

export type PlanPrice = {
  id: number;
  name: string | null;
  price: number;
  billing_cycle: string;
  billing_label: string;
  renewal_behavior: string | null;
  has_commitment: boolean;
  commitment_months: number | null;
  initiation_fee: number;
  yearly_fee: number;
  cancellation_penalty: number;
  notice_period_days: number | null;
  total_sessions: number | null;
  training_mode: string | null;
  has_diet_plan: boolean;
  tax: Tax;
};

export type Plan = {
  id: number;
  name: string;
  slug: string;
  type: "membership" | "pt" | "pt_addon";
  is_popular: boolean;
  features: { name: string; description: string | null; is_inherited_label: boolean }[];
  prices: PlanPrice[];
};

export type ClubWithBranch = { club: Club; branch: Branch | null };

/* ── Queries ─────────────────────────────────────────────────────────────── */

export async function getBranches(): Promise<Branch[]> {
  return (await apiGetSafe<Branch[]>("/website/branches", { tags: ["branches"] })) ?? [];
}

/** The two marketed clubs, each with its live CRM branch when one matches by name. */
export async function getClubs(): Promise<ClubWithBranch[]> {
  const branches = await getBranches();
  const { CLUBS } = await import("./site");
  return CLUBS.map((club) => ({ club, branch: branches.find((b) => club.match.test(b.name)) ?? null }));
}

/** {id, label} for club dropdowns in forms. */
export async function clubOptions(): Promise<{ id: number; label: string }[]> {
  return (await getClubs()).filter((c) => c.branch).map((c) => ({ id: c.branch!.id, label: c.club.name }));
}

export async function getPlans(branchId: number): Promise<Partial<Record<Plan["type"], Plan[]>>> {
  const data = await apiGetSafe<{ plans: Partial<Record<Plan["type"], Plan[]>> }>(`/website/branches/${branchId}/plans`, {
    tags: ["plans"],
  });
  return data?.plans ?? {};
}

export async function getFacilities(branchId: number, kind: "badminton_court" | "rehab") {
  return (
    (await apiGetSafe<Facility[]>(`/website/facilities?branch_id=${branchId}&kind=${kind}`, { revalidate: 60 })) ?? []
  );
}

export type Facility = {
  id: number;
  name: string;
  description: string | null;
  slot_minutes: number;
  max_slots_per_booking: number;
  max_players: number | null;
  price_per_slot: number;
  requires_approval: boolean;
  hours: { weekday: [string, string] | null; weekend: [string, string] | null };
};

/** Legal pages (privacy, terms, refund) as HTML managed in the CRM. */
export async function getLegal(kind: "privacy" | "terms" | "refund"): Promise<string | null> {
  const path = { privacy: "/privacy-policy/client", terms: "/terms-and-conditions", refund: "/refund-policy" }[kind];
  const data = await apiGetSafe<{ content?: string } | string>(path, { revalidate: 3600 });
  if (!data) return null;
  return typeof data === "string" ? data : (data.content ?? null);
}

export { apiGet, clubForBranchName };
