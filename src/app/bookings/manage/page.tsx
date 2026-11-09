import type { Metadata } from "next";
import { ManageBooking } from "@/components/booking/ManageBooking";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = { title: "Manage my booking", robots: { index: false } };

export default async function ManagePage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  return (
    <>
      <PageHero eyebrow="Bookings" title="Manage my booking">Find a court booking or rehab appointment to check or cancel it.</PageHero>
      <section className="container-site py-16">
        <ManageBooking initialRef={ref && /^[0-9a-f-]{36}$/i.test(ref) ? ref : ""} />
      </section>
    </>
  );
}
