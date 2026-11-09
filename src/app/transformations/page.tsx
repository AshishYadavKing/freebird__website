import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = { title: "Transformations", description: "Real results from Free Bird members." };

const STORIES = [
  { img: "/images/transformation-1.webp", alt: "Member before-and-after transformation, front, side and back views" },
  { img: "/images/transformation-2.webp", alt: "Member before-and-after transformation" },
];

export default function TransformationsPage() {
  return (
    <>
      <PageHero eyebrow="Real transformations" title="We deliver what we promise">
        Dedication from our members. A plan and a coach from us.
      </PageHero>
      <section className="container-site grid gap-6 py-16 md:grid-cols-2">
        {STORIES.map((s) => (
          <figure key={s.img} className="card !p-4">
            <Image src={s.img} alt={s.alt} width={640} height={640} className="w-full rounded-[14px] object-cover" />
            <figcaption className="mt-3 text-sm text-muted">[MEMBER NAME] · [PROGRAM] · [TIMEFRAME] — shared with permission.</figcaption>
          </figure>
        ))}
      </section>
      <section className="container-site pb-20">
        <Link href="/personal-training#consult" className="btn-primary">Start your transformation</Link>
      </section>
    </>
  );
}
