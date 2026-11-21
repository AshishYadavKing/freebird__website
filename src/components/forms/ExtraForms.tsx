"use client";

import { useState, type FormEvent } from "react";
import { attribution, postJson } from "@/lib/client-api";
import { ConsentCheckbox, FormAlert, Honeypot, SelectField, TextArea, TextField, formToObject } from "./Fields";
import type { ClubOption } from "./Forms";
import { LeadForm } from "./LeadForm";

/*
 * Website forms that reach the CRM through the contact-request channel (Website → Inbox,
 * with the usual staff alerts). Their extra answers are written into the message so the
 * front desk sees everything in one place.
 */

type Data = Record<string, unknown>;
const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** "Label: value" lines for the fields that were filled in. */
function lines(pairs: [string, unknown][]): string {
  return pairs.filter(([, v]) => str(v)).map(([k, v]) => `${k}: ${str(v)}`).join("\n");
}

function required(data: Data, fields: Record<string, string>): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const [k, msg] of Object.entries(fields)) if (!str(data[k])) errors[k] = msg;
  return errors;
}

const today = () => new Date().toISOString().slice(0, 10);

// ── High Spirits podcast studio ──────────────────────────────────────────────────
export const STUDIO_OPTIONS = [
  "Hourly rental (without editing)",
  "Monthly – 4 days × 3 hours ($2,400)",
  "Monthly full package – 4 days × 3 hours + 4 long & 4 short edited videos ($2,700)",
];

