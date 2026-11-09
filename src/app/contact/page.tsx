import type { Metadata } from "next";
import { ClubCard } from "@/components/ClubCard";
import { ContactForm } from "@/components/forms/Forms";
import { PageHero } from "@/components/PageHero";
import { clubOptions } from "@/lib/crm";
import { CLUBS, SITE } from "@/lib/site";

export const revalidate = 300;
export const metadata: Metadata = { title: "Contact us", description: "Call, email or message Free Bird Gym in Mississauga and Brampton." };

export default async function ContactPage() {
  const clubs = await clubOptions();
  return (
    <>
      <PageHero eyebrow="Contact" title="Get in touch">
        Questions about memberships, training or anything else? Send us a message or call your club. Email: <a href={`mailto:${SITE.email}`} className="font-semibold text-sky underline">{SITE.email}</a>
      </PageHero>
      <section className="container-site grid gap-8 py-16 lg:grid-cols-[1.2fr_1fr]">
        <div className="card">
          <h2 className="h-section mb-6 !text-4xl">Send a message</h2>
          <ContactForm clubs={clubs} />
        </div>
        <div className="flex flex-col gap-5">
          {CLUBS.map((c) => <ClubCard key={c.slug} club={c} />)}
        </div>
      </section>
    </>
  );
}
