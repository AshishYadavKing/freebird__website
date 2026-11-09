import type { Metadata } from "next";
import { FreePassForm } from "@/components/forms/Forms";
import { PageHero } from "@/components/PageHero";
import { clubOptions } from "@/lib/crm";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Free 3-day pass",
  description: "Try Free Bird Gym free for 3 days. No payment needed — claim your pass online.",
};

export default async function FreePassPage() {
  const clubs = await clubOptions();
  return (
    <>
      <PageHero eyebrow="Free pass" title="Try us free for 3 days" image>
        No payment, no pressure. Tell us where you’d like to train and our front desk will contact you to activate your pass.
      </PageHero>
      <section className="container-site py-16">
        <div className="card max-w-3xl">
          <FreePassForm clubs={clubs} />
        </div>
      </section>
    </>
  );
}
