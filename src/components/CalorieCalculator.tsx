"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { SelectField, TextField, Honeypot, formToObject } from "@/components/forms/Fields";
import { attribution, postJson } from "@/lib/client-api";

const ACTIVITY = [
  { v: 1.2, l: "Sedentary (little or no exercise)" },
  { v: 1.375, l: "Light (1–3 days/week)" },
  { v: 1.55, l: "Moderate (3–5 days/week)" },
  { v: 1.725, l: "Very active (6–7 days/week)" },
  { v: 1.9, l: "Super active (physical job + training)" },
];

const GOALS = {
  lose: { label: "Lose weight (calorie deficit)", adjust: -500, macros: { carbs: 40, protein: 35, fat: 25 } },
  maintain: { label: "Maintain weight", adjust: 0, macros: { carbs: 50, protein: 25, fat: 25 } },
  bulk: { label: "Bulk (gain muscle)", adjust: 300, macros: { carbs: 50, protein: 25, fat: 25 } },
} as const;
type Goal = keyof typeof GOALS;
type Macros = { carbs: number; protein: number; fat: number };

const UNLOCK_KEY = "fb-calculator-unlocked";

/**
 * Calorie & macro calculator (Mifflin–St Jeor BMR × activity, then goal adjustment).
 * Like the old site, visitors leave their name and email first — that reaches the
 * front desk as a lead. Returning visitors on the same device go straight in.
 */
export function CalorieCalculator() {
  const [unlocked, setUnlocked] = useState(false);
  useEffect(() => {
    try {
      // Reading device storage can only happen after the page loads in the browser.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (localStorage.getItem(UNLOCK_KEY)) setUnlocked(true);
    } catch { /* private mode */ }
  }, []);

  return unlocked ? <Calculator /> : <Gate onDone={() => setUnlocked(true)} />;
}

function Gate({ onDone }: { onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = formToObject(e.currentTarget);
    const errs: Record<string, string> = {};
    if (!String(d.full_name ?? "").trim()) errs.full_name = "Enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(String(d.email ?? ""))) errs.email = "Enter a valid email.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setBusy(true);
    const res = await postJson("leads/contact", {
      full_name: d.full_name, email: d.email, website: d.website, marketing_consent: d.marketing_consent,
      reason: "Calorie calculator",
      message: "Used the calorie & macro calculator on the website.",
      ...attribution(),
    });
    setBusy(false);
    // Field problems are shown; anything else (busy server, rate limit) never blocks the tool.
    if (!res.ok && Object.keys(res.errors).length) { setErrors(res.errors); return; }
    try { localStorage.setItem(UNLOCK_KEY, new Date().toISOString()); } catch { /* ignore */ }
    onDone();
  }

  return (
    <form onSubmit={submit} noValidate className="card relative grid max-w-2xl gap-4 sm:grid-cols-2">
      <Honeypot />
      <p className="text-ink-soft sm:col-span-2">Start by entering your name and email, then you’ll go straight to the calculator.</p>
      <TextField label="Name" name="full_name" autoComplete="name" required error={errors.full_name} />
      <TextField label="Email" name="email" type="email" autoComplete="email" required error={errors.email} />
      <label className="flex items-start gap-3 text-sm text-muted sm:col-span-2">
        <input type="checkbox" name="marketing_consent" value="1" className="mt-0.5 h-5 w-5 shrink-0 accent-fire" />
        Send me tips and offers from Free Bird by email. I can unsubscribe anytime.
      </label>
      <div className="sm:col-span-2">
        <button type="submit" className="btn-primary" disabled={busy}>{busy ? "Opening…" : "Continue to calculator"}</button>
      </div>
    </form>
  );
}

