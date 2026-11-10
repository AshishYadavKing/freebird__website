"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NAV } from "@/lib/site";

export function Header() {
  const path = usePathname();
  // The menu belongs to the page it was opened on, so navigating closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === path;
  const setOpen = (fn: (o: boolean) => boolean) => setOpenOn(fn(open) ? path : null);

  // Frosted-glass header once the page has scrolled. Written straight to the DOM
  // (no re-render per scroll event) and batched to one update per frame.
  const header = useRef<HTMLElement>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      header.current?.setAttribute("data-scrolled", String(window.scrollY > 8));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(frame); };
  }, []);

  return (
    <>
      <div className="border-b border-line bg-mist text-[13px] text-muted">
        <div className="container-site flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-2">
          <p className="flex flex-wrap gap-x-5 gap-y-1">
            <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-go" aria-hidden="true" />Mississauga · Open &amp; staffed 24/7</span>
            <span className="hidden sm:inline">Brampton · Mon–Fri 7AM–11PM · Sat–Sun 9AM–9PM</span>
          </p>
          <p className="flex gap-5">
            <a href="tel:+19052381331" className="hover:text-ink">905 238 1331</a>
            <Link href="/app" className="hover:text-ink">Get the app</Link>
          </p>
        </div>
      </div>

      <header ref={header} className="site-header sticky top-0 z-40 border-b border-line bg-white">
        <nav aria-label="Main" className="container-site flex items-center justify-between gap-6 py-3">
          <Link href="/" aria-label="Free Bird Gym home" className="shrink-0">
            <Image src="/images/logo.png" alt="Free Bird" width={120} height={80} priority className="h-11 w-auto" />
          </Link>

          <ul className="hidden items-center gap-1 text-[15px] font-medium lg:flex">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} aria-current={path.startsWith(n.href) ? "page" : undefined}
                  className={`nav-link block px-3 py-2 transition-colors duration-300 ${path.startsWith(n.href) ? "font-bold text-ember" : "hover:text-ember"}`}>
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <Link href="/app" className="btn-secondary hidden !min-h-10 !py-2 sm:inline-flex">Member app</Link>
            <Link href="/join" className="btn-primary !min-h-10 !py-2">Join now</Link>
            <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] border-2 border-ink lg:hidden">
              <svg aria-hidden="true" className="burger" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path className="b1" d="M4 6h16" /><path className="b2" d="M4 12h16" /><path className="b3" d="M4 18h16" />
              </svg>
            </button>
          </div>
        </nav>

        {/* Always rendered so it can slide open and closed; hidden from tab order and screen readers while closed. */}
        <div id="mobile-menu" data-open={open} inert={!open} className="menu-panel border-line bg-white lg:hidden" style={{ borderTopWidth: open ? 1 : 0 }}>
          <div>
            <ul className="container-site flex flex-col py-2">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="block py-3 text-lg font-semibold">{n.label}</Link>
                </li>
              ))}
              <li><Link href="/free-pass" className="block py-3 text-lg font-semibold text-ember">Free 3-day pass</Link></li>
              <li><Link href="/contact" className="block py-3 text-lg font-semibold">Contact</Link></li>
            </ul>
          </div>
        </div>
      </header>
    </>
  );
}
