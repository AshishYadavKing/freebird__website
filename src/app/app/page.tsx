import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "The Free Bird app", description: "Check in with your QR code, book trainers and courts, track workouts and shop — all in the Free Bird app." };

const FEATURES = ["QR check-in at the door", "Book personal trainers", "Workouts & progress tracking", "Meal plans & food diary", "Shop & order history", "Manage your membership"];

export default function AppPage() {
  return (
    <>
      <PageHero eyebrow="Member app" title="Your membership, in your pocket">
        Members log in with the phone number they joined with — a one-time code, no password to remember.
      </PageHero>
      <section className="container-site grid gap-10 py-16 lg:grid-cols-2">
        <ul className="grid gap-3 sm:grid-cols-2">
          {FEATURES.map((f) => <li key={f} className="card !p-5 font-semibold">{f}</li>)}
        </ul>
        <div className="card-dark flex flex-col gap-4">
          <h2 className="h-display text-4xl">Download</h2>
          <div className="flex flex-wrap gap-3">
            <a href={SITE.appStore} className="btn-primary">App Store</a>
            <a href={SITE.playStore} className="btn-light">Google Play</a>
          </div>
          <p className="text-sm text-ink-muted">Trainer? Ask the front desk for the Free Bird Trainer app.</p>
        </div>
      </section>
    </>
  );
}
