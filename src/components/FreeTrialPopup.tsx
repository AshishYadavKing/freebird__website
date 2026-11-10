"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FreePassForm, TRIAL_CLAIMED_KEY, type ClubOption } from "@/components/forms/Forms";

const DISMISSED_KEY = "fb-free-trial-dismissed";
const DELAY_MS = 12_000;           // show after 12 s on the site…
const SNOOZE_DAYS = 14;            // …and not again for 2 weeks after closing it
const HIDDEN_ON = [/^\/join/, /^\/free-pass/, /^\/bookings/, /^\/privacy/, /^\/terms/, /^\/refund-policy/];

function storageGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** True when the visitor already claimed a trial or closed the pop-up recently. */
function suppressed(): boolean {
  if (storageGet(TRIAL_CLAIMED_KEY)) return true;
  const dismissed = Date.parse(storageGet(DISMISSED_KEY) ?? "");
  return Number.isFinite(dismissed) && Date.now() - dismissed < SNOOZE_DAYS * 86_400_000;
}

/**
 * "Try us free for 3 days" pop-up. Opens once per visit after a short delay, or when
 * a desktop visitor moves to leave the page — never on the join / free-pass / legal
 * pages, never again after a claim, and not for two weeks after it is closed.
 */
export function FreeTrialPopup({ clubs }: { clubs: ClubOption[] }) {
  const path = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const [claimed, setClaimed] = useState(false);
  // The form is only built once the pop-up opens, so pages with their own forms never
  // contain a second, hidden copy of the same fields.
  const [mounted, setMounted] = useState(false);
  const shownThisVisit = useRef(false);
  const hiddenHere = HIDDEN_ON.some((r) => r.test(path));

  useEffect(() => {
    if (hiddenHere || shownThisVisit.current || clubs.length === 0) return;

    const open = () => {
      if (shownThisVisit.current || suppressed() || !dialog.current || dialog.current.open) return;
      shownThisVisit.current = true;
      setMounted(true);
      dialog.current.showModal();
    };
    const timer = setTimeout(open, DELAY_MS);
    // Exit intent (desktop): pointer leaves through the top of the window.
    const onLeave = (e: MouseEvent) => { if (e.clientY <= 0 && !e.relatedTarget) open(); };
    document.addEventListener("mouseout", onLeave);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseout", onLeave);
    };
  }, [hiddenHere, clubs.length]);

  function close() {
    if (!claimed) {
      try {
        localStorage.setItem(DISMISSED_KEY, new Date().toISOString());
      } catch { /* ignore */ }
    }
    dialog.current?.close();
  }

  if (hiddenHere && !mounted) return null;

  return (
    <dialog
      ref={dialog}
      aria-labelledby="trial-title"
      onCancel={(e) => { e.preventDefault(); close(); }}
      onClick={(e) => { if (e.target === dialog.current) close(); }}
      className="m-auto w-[min(640px,calc(100vw-2rem))] max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-[24px] p-0 text-ink shadow-2xl backdrop:bg-ink/70 backdrop:backdrop-blur-sm"
    >
      {mounted && (
      <div className="relative">
        <div className="bg-ink px-6 pb-6 pt-8 text-ink-text sm:px-8">
          <button type="button" onClick={close} aria-label="Close" className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full text-ink-muted hover:bg-white/10 hover:text-white">
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
          <p className="font-display text-sm font-bold uppercase tracking-[0.14em] text-fire-light">Limited to one per person</p>
          <h2 id="trial-title" className="h-display mt-1 text-4xl sm:text-5xl">Try Free Bird free for 3 days</h2>
          <ul className="mt-4 grid gap-1.5 text-[15px] text-[#C9D0DC] sm:grid-cols-3">
            <li>✓ No payment needed</li>
            <li>✓ Full gym access</li>
            <li>✓ Sauna &amp; spa</li>
          </ul>
        </div>
        <div className="px-6 py-6 sm:px-8">
          <FreePassForm clubs={clubs} onSuccess={() => setClaimed(true)} />
          {claimed ? (
            <button type="button" onClick={close} className="btn-secondary mt-4 w-full">Done</button>
          ) : (
            <button type="button" onClick={close} className="mt-4 w-full text-center text-sm font-semibold text-muted underline-offset-2 hover:underline">No thanks</button>
          )}
        </div>
      </div>
      )}
    </dialog>
  );
}
