"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { postJson } from "@/lib/client-api";
import { SITE } from "@/lib/site";
import { JOIN_STORAGE } from "./JoinWizard";

type State = "checking" | "active" | "processing" | "unknown" | "expired";

/**
 * After Stripe: confirm the membership is active. The status call also activates the
 * membership itself if Stripe's webhook is late, so members see "active" right away.
 */
export function JoinComplete({ refId }: { refId: string }) {
  const [state, setState] = useState<State>("checking");
  const [startsAt, setStartsAt] = useState<string | null>(null);

  useEffect(() => {
    let saved: { token?: string; ref?: string } | null = null;
    try {
      saved = JSON.parse(sessionStorage.getItem(JOIN_STORAGE) ?? "null");
    } catch { /* ignore */ }

    let tries = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const poll = async () => {
      // Paid in another browser/tab (no saved session): we can't poll, but payment went through.
      if (!saved?.token || saved.ref !== refId) return setState("unknown");
      tries++;
      const res = await postJson<{ state: string; starts_at?: string }>("signup/status", { token: saved!.token, signup_ref: refId });
      const s = res.data?.state;
      if (s === "active") {
        setStartsAt(res.data?.starts_at ?? null);
        setState("active");
        sessionStorage.removeItem(JOIN_STORAGE);
        return;
      }
      if (s === "expired") return setState("expired");
      if (tries >= 40) return setState("processing");
      setState("checking");
      timer = setTimeout(poll, 3000);
    };
    timer = setTimeout(poll, 0);
    return () => clearTimeout(timer);
  }, [refId]);

  if (state === "active") {
    return (
      <div className="flex flex-col items-start gap-6">
        <span className="flex h-18 w-18 items-center justify-center rounded-full bg-go-tint p-4">
          <svg aria-hidden="true" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0E7A44" strokeWidth="2.5"><path d="M5 12l5 5 9-10" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
        <h1 className="h-display text-6xl">Welcome to the flock.</h1>
        <p className="lead max-w-xl">
          Your membership is active{startsAt ? ` from ${new Date(startsAt).toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" })}` : ""}. A copy of your signed agreement and your receipt are on their way to your email.
        </p>
        <AppBox />
      </div>
    );
  }

  if (state === "expired") {
    return (
      <div className="flex flex-col items-start gap-5">
        <h1 className="h-display text-5xl">That payment link expired</h1>
        <p className="lead">Nothing was charged. Start again and it only takes a minute.</p>
        <Link href="/join" className="btn-primary">Join again</Link>
      </div>
    );
  }

  if (state === "processing" || state === "unknown") {
    return (
      <div className="flex flex-col items-start gap-5">
        <h1 className="h-display text-5xl">Payment received — almost there</h1>
        <p className="lead max-w-xl">We’re finishing your membership. You’ll get an email as soon as it’s active, and it will show in the Free Bird app. Questions? Email <a href={`mailto:${SITE.email}`} className="text-sky underline">{SITE.email}</a>.</p>
        <AppBox />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-4" role="status">
      <h1 className="h-display text-5xl">Confirming your membership…</h1>
      <p className="lead">This usually takes a few seconds. Please keep this page open.</p>
    </div>
  );
}

function AppBox() {
  return (
    <div className="card flex max-w-xl flex-col gap-3 !p-6">
      <h2 className="font-bold">Next: get the Free Bird app</h2>
      <p className="text-muted">Log in with the phone number you just verified to see your QR check-in, book trainers and track workouts.</p>
      <div className="flex flex-wrap gap-3">
        <a href={SITE.appStore} className="btn-dark">App Store</a>
        <a href={SITE.playStore} className="btn-dark">Google Play</a>
      </div>
    </div>
  );
}
