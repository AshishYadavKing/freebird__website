import type { Metadata } from "next";
import { CareerForm } from "@/components/forms/Forms";
import { PageHero } from "@/components/PageHero";
import { clubOptions } from "@/lib/crm";

export const revalidate = 300;
export const metadata: Metadata = { title: "Careers", description: "Work at Free Bird Gym — trainers, front desk, rehab and more in Mississauga and Brampton." };

export default async function CareersPage() {
  const clubs = await clubOptions();
  return (
    <>
      <PageHero eyebrow="Careers" title="Coach with us">
        We’re always looking for great trainers, front-desk stars and rehab specialists who love helping people get stronger.
      </PageHero>
      <section className="container-site py-16">
        <div className="card max-w-3xl">
          <h2 className="h-section mb-6 !text-4xl">Apply</h2>
          <CareerForm clubs={clubs} />
        </div>
      </section>
    </>
  );
}
