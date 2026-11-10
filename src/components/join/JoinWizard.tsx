"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { ClubPlansData } from "@/components/ClubPlans";
import { FormAlert, SelectField, TextField } from "@/components/forms/Fields";
import { postJson, type ApiResult } from "@/lib/client-api";
import { money } from "@/lib/format";
import { fullPlanLabel } from "@/lib/plans";
import { SignaturePad } from "./SignaturePad";

type Step = "plan" | "phone" | "code" | "details" | "review" | "agreement";
type Selection = { branchId: number; planId: number; priceId: number; label: string; club: string };
type Client = Record<string, string | number | null>;
type Quote = {
  flow: string;
  starts_at: string;
  line_items: { label: string; amount: number }[];
  due_today: { subtotal: number; tax: number; total: number };
  recurring: { rate: number; total: number | null; billing_cycle: string; next_billing_date: string | null } | null;
  commitment: { months: number; ends_at: string | null; cancellation_penalty: number } | null;
  notice_period_days: number | null;
  agreement: { title: string; kind: string };
  requires_guardian: boolean;
};
type Agreement = {
  title: string;
  statutory_notice: string | null;
  facts: [string, string][];
  sections: { key: string; number: number; heading: string; body: string }[];
  contact: { legal_name: string; address: string; email: string; phone: string } | null;
};

export const JOIN_STORAGE = "fb-join";
const STEPS: { id: Step; label: string }[] = [
  { id: "plan", label: "Plan" }, { id: "phone", label: "Verify" }, { id: "details", label: "Details" },
  { id: "review", label: "Review" }, { id: "agreement", label: "Sign & pay" },
];

