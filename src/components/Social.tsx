import { CLUBS, SITE } from "@/lib/site";

/** Instagram + Facebook icon links. */
export function SocialLinks({ className = "" }: { className?: string }) {
  const cls = "flex h-10 w-10 items-center justify-center rounded-full border border-current/25 transition-colors duration-300 hover:border-fire hover:text-fire";
  return (
    <div className={`flex gap-3 ${className}`}>
      <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" aria-label="Free Bird Gym on Instagram" className={cls}>
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
      </a>
      <a href={SITE.facebook} target="_blank" rel="noopener noreferrer" aria-label="Free Bird Gym on Facebook" className={cls}>
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M14 8h3V4h-3c-2.8 0-4.5 1.9-4.5 4.6V11H7v4h2.5v9h4v-9h3l.5-4h-3.5V8.8c0-.5.3-.8.5-.8Z" /></svg>
      </a>
    </div>
  );
}

/**
 * "What our members say" — sends visitors to the clubs' Google reviews.
 * (Showing the review text itself on the site needs a Google Places API key.)
 */
export function GoogleReviews({ only }: { only?: (typeof CLUBS)[number]["slug"] }) {
  const clubs = only ? CLUBS.filter((c) => c.slug === only) : CLUBS;
  return (
    <section className="border-t border-line bg-mist">
      <div className="container-site flex flex-wrap items-center justify-between gap-8 py-16">
        <div className="max-w-xl">
          <p className="eyebrow">What our members say</p>
          <h2 className="h-section mt-2">Don’t take our word for it</h2>
          <p className="mt-2 text-muted">Read our members’ reviews straight from Google — and follow along on Instagram and Facebook.</p>
          <SocialLinks className="mt-5 text-ink" />
        </div>
        <div className="flex flex-wrap gap-3">
          {clubs.map((c) => (
            <a key={c.slug} href={c.reviewsUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary">
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" className="text-fire" fill="currentColor"><path d="m12 2 3 6.6 7 .7-5.3 4.8 1.5 7L12 17.6 5.8 21l1.5-7L2 9.3l7-.7Z" /></svg>
              {c.name} reviews on Google
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
