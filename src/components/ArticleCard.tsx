import Image from "next/image";
import Link from "next/link";
import type { ArticleSummary } from "@/lib/crm";

export function articleDate(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" }) : "";
}

export function ArticleCard({ a, large = false }: { a: ArticleSummary; large?: boolean }) {
  return (
    <Link href={`/articles/${a.slug}`} className={`group flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-white transition hover:border-ink ${large ? "md:flex-row" : ""}`}>
      <div className={`relative aspect-[1200/630] w-full bg-mist ${large ? "md:w-3/5" : ""}`}>
        {a.cover_url ? (
          <Image src={a.cover_url} alt="" fill sizes={large ? "(min-width: 768px) 60vw, 100vw" : "(min-width: 768px) 33vw, 100vw"} className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-3xl font-extrabold uppercase text-line-strong">Free Bird</div>
        )}
      </div>
      <div className={`flex flex-1 flex-col gap-3 p-6 ${large ? "md:justify-center md:p-10" : ""}`}>
        <p className="text-xs font-bold uppercase tracking-[0.1em] text-ember">
          {[a.category, `${a.reading_minutes} min read`].filter(Boolean).join(" · ")}
        </p>
        <h3 className={`font-display font-extrabold uppercase leading-tight group-hover:text-ember ${large ? "text-4xl sm:text-5xl" : "text-2xl"}`}>{a.title}</h3>
        {a.excerpt && <p className={`text-muted ${large ? "text-lg" : "line-clamp-3"}`}>{a.excerpt}</p>}
        <p className="mt-auto pt-2 text-sm text-subtle">{[a.author_name, articleDate(a.published_at)].filter(Boolean).join(" · ")}</p>
      </div>
    </Link>
  );
}
