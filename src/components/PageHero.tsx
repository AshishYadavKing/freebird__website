import Image from "next/image";
import type { ReactNode } from "react";

export function PageHero({ eyebrow, title, children, image = false }: { eyebrow: string; title: ReactNode; children?: ReactNode; image?: boolean }) {
  if (image) {
    return (
      <section className="relative overflow-hidden bg-ink text-ink-text">
        <Image src="/images/gym-floor.webp" alt="" fill sizes="100vw" className="hero-photo object-cover opacity-45" priority />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-ink/95 to-ink/40" />
        <div className="container-site hero-in relative flex flex-col gap-5 py-20 sm:py-24">
          <p className="font-display text-base font-bold uppercase tracking-[0.14em] text-fire-light">{eyebrow}</p>
          <h1 className="h-display max-w-3xl text-5xl sm:text-7xl">{title}</h1>
          {children && <div className="max-w-2xl text-lg text-[#DDE2EA]">{children}</div>}
        </div>
      </section>
    );
  }
  return (
    <section className="border-b border-line bg-mist">
      <div className="hero-in container-site flex flex-col gap-5 py-16 sm:py-20">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="h-display max-w-4xl text-5xl sm:text-7xl">{title}</h1>
        {children && <div className="lead max-w-2xl">{children}</div>}
      </div>
    </section>
  );
}
