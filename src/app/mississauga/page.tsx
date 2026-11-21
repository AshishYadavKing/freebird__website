import type { Metadata } from "next";
import { ClubPage } from "@/components/club/ClubPage";
import { FreePassForm } from "@/components/forms/Forms";
import { clubOptions } from "@/lib/crm";
import { CLUBS } from "@/lib/site";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Mississauga 24/7 gym",
  description: "Free Bird Gym Mississauga: a 23,000 sq ft 24/7 gym near Dixie & Eglinton with 24/7 staff, sauna & spa rooms and custom-built equipment. Capped at 1,500 members.",
};

export default async function MississaugaPage() {
  const club = CLUBS.find((c) => c.slug === "mississauga")!;
  const clubs = await clubOptions();
  return (
    <ClubPage
      club={club}
      formTitle="Request your free 3-day trial"
      formIntro="We’re so confident you’ll enjoy our 23,000 sq ft gym in Mississauga. Come in and work out for 3 days, on us. One per person."
      form={<FreePassForm clubs={clubs} />}
    />
  );
}
