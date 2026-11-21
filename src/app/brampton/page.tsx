import type { Metadata } from "next";
import { ClubPage } from "@/components/club/ClubPage";
import { PtIntakeForm } from "@/components/forms/ExtraForms";
import { clubOptions } from "@/lib/crm";
import { CLUBS } from "@/lib/site";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Brampton personal training studio",
  description: "Free Bird Gym Brampton: a 12,000 sq ft personal-training-only studio on Orenda Rd with 25+ coaches, custom-built equipment and InBody tracking.",
};

export default async function BramptonPage() {
  const club = CLUBS.find((c) => c.slug === "brampton")!;
  const clubs = await clubOptions();
  const here = clubs.find((c) => club.match.test(c.label));
  return (
    <ClubPage
      club={club}
      formTitle="Get started now"
      formIntro="Fill out our client intake form so we can tailor your training to you. You’ll then get an email about booking your free consultation, or a free tour of the studio."
      form={<PtIntakeForm clubs={clubs} defaultClub={here?.id} />}
    />
  );
}
