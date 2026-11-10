import "server-only";
import { apiGet, apiGetBody, apiGetSafe } from "./api";
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

/* ── Articles (blog) ─────────────────────────────────────────────────────── */

export type ArticleSummary = {
  title: string;
  slug: string;
  excerpt: string | null;
  cover_url: string | null;
  category: string | null;
  author_name: string | null;
  published_at: string | null;
  reading_minutes: number;
  is_featured: boolean;
};

export type Article = ArticleSummary & {
  body: string | null;
  seo_title: string;
  seo_description: string | null;
  updated_at: string | null;
  related: ArticleSummary[];
};

export type ArticlePage = { articles: ArticleSummary[]; page: number; last_page: number; total: number; categories: string[] };

export async function getArticles(opts: { category?: string; page?: number; perPage?: number } = {}): Promise<ArticlePage> {
  const q = new URLSearchParams();
  if (opts.category) q.set("category", opts.category);
  if (opts.page && opts.page > 1) q.set("page", String(opts.page));
  if (opts.perPage) q.set("per_page", String(opts.perPage));
  const data = await apiGetSafe<ArticlePage>(`/website/articles${q.size ? `?${q}` : ""}`, { revalidate: 300, tags: ["articles"] });
  return data ?? { articles: [], page: 1, last_page: 1, total: 0, categories: [] };
}

export async function getArticle(slug: string): Promise<Article | null> {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  return apiGetSafe<Article>(`/website/articles/${slug}`, { revalidate: 300, tags: ["articles", `article:${slug}`] });
}

/** Legal pages (privacy, terms, refund) as HTML managed in the CRM. */
export async function getLegal(kind: "privacy" | "terms" | "refund"): Promise<string | null> {
  const path = { privacy: "/privacy-policy/client", terms: "/terms-and-conditions", refund: "/refund-policy" }[kind];
  // These endpoints return {status, title, content} without a `data` wrapper.
  const body = await apiGetBody<{ content?: string | null }>(path, { revalidate: 3600, tags: ["legal"] });
  const html = body?.content?.trim();
  return html ? html : null;
}

export { apiGet, clubForBranchName };
