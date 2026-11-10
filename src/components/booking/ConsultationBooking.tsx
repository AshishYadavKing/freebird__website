"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ConsentCheckbox, FormAlert, Honeypot, TextArea, TextField, formToObject } from "@/components/forms/Fields";
import type { ClubOption } from "@/components/forms/Forms";
import { attribution, getJson, postJson } from "@/lib/client-api";
import { isoDay, longDate, time12 } from "@/lib/format";
import { DayPicker } from "./DayPicker";

type Slot = { id: number; start: string; end: string };
type Booked = { mode?: "online" | "in_person"; club?: string | null; meeting_url?: string | null };
const GOALS = ["Lose weight", "Build muscle", "Get stronger", "Improve mobility", "Sport performance", "General health"];

/** Book a free consultation on the staff's consultation slots. */
export function ConsultationBooking({ clubs }: { clubs: ClubOption[] }) {
  const [day, setDay] = useState(isoDay(1));
  // Results and the chosen time are remembered per day, so switching days "resets" them for free.
  const [loaded, setLoaded] = useState<{ day: string; slots: Slot[] } | null>(null);
  const [picked, setPicked] = useState<{ day: string; slot: Slot } | null>(null);
  const slots = loaded?.day === day ? loaded.slots : null;
  const slot = picked?.day === day ? picked.slot : null;
  const setSlot = (s: Slot | null) => setPicked(s ? { day, slot: s } : null);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [done, setDone] = useState<({ message: string; when: string } & Booked) | null>(null);

  useEffect(() => {
    let live = true;
    getJson<{ slots: Slot[] }>(`consultations/slots?date=${day}`).then((r) => {
      if (live) setLoaded({ day, slots: r.ok ? (r.data?.slots ?? []) : [] });
    });
    return () => { live = false; };
  }, [day]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!slot) return;
    setBusy(true);
    setErrors({});
    setMessage(null);
    const form = e.currentTarget;
    const goals = new FormData(form).getAll("goal").map(String);
    // "where" is a club id or "online"
    const { where, goal: _goal, ...fields } = formToObject(form) as Record<string, unknown>;
    void _goal;
    const location = where === "online" ? { mode: "online" } : where ? { mode: "in_person", branch_id: where } : {};
    const res = await postJson<Booked>("consultations", { ...fields, ...location, ...attribution(), admin_slot_id: slot.id, fitness_goal: goals.length ? goals : undefined });
    setBusy(false);
    if (res.ok) setDone({ message: res.message, when: `${longDate(day)} at ${time12(slot.start)}`, ...res.data });
    else {
      setErrors(res.errors);
      setMessage(Object.keys(res.errors).length ? "Please fix the highlighted fields." : res.message);
      if (res.status === 409) setSlot(null);
    }
  }

  if (done) {
    return (
      <div className="card flex flex-col gap-4">
        <FormAlert kind="success">{done.message}</FormAlert>
        <p className="text-lg font-semibold">
          {done.when} · {done.mode === "online" ? "Online video call" : (done.club ?? "At the club")}
        </p>
        {done.meeting_url && (
          <div className="flex flex-col gap-2 rounded-xl bg-mist p-4">
            <p className="text-sm text-ink-soft">Join from your phone or computer a minute before the start time:</p>
            <a href={done.meeting_url} target="_blank" rel="noopener noreferrer" className="btn-primary self-start">Open video-call link</a>
            <p className="break-all text-xs text-subtle">{done.meeting_url}</p>
          </div>
        )}
        <p className="text-sm text-muted">We’ve emailed you the details. Times are in Toronto time.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <DayPicker value={day} onChange={setDay} />
      {slots === null ? (
        <p className="text-muted" role="status">Loading times…</p>
      ) : slots.length === 0 ? (
        <p className="rounded-xl bg-mist px-4 py-3 text-ink-soft">No consultation times this day. Try another day.</p>
      ) : (
        <div role="radiogroup" aria-label="Time" className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {slots.map((s) => (
            <button key={s.id} type="button" role="radio" aria-checked={slot?.id === s.id} onClick={() => setSlot(s)}
              className={`rounded-[10px] border-2 px-2 py-2.5 text-sm font-bold ${slot?.id === s.id ? "border-fire bg-fire text-ink" : "border-line bg-white hover:border-ink"}`}>
              {time12(s.start)}
            </button>
          ))}
        </div>
      )}

      {slot && (
        <form onSubmit={submit} noValidate className="relative grid gap-4 rounded-2xl border border-line p-5 sm:grid-cols-2 sm:p-6">
          <Honeypot />
          <p className="font-semibold sm:col-span-2">Free consultation · {longDate(day)} · {time12(slot.start)}–{time12(slot.end)}</p>
          <TextField label="Full name" name="full_name" autoComplete="name" required error={errors.full_name} />
          <TextField label="Mobile number" name="mobile" type="tel" autoComplete="tel" required error={errors.mobile} />
          <TextField label="Email (for your confirmation)" name="email" type="email" autoComplete="email" required error={errors.email} />
          <fieldset className="sm:col-span-2">
            <legend className="mb-2 text-sm font-semibold text-ink-soft">Where would you like it? <span className="text-ember">*</span></legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {[...clubs.map((c) => ({ value: String(c.id), label: c.label, hint: "At the club" })), { value: "online", label: "Online", hint: "Video call — link by email" }].map((o) => (
                <label key={o.value} className="flex cursor-pointer flex-col rounded-[12px] border-2 border-line px-4 py-3 has-[:checked]:border-fire has-[:checked]:bg-[#FFF4EB]">
                  <span className="flex items-center gap-2 font-bold">
                    <input type="radio" name="where" value={o.value} required className="h-4 w-4 accent-fire" />{o.label}
                  </span>
                  <span className="pl-6 text-xs text-muted">{o.hint}</span>
                </label>
              ))}
            </div>
            {(errors.mode || errors.branch_id) && <p className="field-error mt-1">{errors.mode ?? errors.branch_id}</p>}
          </fieldset>
          <fieldset className="sm:col-span-2">
            <legend className="mb-2 text-sm font-semibold text-ink-soft">Your goals</legend>
            <div className="flex flex-wrap gap-2">
              {GOALS.map((g) => (
                <label key={g} className="flex cursor-pointer items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm has-[:checked]:border-fire has-[:checked]:bg-[#FFF4EB]">
                  <input type="checkbox" name="goal" value={g} className="accent-fire" />{g}
                </label>
              ))}
            </div>
          </fieldset>
          <TextArea label="Anything else? (injuries, experience)" name="about" error={errors.about} className="sm:col-span-2" />
          <div className="sm:col-span-2"><ConsentCheckbox /></div>
          {message && <div className="sm:col-span-2"><FormAlert kind="error">{message}</FormAlert></div>}
          <div className="sm:col-span-2"><button className="btn-primary" disabled={busy}>{busy ? "Booking…" : "Book my free consultation"}</button></div>
        </form>
      )}
    </div>
  );
}