function Calculator() {
  const [sex, setSex] = useState<"male" | "female">("female");
  const [age, setAge] = useState("30");
  const [height, setHeight] = useState("165");
  const [weight, setWeight] = useState("70");
  const [activity, setActivity] = useState("1.375");
  const [goal, setGoal] = useState<Goal>("maintain");
  const [macros, setMacros] = useState<Macros>({ ...GOALS.maintain.macros });

  const result = useMemo(() => {
    const a = Number(age), h = Number(height), w = Number(weight), f = Number(activity);
    if (!(a >= 13 && a <= 100 && h >= 120 && h <= 230 && w >= 30 && w <= 300)) return null;
    const bmr = 10 * w + 6.25 * h - 5 * a + (sex === "male" ? 5 : -161);
    const tdee = Math.round(bmr * f);
    const target = Math.max(sex === "male" ? 1500 : 1200, tdee + GOALS[goal].adjust);
    return { bmr: Math.round(bmr), tdee, target };
  }, [sex, age, height, weight, activity, goal]);

  const total = macros.carbs + macros.protein + macros.fat;
  const grams = result && total === 100
    ? {
        carbs: Math.round((result.target * macros.carbs) / 100 / 4),
        protein: Math.round((result.target * macros.protein) / 100 / 4),
        fat: Math.round((result.target * macros.fat) / 100 / 9),
      }
    : null;

  function chooseGoal(g: Goal) {
    setGoal(g);
    setMacros({ ...GOALS[g].macros });
  }

  return (
    <div className="swap-in grid gap-8 lg:grid-cols-2">
      <div className="flex flex-col gap-6">
        <form className="card grid gap-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
          <SelectField label="Gender" name="sex" value={sex} onChange={(e) => setSex(e.target.value as "male" | "female")}>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </SelectField>
          <TextField label="Age" name="age" type="number" min={13} max={100} value={age} onChange={(e) => setAge(e.target.value)} />
          <TextField label="Height (cm)" name="height" type="number" min={120} max={230} value={height} onChange={(e) => setHeight(e.target.value)} />
          <TextField label="Weight (kg)" name="weight" type="number" min={30} max={300} value={weight} onChange={(e) => setWeight(e.target.value)} />
          <SelectField label="Activity level" name="activity" value={activity} onChange={(e) => setActivity(e.target.value)} className="sm:col-span-2">
            {ACTIVITY.map((x) => <option key={x.v} value={x.v}>{x.l}</option>)}
          </SelectField>
          <fieldset className="sm:col-span-2">
            <legend className="field-label">Your goal</legend>
            <div role="radiogroup" aria-label="Goal" className="mt-2 grid gap-2 sm:grid-cols-3">
              {(Object.keys(GOALS) as Goal[]).map((g) => (
                <button key={g} type="button" role="radio" aria-checked={goal === g} onClick={() => chooseGoal(g)}
                  className={`rounded-[10px] border-2 px-3 py-2.5 text-sm font-bold transition-colors duration-300 ${goal === g ? "border-fire bg-fire text-ink" : "border-line bg-white hover:border-ink"}`}>
                  {GOALS[g].label}
                </button>
              ))}
            </div>
          </fieldset>
        </form>

        <div className="card flex flex-col gap-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-lg font-bold">Macronutrient split</h2>
            <span className={`text-sm font-semibold ${total === 100 ? "text-go" : "text-red-700"}`}>Total {total}%</span>
          </div>
          {(["carbs", "protein", "fat"] as const).map((k) => (
            <label key={k} className="flex flex-col gap-1">
              <span className="flex justify-between text-sm font-semibold capitalize"><span>{k === "carbs" ? "Carbohydrates" : k}</span><span>{macros[k]}%</span></span>
              <input type="range" min={5} max={70} step={1} value={macros[k]} aria-label={`${k} percent`}
                onChange={(e) => setMacros({ ...macros, [k]: Number(e.target.value) })} className="w-full accent-fire" />
            </label>
          ))}
          <p className="text-xs text-muted">Typical ranges: carbs 40–60%, protein 20–35%, fat 15–30%. The three must add up to 100%.</p>
        </div>
      </div>

      <div className="card-dark flex flex-col gap-4 self-start" aria-live="polite">
        {result ? (
          <>
            <p className="text-ink-muted">Your daily target · {GOALS[goal].label.toLowerCase()}</p>
            <p className="font-display text-7xl font-extrabold leading-none">{result.target.toLocaleString()} <span className="text-2xl">kcal/day</span></p>
            <dl className="grid grid-cols-2 gap-3 border-t border-ink-line pt-4 text-sm">
              <div><dt className="text-ink-muted">Maintenance (TDEE)</dt><dd className="text-xl font-bold">{result.tdee.toLocaleString()}</dd></div>
              <div><dt className="text-ink-muted">BMR</dt><dd className="text-xl font-bold">{result.bmr.toLocaleString()}</dd></div>
            </dl>
            {grams ? (
              <dl className="grid grid-cols-3 gap-3 border-t border-ink-line pt-4 text-sm">
                <div><dt className="text-ink-muted">Carbs</dt><dd className="text-2xl font-bold">{grams.carbs} g</dd></div>
                <div><dt className="text-ink-muted">Protein</dt><dd className="text-2xl font-bold">{grams.protein} g</dd></div>
                <div><dt className="text-ink-muted">Fat</dt><dd className="text-2xl font-bold">{grams.fat} g</dd></div>
              </dl>
            ) : (
              <p className="border-t border-ink-line pt-4 text-sm text-fire-light">Adjust the sliders so carbs, protein and fat add up to 100% to see grams per day.</p>
            )}
            <p className="text-xs text-ink-muted">An estimate only — not medical advice. A coach can tailor this to you.</p>
          </>
        ) : (
          <p>Enter your age (13–100), height (120–230 cm) and weight (30–300 kg).</p>
        )}
      </div>
    </div>
  );
}
