import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "About Free Bird", description: "15+ years of building muscle. The story behind Free Bird Health Clubs." };

const VALUES = [
  { t: "Never overcrowded", d: `Our Mississauga club is capped at ${SITE.memberCap} members, so you never wait for equipment.` },
  { t: "Spotless, always", d: "Hourly cleaning, every day — the cleanest 24/7 gym in Mississauga." },
  { t: "Built for lifters", d: "Custom-built strength equipment, cable trainers and free weights for every level." },
  { t: "Real coaching", d: "Certified trainers who build plans around your body, goals and schedule." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="About us" title={`${SITE.years} years of building muscle`} image>
        Free Bird started with a simple idea: a gym that delivers what it promises.
      </PageHero>
      <section className="container-site flex flex-wrap items-center gap-12 py-16">
        <div className="flex flex-1 basis-[420px] flex-col gap-4">
          <h2 className="h-section">Fly with high spirits</h2>
          <p className="lead">[OUR STORY — a few lines from Jayant about how Free Bird began, who it’s for, and what makes the coaching different.]</p>
          <Link href="/free-pass" className="btn-primary self-start">Visit us free for 3 days</Link>
        </div>
        <Image src="/images/gym-floor.webp" alt="The Free Bird Mississauga gym floor" width={640} height={480} className="w-full max-w-[640px] flex-1 basis-[420px] rounded-[20px] object-cover" />
      </section>
      <section className="border-t border-line bg-mist">
        <div className="container-site grid gap-5 py-16 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v) => (
            <div key={v.t} className="card"><h3 className="text-xl font-bold">{v.t}</h3><p className="mt-1 text-muted">{v.d}</p></div>
          ))}
        </div>
      </section>
    </>
  );
}