export function JoinWizard({ clubs, initial, cancelled }: {
  clubs: ClubPlansData[];
  initial: { club?: number; plan?: number; price?: number };
  cancelled: boolean;
}) {
  const preselected = useMemo<Selection | null>(() => {
    for (const c of clubs) {
      if (initial.club && c.branchId !== initial.club) continue;
      const t = c.tiers.find((x) => x.plan.id === initial.plan && x.price.id === initial.price);
      if (t) return { branchId: c.branchId, planId: t.plan.id, priceId: t.price.id, label: tierLabel(t), club: c.name };
    }
    return null;
  }, [clubs, initial]);

  const router = useRouter();
  const [step, setStep] = useState<Step>(preselected ? "phone" : "plan");
  const [sel, setSel] = useState<Selection | null>(preselected);
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(cancelled ? "Payment was cancelled — nothing was charged. You can try again below." : null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Resume after a cancelled Stripe payment (same browser tab session).
  const [resume, setResume] = useState<{ token: string; ref: string; sel: Selection } | null>(null);
  useEffect(() => {
    if (!cancelled) return;
    // sessionStorage only exists in the browser, so read it after the first render.
    const t = setTimeout(() => {
      try {
        const saved = JSON.parse(sessionStorage.getItem(JOIN_STORAGE) ?? "null");
        if (saved?.token && saved?.ref && saved?.sel) setResume(saved);
      } catch { /* ignore */ }
    }, 0);
    return () => clearTimeout(t);
  }, [cancelled]);

  const selection = () => (sel ? { plan_id: sel.planId, plan_price_id: sel.priceId } : {});

  function fail(res: ApiResult) {
    setBusy(false);
    setErrors(res.errors);
    if (res.status === 401) {
      setToken(null);
      setStep("phone");
    }
    setError(Object.keys(res.errors).length ? "Please fix the highlighted fields." : res.message);
  }

  function begin() {
    setBusy(true);
    setError(null);
    setErrors({});
  }

  async function sendCode(e: FormEvent) {
    e.preventDefault();
    begin();
    const res = await postJson("signup/send-code", { phone });
    if (!res.ok) return fail(res);
    setBusy(false);
    setStep("code");
  }

  async function verify(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    begin();
    const code = String(new FormData(e.currentTarget).get("code") ?? "").trim();
    const res = await postJson<{ token: string; client: Client | null }>("signup/verify-code", { phone, code });
    if (!res.ok || !res.data) return fail(res);
    setToken(res.data.token);
    setClient(res.data.client);
    setBusy(false);
    setStep("details");
  }

  async function saveDetails(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    begin();
    const fd = Object.fromEntries(new FormData(e.currentTarget).entries());
    const res = await postJson<{ token: string; client: Client }>("signup/details", { ...fd, token, branch_id: sel!.branchId });
    if (!res.ok || !res.data) return fail(res);
    setToken(res.data.token);
    setClient(res.data.client);
    await loadQuote(res.data.token);
  }

  async function loadQuote(t = token) {
    begin();
    const res = await postJson<Quote>("signup/quote", { token: t, ...selection() });
    if (!res.ok || !res.data) return fail(res);
    setQuote(res.data);
    setBusy(false);
    setStep("review");
  }

  async function loadAgreement() {
    begin();
    const res = await postJson<Agreement>("signup/agreement", { token, ...selection() });
    if (!res.ok || !res.data) return fail(res);
    setAgreement(res.data);
    setBusy(false);
    setStep("agreement");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function checkout(t: string, ref: string, s: Selection) {
    sessionStorage.setItem(JOIN_STORAGE, JSON.stringify({ token: t, ref, sel: s }));
    const res = await postJson<{ state: string; checkout_url?: string }>("signup/checkout", { token: t, plan_id: s.planId, plan_price_id: s.priceId, signup_ref: ref });
    if (!res.ok || !res.data) return fail(res);
    if (res.data.checkout_url) {
      window.location.assign(res.data.checkout_url); // Stripe's hosted page (external)
    } else {
      router.push(`/join/complete?ref=${ref}`);
    }
  }

  async function signAndPay(input: { accepted: boolean; signature: string | null; guardian?: Record<string, string> }) {
    begin();
    const res = await postJson<{ signup_ref: string }>("signup/sign", {
      token, ...selection(), accepted: input.accepted, signature: input.signature ?? "", ...(input.guardian ?? {}),
    });
    if (!res.ok || !res.data) return fail(res);
    await checkout(token!, res.data.signup_ref, sel!);
  }

  const stepIndex = STEPS.findIndex((s) => s.id === (step === "code" ? "phone" : step));

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1">
        <ol aria-label="Progress" className="mb-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
          {STEPS.map((s, i) => (
            <li key={s.id} className={`flex items-center gap-2 ${i <= stepIndex ? "text-ink" : "text-subtle"}`} aria-current={i === stepIndex ? "step" : undefined}>
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold ${i < stepIndex ? "bg-go text-white" : i === stepIndex ? "bg-fire text-ink" : "bg-line text-muted"}`}>
                {i < stepIndex ? "✓" : i + 1}
              </span>
              {s.label}
            </li>
          ))}
        </ol>

        {error && <div className="mb-6"><FormAlert kind="error">{error}</FormAlert></div>}

        {resume && step !== "agreement" && (
          <div className="card mb-6 flex flex-wrap items-center justify-between gap-4 !p-5">
            <p className="text-ink-soft">Your agreement for <strong>{resume.sel.label}</strong> is signed. Finish your payment?</p>
            <button type="button" className="btn-primary" disabled={busy} onClick={() => { begin(); setSel(resume.sel); checkout(resume.token, resume.ref, resume.sel); }}>
              {busy ? "Opening…" : "Resume payment"}
            </button>
          </div>
        )}

        {step === "plan" && (
          <PlanPicker clubs={clubs} onPick={(s) => { setSel(s); setStep("phone"); }} />
        )}

        {step === "phone" && (
          <form onSubmit={sendCode} className="flex max-w-md flex-col gap-4">
            <h1 className="h-display text-5xl">Verify your phone</h1>
            <p className="text-muted">We’ll text you a 4-digit code. You’ll use this number to log in to the Free Bird app.</p>
            <TextField label="Mobile number" name="phone" type="tel" autoComplete="tel" placeholder="(905) 000-0000" required
              value={phone} onChange={(e) => setPhone(e.target.value)} error={errors.phone} />
            <button className="btn-primary" disabled={busy}>{busy ? "Sending…" : "Text me a code"}</button>
            <p className="text-xs text-subtle">Message and data rates may apply.</p>
          </form>
        )}

        {step === "code" && (
          <form onSubmit={verify} className="flex max-w-md flex-col gap-4">
            <h1 className="h-display text-5xl">Enter your code</h1>
            <p className="text-muted">Sent to <strong>{phone}</strong>. <button type="button" className="font-semibold text-sky underline" onClick={() => setStep("phone")}>Change number</button></p>
            <TextField label="4-digit code" name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={4} pattern="\d{4}" required error={errors.code} />
            <button className="btn-primary" disabled={busy}>{busy ? "Checking…" : "Verify"}</button>
            <button type="button" className="text-sm font-semibold text-sky underline" disabled={busy} onClick={(e) => sendCode(e as unknown as FormEvent)}>Send a new code</button>
          </form>
        )}

        {step === "details" && (
          <form onSubmit={saveDetails} className="flex flex-col gap-5">
            <h1 className="h-display text-5xl">{client?.first_name ? `Welcome back, ${client.first_name}` : "Your details"}</h1>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="First name" name="first_name" autoComplete="given-name" required defaultValue={str(client?.first_name)} error={errors.first_name} />
              <TextField label="Last name" name="last_name" autoComplete="family-name" required defaultValue={str(client?.last_name)} error={errors.last_name} />
              <TextField label="Email" name="email" type="email" autoComplete="email" required defaultValue={str(client?.email)} error={errors.email} />
              <TextField label="Date of birth" name="dob" type="date" required defaultValue={str(client?.dob)} error={errors.dob} />
              <SelectField label="Gender (optional)" name="gender" defaultValue={str(client?.gender)} error={errors.gender}>
                <option value="">Prefer not to say</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </SelectField>
              <TextField label="Postal code" name="zip_code" autoComplete="postal-code" required defaultValue={str(client?.zip_code)} error={errors.zip_code} />
              <TextField label="Street address" name="address" autoComplete="street-address" required defaultValue={str(client?.address)} error={errors.address} className="sm:col-span-2" />
            </div>
            <fieldset className="grid gap-4 rounded-2xl border border-line p-5 sm:grid-cols-3">
              <legend className="px-1 text-sm font-bold">Emergency contact</legend>
              <TextField label="Name" name="emergency_contact_person" required defaultValue={str(client?.emergency_contact_person)} error={errors.emergency_contact_person} />
              <TextField label="Phone" name="emergency_phone" type="tel" required defaultValue={str(client?.emergency_phone)} error={errors.emergency_phone} />
              <TextField label="Relationship" name="emergency_relationship" defaultValue={str(client?.emergency_relationship)} error={errors.emergency_relationship} />
            </fieldset>
            <button className="btn-primary self-start" disabled={busy}>{busy ? "Saving…" : "Continue"}</button>
          </form>
        )}

        {step === "review" && quote && (
          <div className="flex flex-col gap-6">
            <h1 className="h-display text-5xl">Review your membership</h1>
            <Terms quote={quote} />
            <div className="flex flex-wrap gap-3">
              <button type="button" className="btn-primary" disabled={busy} onClick={loadAgreement}>{busy ? "Loading…" : "Read & sign the agreement"}</button>
              <button type="button" className="btn-secondary" onClick={() => setStep("plan")}>Change plan</button>
            </div>
          </div>
        )}

        {step === "agreement" && agreement && quote && (
          <SignStep agreement={agreement} quote={quote} busy={busy} errors={errors} onSubmit={signAndPay} />
        )}
      </div>

      {sel && (
        <aside aria-label="Your selection" className="card flex w-full flex-col gap-4 lg:sticky lg:top-24 lg:w-[360px]">
          <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-muted">Your membership</h2>
          <div>
            <p className="font-display text-3xl font-extrabold uppercase leading-tight">{sel.label}</p>
            <p className="text-sm text-muted">{sel.club} club</p>
          </div>
          {quote ? (
            <>
              <ul className="flex flex-col gap-2 border-y border-line py-4 text-[15px]">
                {quote.line_items.map((l) => (
                  <li key={l.label} className="flex justify-between gap-4"><span className="text-ink-soft">{l.label}</span><span>{money(l.amount, { cents: true })}</span></li>
                ))}
              </ul>
              <p className="flex items-baseline justify-between"><span className="font-bold">Due today</span><span className="font-display text-4xl font-extrabold">{money(quote.due_today.total, { cents: true })}</span></p>
            </>
          ) : (
            <p className="text-sm text-subtle">Your exact total, including tax, appears after your details.</p>
          )}
          {step !== "plan" && step !== "agreement" && (
            <button type="button" className="self-start text-sm font-semibold text-sky underline" onClick={() => { setQuote(null); setStep("plan"); }}>Change plan</button>
          )}
        </aside>
      )}
    </div>
  );

  function str(v: unknown) {
    return v == null ? "" : String(v);
  }
}

function tierLabel(t: ClubPlansData["tiers"][number]) {
  return fullPlanLabel(t.plan.name, t.price);
}

function PlanPicker({ clubs, onPick }: { clubs: ClubPlansData[]; onPick: (s: Selection) => void }) {
  const [clubIdx, setClubIdx] = useState(0);
  const club = clubs[clubIdx];
  if (!club) return <p className="card">No plans are available online right now. Please <Link href="/contact" className="text-sky underline">contact us</Link>.</p>;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="h-display text-5xl">Choose your club &amp; plan</h1>
      <div role="group" aria-label="Club" className="flex flex-wrap gap-3">
        {clubs.map((c, i) => (
          <button key={c.branchId} type="button" aria-pressed={i === clubIdx} onClick={() => setClubIdx(i)}
            className={`rounded-[14px] border-2 px-5 py-3 text-left font-bold ${i === clubIdx ? "border-fire bg-[#FFF4EB]" : "border-line bg-white"}`}>
            {c.name}
          </button>
        ))}
      </div>
      {!club.online ? (
        <p className="card text-ink-soft">Online sign-up isn’t open at {club.name} yet. Please visit or call the club to join.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {club.tiers.map((t) => (
            <button key={t.price.id} type="button"
              onClick={() => onPick({ branchId: club.branchId, planId: t.plan.id, priceId: t.price.id, label: tierLabel(t), club: club.name })}
              className="card flex flex-col gap-2 !p-6 text-left transition hover:border-fire">
              <span className="text-xs font-bold uppercase tracking-[0.08em] text-muted">{tierLabel(t)}</span>
              <span><span className="font-display text-5xl font-extrabold">{money(t.price.price)}</span> <span className="text-muted">{t.price.billing_label}</span></span>
              <span className="text-sm text-ink-soft">
                {t.price.initiation_fee > 0 ? `${money(t.price.initiation_fee)} initiation fee` : "No initiation fee"}
                {t.price.has_commitment ? ` · ${t.price.commitment_months ?? 12}-month commitment` : ""}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Terms({ quote }: { quote: Quote }) {
  const rows: [string, string][] = [["Starts", quote.starts_at]];
  if (quote.recurring) {
    rows.push(["Then", `${money(quote.recurring.rate, { cents: true })} + tax, ${quote.recurring.billing_cycle}${quote.recurring.next_billing_date ? `, from ${quote.recurring.next_billing_date}` : ""}`]);
  }
  if (quote.commitment) {
    rows.push(["Commitment", `${quote.commitment.months} months${quote.commitment.ends_at ? ` (to ${quote.commitment.ends_at})` : ""}`]);
    if (quote.commitment.cancellation_penalty > 0) rows.push(["Early cancellation fee", money(quote.commitment.cancellation_penalty, { cents: true })]);
  }
  if (quote.notice_period_days) rows.push(["Cancellation notice", `${quote.notice_period_days} days`]);
  rows.push(["Payment", "Card, processed securely by Stripe"]);

  return (
    <dl className="card grid gap-x-6 gap-y-3 !p-6 sm:grid-cols-[180px_1fr]">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-sm font-semibold text-muted">{k}</dt>
          <dd className="text-ink">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function SignStep({ agreement, quote, busy, errors, onSubmit }: {
  agreement: Agreement;
  quote: Quote;
  busy: boolean;
  errors: Record<string, string>;
  onSubmit: (input: { accepted: boolean; signature: string | null; guardian?: Record<string, string> }) => void;
}) {
  const [accepted, setAccepted] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [guardianSig, setGuardianSig] = useState<string | null>(null);
  const [guardian, setGuardian] = useState({ guardian_name: "", guardian_relationship: "", guardian_phone: "" });
  const ready = accepted && !!signature && (!quote.requires_guardian || (!!guardianSig && guardian.guardian_name && guardian.guardian_relationship));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="h-display text-5xl">{agreement.title}</h1>
      {agreement.statutory_notice && <p className="rounded-xl border-2 border-ink bg-mist p-4 text-sm font-bold">{agreement.statutory_notice}</p>}

      <div className="max-h-[60vh] overflow-y-auto rounded-2xl border border-line p-6" tabIndex={0} aria-label="Agreement text">
        <dl className="mb-6 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-[200px_1fr]">
          {agreement.facts.map(([k, v]) => (
            <div key={k} className="contents"><dt className="font-semibold text-muted">{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>
        {agreement.sections.map((s) => (
          <section key={s.key} className="mb-5">
            <h2 className="mb-2 font-bold">{s.number}. {s.heading}</h2>
            <p className="whitespace-pre-line text-[15px] text-ink-soft">{s.body}</p>
          </section>
        ))}
        {agreement.contact && (
          <p className="text-sm text-muted">Cancellation contact: {agreement.contact.legal_name}, {agreement.contact.address} · {agreement.contact.email} · {agreement.contact.phone}</p>
        )}
      </div>

      <SignaturePad label="Your signature" onChange={setSignature} />
      {errors.signature && <p className="field-error">{errors.signature}</p>}

      {quote.requires_guardian && (
        <fieldset className="flex flex-col gap-4 rounded-2xl border border-line p-5">
          <legend className="px-1 text-sm font-bold">Parent or guardian (member is under 18)</legend>
          <div className="grid gap-4 sm:grid-cols-3">
            <TextField label="Guardian name" name="guardian_name" required value={guardian.guardian_name} onChange={(e) => setGuardian({ ...guardian, guardian_name: e.target.value })} />
            <TextField label="Relationship" name="guardian_relationship" required value={guardian.guardian_relationship} onChange={(e) => setGuardian({ ...guardian, guardian_relationship: e.target.value })} />
            <TextField label="Phone" name="guardian_phone" type="tel" value={guardian.guardian_phone} onChange={(e) => setGuardian({ ...guardian, guardian_phone: e.target.value })} />
          </div>
          <SignaturePad label="Guardian signature" onChange={setGuardianSig} />
        </fieldset>
      )}

      <label className="flex items-start gap-3 text-[15px]">
        <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-fire" />
        <span>I have read and accept this agreement, and I agree to pay <strong>{money(quote.due_today.total, { cents: true })}</strong> today{quote.recurring ? " and the recurring payments described above" : ""}.</span>
      </label>
      {errors.accepted && <p className="field-error">{errors.accepted}</p>}

      <button type="button" className="btn-primary self-start !px-8 !py-4 text-lg" disabled={!ready || busy}
        onClick={() => onSubmit({ accepted, signature, guardian: quote.requires_guardian ? { ...guardian, guardian_signature: guardianSig ?? "" } : undefined })}>
        {busy ? "Securing your spot…" : `Sign & pay ${money(quote.due_today.total, { cents: true })}`}
      </button>
      <p className="text-sm text-subtle">You’ll be taken to Stripe’s secure payment page. Free Bird never sees or stores your card number.</p>
    </div>
  );
}
