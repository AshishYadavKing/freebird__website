import Image from "next/image";
import Link from "next/link";
import { NewsletterForm } from "@/components/forms/Forms";
import { CLUBS, SITE } from "@/lib/site";

const LINKS = [
  { href: "/about", label: "About" },
  { href: "/memberships", label: "Memberships" },
  { href: "/corporate", label: "Corporate memberships" },
  { href: "/personal-training", label: "Personal training" },
  { href: "/online-training", label: "Online training" },
  { href: "/high-spirits-studio", label: "High Spirits Studio" },
  { href: "/transformations", label: "Transformations" },
  { href: "/calorie-calculator", label: "Calorie calculator" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="bg-ink text-ink-muted">
      <div className="container-site grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-4">
          <Image src="/images/logo.png" alt="Free Bird" width={120} height={80} className="h-14 w-auto self-start" />
          <p>Strength, wellness and transformation, powered by certified trainers.</p>
        </div>
        {CLUBS.map((c) => (
          <div key={c.slug} className="flex flex-col gap-1.5">
            <h2 className="mb-1 font-bold text-ink-text">{c.name}</h2>
            <span>{c.address}</span>
            <span>{c.postal}</span>
            <a href={c.phoneHref} className="hover:text-white">{c.phone}</a>
            {c.hours.map((h) => <span key={h}>{h}</span>)}
          </div>
        ))}
        <div className="flex flex-col gap-3">
          <h2 className="font-bold text-ink-text">Tips &amp; offers</h2>
          <NewsletterForm />
        </div>
      </div>
      <div className="container-site border-t border-ink-line py-6">
        <ul className="mb-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {LINKS.map((l) => <li key={l.href}><Link href={l.href} className="hover:text-white">{l.label}</Link></li>)}
        </ul>
        <div className="flex flex-wrap justify-between gap-3 text-[13px] text-[#8A94A7]">
          <span>© {new Date().getFullYear()} {SITE.name} · <a href={`mailto:${SITE.email}`} className="hover:text-white">{SITE.email}</a></span>
          <span className="flex gap-5">
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/refund-policy" className="hover:text-white">Refund policy</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
