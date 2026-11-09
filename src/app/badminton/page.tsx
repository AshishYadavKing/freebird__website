import type { Metadata } from "next";
import { FacilityBooking } from "@/components/booking/FacilityBooking";
import { PageHero } from "@/components/PageHero";
import { getClubs, getFacilities } from "@/lib/crm";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Book a badminton court",
  description: "See live badminton court availability at Free Bird and book a court online in seconds.",
};

export default async function BadmintonPage() {
  const clubs = await getClubs();
  const withCourts = [];
  for (const c of clubs) {
    if (!c.branch) continue;
    const courts = await getFacilities(c.branch.id, "badminton_court");
    if (courts.length) withCourts.push({ ...c, courts });
  }

  return (
    <>
      <PageHero eyebrow="Badminton" title="Book a court">
        Pick a day and time — your court is confirmed instantly. Cancel online up to 2 hours before.
      </PageHero>
      <section className="container-site flex flex-col gap-14 py-14">
        {withCourts.length === 0 && (
          <p className="card text-ink-soft">Online court booking is coming soon. Please call the Brampton club to book: <a href="tel:+19054596255" className="font-semibold text-sky underline">905 459 6255</a>.</p>
        )}
        {withCourts.map(({ club, courts }) => (
          <div key={club.slug} className="flex flex-col gap-6">
            <h2 className="h-section">{club.name}</h2>
            <FacilityBooking facilities={courts} kind="badminton_court" />
          </div>
        ))}
      </section>
    </>
  );
}
