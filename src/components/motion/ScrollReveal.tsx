"use client";

import { useEffect } from "react";

const STAGGER_MS = 80;
const MAX_STAGGER = 5;

/** The blocks of a section that should rise in: headings, text, and each item of a card grid. */
function blocksOf(section: Element): { el: HTMLElement; delay: number }[] {
  let root: Element = section;
  while (root.children.length === 1 && root.firstElementChild instanceof HTMLElement) root = root.firstElementChild;
  const out: { el: HTMLElement; delay: number }[] = [];
  for (const child of Array.from(root.children)) {
    if (!(child instanceof HTMLElement)) continue;
    const isGrid = getComputedStyle(child).display.includes("grid") && child.children.length > 1;
    if (isGrid) {
      Array.from(child.children).forEach((item, i) => {
        if (item instanceof HTMLElement) out.push({ el: item, delay: Math.min(i, MAX_STAGGER) * STAGGER_MS });
      });
    } else {
      out.push({ el: child, delay: 0 });
    }
  }
  return out;
}

/**
 * Apple-style scroll reveal: content below the fold fades and rises into place as it
 * scrolls into view. Only content that starts off-screen is touched, so nothing on the
 * first screen ever flashes; without JavaScript, or with "reduce motion", everything
 * simply shows. Rendered from app/template.tsx, so it re-runs on every page change.
 */
export function ScrollReveal() {
  useEffect(() => {
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    const fold = window.innerHeight;
    const touched: HTMLElement[] = [];
    for (const section of Array.from(document.querySelectorAll("main section"))) {
      if (section.parentElement?.closest("main section")) continue; // top-level sections only
      for (const { el, delay } of blocksOf(section)) {
        if (el.getBoundingClientRect().top < fold) continue; // already on screen
        el.style.setProperty("--reveal-delay", `${delay}ms`);
        el.classList.add("reveal");
        touched.push(el);
        io.observe(el);
      }
    }

    // Clean up after the transition so hover effects (which also use transform) work normally.
    const settle = (e: TransitionEvent) => {
      const el = e.target as HTMLElement;
      if (e.propertyName !== "opacity" || !el.classList.contains("is-visible")) return;
      el.classList.remove("reveal", "is-visible");
      el.style.removeProperty("--reveal-delay");
    };
    document.addEventListener("transitionend", settle);

    return () => {
      io.disconnect();
      document.removeEventListener("transitionend", settle);
      for (const el of touched) el.classList.remove("reveal", "is-visible");
    };
  }, []);

  return null;
}
