import type { Club } from "@/lib/site";

export function ClubCard({ club }: { club: Club }) {
  return (
    <article id={club.slug} className="card lift flex scroll-mt-28 flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-4xl font-extrabold uppercase">{club.name}</h3>
        <span className={`pill ${club.openNow247 ? "bg-go-tint text-go" : "bg-sky-tint text-sky"}`}>{club.tag}</span>
      </div>
      <p className="text-ink-soft">
        {club.address} {club.postal}
        <br />
        {club.hours.join(" · ")}
      </p>
      <ul className="grid grid-cols-1 gap-2 text-[15px] text-muted sm:grid-cols-2">
        {club.amenities.map((a) => <li key={a}>{a}</li>)}
      </ul>
      <div className="mt-auto flex flex-wrap gap-3">
        <a href={club.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary">Get directions</a>
        <a href={club.phoneHref} className="btn-secondary">{club.phone}</a>
      </div>
    </article>
  );
}
