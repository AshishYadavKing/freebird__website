import { PageHero } from "@/components/PageHero";
import { getLegal } from "@/lib/crm";
import { SITE } from "@/lib/site";

/** Remove scripts, inline handlers and javascript: links from CRM-authored HTML. */
function sanitize(html: string): string {
  return html
    .replace(/<\s*(script|style|iframe|object|embed|form)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|style|iframe|object|embed|link|meta)[^>]*\/?>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*("|')\s*javascript:[^"']*\2/gi, '$1="#"');
}

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
