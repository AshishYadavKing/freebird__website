import { PageHero } from "@/components/PageHero";
import { getLegal } from "@/lib/crm";
import { sanitizeHtml as sanitize } from "@/lib/sanitize";
import { SITE } from "@/lib/site";

export async function LegalPage({ kind, title }: { kind: "privacy" | "terms" | "refund"; title: string }) {
  const html = await getLegal(kind);
  return (
    <>
      <PageHero eyebrow="Legal" title={title} />
      <section className="container-site py-14">
        {html ? (
          <article className="prose-crm max-w-3xl" dangerouslySetInnerHTML={{ __html: sanitize(html) }} />
        ) : (
          <p className="card max-w-3xl text-ink-soft">This page is being updated. For a copy, email <a href={`mailto:${SITE.email}`} className="text-sky underline">{SITE.email}</a>.</p>
        )}
      </section>
    </>
  );
}