export function StudioRequestForm() {
  return (
    <LeadForm
      endpoint="leads/contact"
      submitLabel="Send booking request"
      successMessage="Thanks! We’ve got your studio request. Our team will contact you shortly to confirm your booking."
      prepare={(d) => {
        const errors = required(d, {
          mobile: "Enter your phone number.",
          date: "Choose the date you’d like.",
          time: "Choose a start time.",
          hours: "How many hours do you need?",
        });
        if (Object.keys(errors).length) return { errors };
        return {
          data: {
            full_name: d.full_name, email: d.email, mobile: d.mobile, marketing_consent: d.marketing_consent,
            reason: "Podcast studio booking",
            message: lines([["Package", d.package], ["Requested date", d.date], ["Preferred time", d.time], ["Number of hours", d.hours], ["Other details", d.details]]),
          },
        };
      }}
    >
      {(e) => (
        <>
          <TextField label="Name" name="full_name" autoComplete="name" required error={e.full_name} />
          <TextField label="Phone" name="mobile" type="tel" autoComplete="tel" required error={e.mobile} />
          <TextField label="Email" name="email" type="email" autoComplete="email" required error={e.email} className="sm:col-span-2" />
          <SelectField label="Rental option" name="package" defaultValue={STUDIO_OPTIONS[0]} className="sm:col-span-2">
            {STUDIO_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </SelectField>
          <TextField label="Requested date" name="date" type="date" min={today()} required error={e.date} />
          <TextField label="Preferred time" name="time" type="time" step={1800} required error={e.time} />
          <TextField label="Number of hours" name="hours" type="number" min={1} max={12} inputMode="numeric" required error={e.hours} />
          <TextArea label="Other details (optional)" name="details" className="sm:col-span-2" />
          <div className="sm:col-span-2"><ConsentCheckbox /></div>
        </>
      )}
    </LeadForm>
  );
}

// ── Online coaching sign-up ──────────────────────────────────────────────────────
export const COACHING_PLANS = [
  { id: "monthly", label: "Month to month", price: 250, was: 300, per: "/month" },
  { id: "3-months", label: "3-month subscription", price: 600, was: 750, per: "/3 months" },
] as const;

export function CoachingSignupForm({ plan }: { plan: string }) {
  return (
    <LeadForm
      endpoint="leads/contact"
      submitLabel="Start online coaching"
      successMessage="You’re in! A Free Bird coach will contact you within one business day to set up your plan and payment."
      prepare={(d, form) => {
        const errors = required(d, { mobile: "Enter your phone number.", goal: "Tell us your main fitness goal." });
        const agree = (form.elements.namedItem("terms") as HTMLInputElement | null)?.checked;
        if (!agree) errors.terms = "Please confirm you’ve read the cancellation terms.";
        if (Object.keys(errors).length) return { errors };
        const p = COACHING_PLANS.find((x) => x.id === d.plan) ?? COACHING_PLANS[0];
        return {
          data: {
            full_name: d.full_name, email: d.email, mobile: d.mobile, marketing_consent: d.marketing_consent,
            reason: "Online coaching sign-up",
            message: lines([["Plan", `${p.label} – $${p.price}${p.per}`], ["Main fitness goal", d.goal], ["Terms", "Accepted 2-week cancellation notice, no refunds"]]),
          },
        };
      }}
    >
      {(e) => (
        <>
          <SelectField label="Plan" name="plan" key={plan} defaultValue={plan} className="sm:col-span-2">
            {COACHING_PLANS.map((p) => <option key={p.id} value={p.id}>{p.label} – ${p.price}{p.per}</option>)}
          </SelectField>
          <TextField label="Name" name="full_name" autoComplete="name" required error={e.full_name} />
          <TextField label="Phone" name="mobile" type="tel" autoComplete="tel" required error={e.mobile} />
          <TextField label="Email" name="email" type="email" autoComplete="email" required error={e.email} className="sm:col-span-2" />
          <TextArea label="What is your main fitness goal?" name="goal" required error={e.goal} className="sm:col-span-2" />
          <div className="sm:col-span-2">
            <label className="flex items-start gap-3 text-sm text-ink-soft">
              <input type="checkbox" name="terms" className="mt-0.5 h-5 w-5 shrink-0 accent-fire" />
              I understand there is a 2-week cancellation notice and no refunds, and that online coaching does not include access to Free Bird gyms.
            </label>
            {e.terms && <p className="field-error mt-1">{e.terms}</p>}
          </div>
          <div className="sm:col-span-2"><ConsentCheckbox /></div>
        </>
      )}
    </LeadForm>
  );
}

// ── Personal training intake (5 steps) ───────────────────────────────────────────
const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const FREQUENCY = ["Rarely or never", "Once a week", "2–3 times a week", "4 or more times a week"];
const SLOTS = ["Early morning (5–8 AM)", "Morning (8 AM–12 PM)", "Afternoon (12–5 PM)", "Evening (5–10 PM)", "Weekends"];
const GOALS = ["Weight loss / a specific body-fat percentage", "Muscle gain and strength", "Improved flexibility and mobility", "Overall health and wellness"];
const STEP_TITLES = ["Your details", "About you", "Workout history", "Availability", "Fitness goals"];

/** Which fields each step checks before moving on. */
const STEP_REQUIRED: Record<number, Record<string, string>> = {
  0: { full_name: "Enter your name.", email: "Enter your email.", mobile: "Enter your phone number." },
  1: { address: "Enter your address.", gender: "Choose an option.", age: "Enter your age.", branch_id: "Choose a location." },
  2: { level: "Choose your fitness level.", frequency: "Choose how often you train." },
  3: { availability: "Tell us when you’re free for a consultation." },
  4: {},
};

export function PtIntakeForm({ clubs, defaultClub }: { clubs: ClubOption[]; defaultClub?: number }) {
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [age, setAge] = useState("");
  const minor = Number(age) > 0 && Number(age) < 18;

  function check(form: HTMLFormElement, s: number): Record<string, string> {
    const d = formToObject(form);
    const fd = new FormData(form);
    const errs = required(d, STEP_REQUIRED[s]);
    if (s === 0 && str(d.email) && !/^\S+@\S+\.\S+$/.test(str(d.email))) errs.email = "Enter a valid email.";
    if (s === 1 && minor && !str(d.guardian_phone)) errs.guardian_phone = "Under 18: add a parent or guardian’s phone number.";
    if (s === 3 && fd.getAll("slots").length === 0) errs.slots = "Pick at least one time slot.";
    if (s === 4 && fd.getAll("goals").length === 0) errs.goals = "Pick at least one goal.";
    return errs;
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const errs = check(form, step);
    setErrors(errs);
    setMessage(null);
    if (Object.keys(errs).length) return;
    if (step < 4) { setStep(step + 1); return; }

    // Final check of every step (in case the browser restored an old page).
    for (let s = 0; s < 4; s++) {
      const bad = check(form, s);
      if (Object.keys(bad).length) { setErrors(bad); setStep(s); setMessage("Please fix the highlighted fields."); return; }
    }

    const d = formToObject(form);
    const fd = new FormData(form);
    const club = clubs.find((c) => String(c.id) === str(d.branch_id));
    setBusy(true);
    const res = await postJson("leads/contact", {
      full_name: d.full_name, email: d.email, mobile: d.mobile, branch_id: d.branch_id, marketing_consent: d.marketing_consent,
      website: d.website, // honeypot
      reason: "Personal training intake",
      message: lines([
        ["Address", d.address], ["Gender", d.gender], ["Age", d.age], ["Parent / guardian phone", d.guardian_phone],
        ["Preferred location", club?.label], ["Fitness level", d.level], ["Activity", d.frequency], ["Workout history", d.history],
        ["Availability for consultation", d.availability], ["Training time slots", fd.getAll("slots").join(", ")],
        ["Goals", fd.getAll("goals").join(", ")],
      ]),
      ...attribution(),
    });
    setBusy(false);
    if (res.ok) { setDone(true); return; }
    setErrors(res.errors);
    setMessage(Object.keys(res.errors).length ? "Please check your details." : res.message);
    if (res.errors.full_name || res.errors.email || res.errors.mobile) setStep(0);
  }

  if (done) {
    return (
      <FormAlert kind="success">
        Thank you! We’ve received your intake form. You’ll get an email shortly about booking your free consultation.
      </FormAlert>
    );
  }

  // Every step stays in the form (hidden when not current) so nothing typed is lost.
  // The fade-in replays whenever a hidden step is shown again; nothing is re-created.
  const show = (s: number) => (s === step ? "swap-in grid gap-4 sm:col-span-2 sm:grid-cols-2" : "hidden");

  return (
    <form onSubmit={submit} noValidate className="relative flex flex-col gap-6">
      <Honeypot />
      <div>
        <p className="text-sm font-semibold text-muted">Step {step + 1} of 5 · {STEP_TITLES[step]}</p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
          <div className="h-full rounded-full bg-fire transition-[width] duration-500" style={{ width: `${((step + 1) / 5) * 100}%` }} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className={show(0)}>
          <TextField label="Name" name="full_name" autoComplete="name" required error={errors.full_name} />
          <TextField label="Email" name="email" type="email" autoComplete="email" required error={errors.email} />
          <TextField label="Phone" name="mobile" type="tel" autoComplete="tel" required error={errors.mobile} className="sm:col-span-2" />
        </div>
        <div className={show(1)}>
          <TextField label="Address" name="address" autoComplete="street-address" required error={errors.address} className="sm:col-span-2" />
          <SelectField label="Gender" name="gender" defaultValue="" required error={errors.gender}>
            <option value="" disabled>Choose</option>
            <option>Male</option><option>Female</option><option>Prefer not to say</option>
          </SelectField>
          <TextField label="Age" name="age" type="number" min={10} max={100} inputMode="numeric" required error={errors.age} value={age} onChange={(ev) => setAge(ev.target.value)} />
          {minor && <TextField label="Parent / guardian phone" name="guardian_phone" type="tel" required error={errors.guardian_phone} className="sm:col-span-2" />}
          <SelectField label="Preferred training location" name="branch_id" defaultValue={defaultClub ? String(defaultClub) : ""} required error={errors.branch_id} className="sm:col-span-2">
            <option value="" disabled>Choose a location</option>
            {clubs.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </SelectField>
        </div>
        <div className={show(2)}>
          <SelectField label="How would you describe your current fitness level?" name="level" defaultValue="" required error={errors.level} className="sm:col-span-2">
            <option value="" disabled>Choose</option>
            {LEVELS.map((l) => <option key={l}>{l}</option>)}
          </SelectField>
          <SelectField label="How often are you physically active now?" name="frequency" defaultValue="" required error={errors.frequency} className="sm:col-span-2">
            <option value="" disabled>Choose</option>
            {FREQUENCY.map((l) => <option key={l}>{l}</option>)}
          </SelectField>
          <TextArea label="Anything else about your workout history? (optional)" name="history" className="sm:col-span-2" />
        </div>
        <div className={show(3)}>
          <TextField label="When are you free for an in-person consultation?" name="availability" placeholder="e.g. Weekdays after 6 PM" required error={errors.availability} className="sm:col-span-2" />
          <fieldset className="sm:col-span-2">
            <legend className="field-label">Which times work best for your training sessions?</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {SLOTS.map((s) => (
                <label key={s} className="flex items-center gap-3 rounded-[10px] border border-line px-3 py-2.5 text-ink-soft">
                  <input type="checkbox" name="slots" value={s} className="h-5 w-5 accent-fire" />{s}
                </label>
              ))}
            </div>
            {errors.slots && <p className="field-error mt-1">{errors.slots}</p>}
          </fieldset>
        </div>
        <div className={show(4)}>
          <fieldset className="sm:col-span-2">
            <legend className="field-label">What are your main fitness goals?</legend>
            <div className="mt-2 grid gap-2">
              {GOALS.map((g) => (
                <label key={g} className="flex items-center gap-3 rounded-[10px] border border-line px-3 py-2.5 text-ink-soft">
                  <input type="checkbox" name="goals" value={g} className="h-5 w-5 accent-fire" />{g}
                </label>
              ))}
            </div>
            {errors.goals && <p className="field-error mt-1">{errors.goals}</p>}
          </fieldset>
          <div className="sm:col-span-2"><ConsentCheckbox /></div>
        </div>
      </div>

      {message && <FormAlert kind="error">{message}</FormAlert>}

      <div className="flex flex-wrap gap-3">
        {step > 0 && <button type="button" className="btn-secondary" onClick={() => { setErrors({}); setStep(step - 1); }}>← Back</button>}
        <button type="submit" className="btn-primary" disabled={busy}>
          {step < 4 ? "Continue →" : busy ? "Sending…" : "Submit"}
        </button>
      </div>
    </form>
  );
}
