"use client";

import { useMemo, useState } from "react";
import { SelectField, TextField } from "@/components/forms/Fields";

const ACTIVITY = [
  { v: 1.2, l: "Little or no exercise" },
  { v: 1.375, l: "Light (1–3 days/week)" },
  { v: 1.55, l: "Moderate (3–5 days/week)" },
  { v: 1.725, l: "Hard (6–7 days/week)" },
  { v: 1.9, l: "Very hard (physical job + training)" },
];

/** Mifflin–St Jeor BMR × activity factor. Everything runs in the browser. */
export function CalorieCalculator() {
  const [sex, setSex] = useState<"male" | "female">("female");
  const [age, setAge] = useState("30");
  const [height, setHeight] = useState("165");
  const [weight, setWeight] = useState("70");
  const [activity, setActivity] = useState("1.375");

  const result = useMemo(() => {
    const a = Number(age), h = Number(height), w = Number(weight), f = Number(activity);
    if (!(a >= 13 && a <= 100 && h >= 120 && h <= 230 && w >= 30 && w <= 300)) return null;
    const bmr = 10 * w + 6.25 * h - 5 * a + (sex === "male" ? 5 : -161);
    const tdee = Math.round(bmr * f);
    return { bmr: Math.round(bmr), maintain: tdee, lose: Math.max(1200, tdee - 500), gain: tdee + 300 };
  }, [sex, age, height, weight, activity]);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form className="card grid gap-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
        <SelectField label="Sex" name="sex" value={sex} onChange={(e) => setSex(e.target.value as "male" | "female")}>
          <option value="female">Female</option>
          <option value="male">Male</option>
        </SelectField>
        <TextField label="Age" name="age" type="number" min={13} max={100} value={age} onChange={(e) => setAge(e.target.value)} />
        <TextField label="Height (cm)" name="height" type="number" min={120} max={230} value={height} onChange={(e) => setHeight(e.target.value)} />
        <TextField label="Weight (kg)" name="weight" type="number" min={30} max={300} value={weight} onChange={(e) => setWeight(e.target.value)} />
        <SelectField label="Activity level" name="activity" value={activity} onChange={(e) => setActivity(e.target.value)} className="sm:col-span-2">
          {ACTIVITY.map((x) => <option key={x.v} value={x.v}>{x.l}</option>)}
        </SelectField>
      </form>
      <div className="card-dark flex flex-col gap-4" aria-live="polite">
        {result ? (
          <>
            <p className="text-ink-muted">To maintain your weight</p>
            <p className="font-display text-7xl font-extrabold leading-none">{result.maintain.toLocaleString()} <span className="text-2xl">kcal/day</span></p>
            <dl className="grid grid-cols-3 gap-3 border-t border-ink-line pt-4 text-sm">
              <div><dt className="text-ink-muted">Lose ~0.5 kg/wk</dt><dd className="text-xl font-bold">{result.lose.toLocaleString()}</dd></div>
              <div><dt className="text-ink-muted">Lean gain</dt><dd className="text-xl font-bold">{result.gain.toLocaleString()}</dd></div>
              <div><dt className="text-ink-muted">BMR</dt><dd className="text-xl font-bold">{result.bmr.toLocaleString()}</dd></div>
            </dl>
            <p className="text-xs text-ink-muted">An estimate only — not medical advice. A coach can tailor this to you.</p>
          </>
        ) : (
          <p>Enter your age (13–100), height (120–230 cm) and weight (30–300 kg).</p>
        )}
      </div>
    </div>
  );
}
