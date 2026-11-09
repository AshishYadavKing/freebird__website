import type { Metadata } from "next";
import type { ClubPlansData } from "@/components/ClubPlans";
import { JoinWizard } from "@/components/join/JoinWizard";
import { tiersOf } from "@/components/PlanCard";
import { getClubs, getPlans } from "@/lib/crm";

export const metadata: Metadata = { title: "Join online", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function JoinPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const q = await searchParams;
  const clubs = await getClubs();
  const data: ClubPlansData[] = [];
  for (const { club, branch } of clubs) {
    if (!branch) continue;
    data.push({ name: club.name, branchId: branch.id, online: branch.online_membership_sales, tiers: tiersOf((await getPlans(branch.id)).membership) });
  }

  const n = (v?: string) => (v && /^\d+$/.test(v) ? Number(v) : undefined);

  return (
    <section className="container-site py-12 sm:py-16">
      <JoinWizard clubs={data} initial={{ club: n(q.club), plan: n(q.plan), price: n(q.price) }} cancelled={q.cancelled === "1"} />
    </section>
  );
}
