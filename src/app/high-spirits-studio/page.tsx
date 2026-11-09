import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = { title: "High Spirits Studio", description: "Group classes in Free Bird’s dedicated studio room." };

export default function StudioPage() {
  return (
    <>
      <PageHero eyebrow="High Spirits Studio" title="Train together" image>
        Group classes in a dedicated studio room — energy, music and a coach leading the way.
      </PageHero>
      <section className="container-site flex flex-col gap-6 py-16">
        <h2 className="h-section">Classes</h2>
        <p className="card text-ink-soft">[CLASS TYPES & WEEKLY TIMETABLE — to be provided by the gym. Members book classes in the Free Bird app.]</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/free-pass" className="btn-primary">Try a class free</Link>
          <Link href="/memberships" className="btn-secondary">See memberships</Link>
        </div>
      </section>
    </>
  );
}
