"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { ConsentCheckbox, FormAlert, Honeypot, SelectField, TextArea, TextField, formToObject } from "@/components/forms/Fields";
import { attribution, getJson, postJson } from "@/lib/client-api";
import { isoDay, longDate, money, time12 } from "@/lib/format";
import { DayPicker } from "./DayPicker";

export type FacilityOption = {
  id: number;
  name: string;
  description: string | null;
  slot_minutes: number;
  max_slots_per_booking: number;
  max_players: number | null;
  price_per_slot: number;
  requires_approval: boolean;
};

type Slot = { start: string; end: string; available: boolean; remaining: number };
type Booked = { booking_ref: string; status: string; resource: string; club: string; date: string; start_time: string; end_time: string; price: number };

/** Book a badminton court or request a rehab appointment, with live availability. */
export function FacilityBooking({ facilities, kind }: { facilities: FacilityOption[]; kind: "badminton_court" | "rehab" }) {
  const [facilityId, setFacilityId] = useState(facilities[0]?.id);
  const facility = facilities.find((f) => f.id === facilityId);
  const [day, setDay] = useState(isoDay(0));
  const [version, setVersion] = useState(0); // bump to reload availability after a booking
  const key = `${facilityId}|${day}|${version}`;
  // Availability and the chosen start time belong to one (facility, day) view.
  const [loaded, setLoaded] = useState<{ key: string; slots: Slot[] } | null>(null);
  const [picked, setPicked] = useState<{ key: string; start: string } | null>(null);
  const slots = loaded?.key === key ? loaded.slots : null;
  const start = picked?.key === key ? picked.start : null;
  const setStart = (s: string | null) => setPicked(s ? { key, start: s } : null);
  const [count, setCount] = useState(1);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [booked, setBooked] = useState<{ b: Booked; msg: string } | null>(null);

  useEffect(() => {
    if (!facilityId) return;
    let live = true;
    const k = `${facilityId}|${day}|${version}`;
    getJson<{ slots: Slot[] }>(`facilities/${facilityId}/availability?date=${day}`).then((r) => {
      if (live) setLoaded({ key: k, slots: r.ok ? (r.data?.slots ?? []) : [] });
    });
    return () => { live = false; };
  }, [facilityId, day, version]);

  if (!facility) {
    return <p className="card text-ink-soft">Online booking isn’t available here yet. Please call the club.</p>;
  }

  // Longest run of free consecutive slots from the chosen start (for multi-hour court bookings).
  const startIdx = slots?.findIndex((s) => s.start === start) ?? -1;
  let maxRun = 0;
  if (slots && startIdx >= 0) {
    while (maxRun < facility.max_slots_per_booking && slots[startIdx + maxRun]?.available) maxRun++;
  }
  const isRehab = kind === "rehab";

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!start) return;
    setBusy(true);
    setErrors({});
    setMessage(null);
    const res = await postJson<Booked>("bookings", {
      ...formToObject(e.currentTarget), ...attribution(),
      resource_id: facility!.id, date: day, start_time: start, slots: Math.min(count, Math.max(1, maxRun)),
    });
    setBusy(false);
    if (res.ok && res.data) {
      setBooked({ b: res.data, msg: res.message });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setErrors(res.errors);
      setMessage(Object.keys(res.errors).length ? "Please fix the highlighted fields." : res.message);
      if (res.status === 409) setStart(null);
    }
  }

  if (booked) {
    const { b } = booked;
    return (
      <div className="card flex flex-col gap-4">
        <FormAlert kind="success">{booked.msg}</FormAlert>
        <h3 className="font-display text-3xl font-extrabold uppercase">{b.resource}</h3>
        <p className="text-ink-soft">{longDate(b.date)} · {time12(b.start_time)}–{time12(b.end_time)} · {b.club}</p>
        {b.price > 0 && <p className="text-ink-soft">Price: {money(b.price, { cents: true })}, paid at the club.</p>}
        <p className="text-sm text-muted">Your booking reference: <code className="rounded bg-mist px-1.5 py-0.5">{b.booking_ref}</code></p>
        <div className="flex flex-wrap gap-3">
          <Link href={`/bookings/manage?ref=${b.booking_ref}`} className="btn-secondary">Manage booking</Link>
          <button type="button" className="btn-primary" onClick={() => { setBooked(null); setVersion((v) => v + 1); }}>Book another</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {facilities.length > 1 && (
        <div role="radiogroup" aria-label={isRehab ? "Service" : "Court"} className="flex flex-wrap gap-2">
          {facilities.map((f) => (
            <button key={f.id} type="button" role="radio" aria-checked={f.id === facilityId} onClick={() => setFacilityId(f.id)}
              className={`rounded-[12px] border-2 px-4 py-2.5 font-bold ${f.id === facilityId ? "border-fire bg-[#FFF4EB]" : "border-line bg-white"}`}>
              {f.name}
            </button>
          ))}
        </div>
      )}
      {facility.description && <p className="text-muted">{facility.description}</p>}

      <DayPicker value={day} onChange={setDay} />

      <div>
        <h3 className="mb-3 font-bold">{longDate(day)}</h3>
        {slots === null ? (
          <div role="status" aria-label="Loading times" className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {Array.from({ length: 10 }, (_, i) => <span key={i} className="skeleton h-11" />)}
        </div>
        ) : slots.filter((s) => s.available).length === 0 ? (
          <p className="swap-in rounded-xl bg-mist px-4 py-3 text-ink-soft">No open times this day. Try another day.</p>
        ) : (
          <div role="radiogroup" aria-label="Start time" className="stagger grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-6">
            {slots.map((s) => (
              <button key={s.start} type="button" role="radio" aria-checked={s.start === start} disabled={!s.available}
                onClick={() => { setStart(s.start); setCount(1); }}
                className={`rounded-[10px] border-2 px-2 py-2.5 text-sm font-bold transition-colors duration-300 ${s.start === start ? "border-fire bg-fire text-ink" : s.available ? "border-line bg-white hover:border-ink" : "cursor-not-allowed border-line bg-mist text-subtle line-through"}`}>
                {time12(s.start)}
              </button>
            ))}
          </div>
        )}
      </div>

      {start && (
        <form onSubmit={submit} noValidate className="swap-in relative grid gap-4 rounded-2xl border border-line p-5 sm:grid-cols-2 sm:p-6">
          <Honeypot />
          <p className="font-semibold sm:col-span-2">
            {facility.name} · {longDate(day)} · {time12(start)}
            {facility.price_per_slot > 0 && <span className="font-normal text-muted"> · {money(facility.price_per_slot * count)} paid at the club</span>}
          </p>

          {!isRehab && facility.max_slots_per_booking > 1 && maxRun > 1 && (
            <SelectField label="How long?" name="_duration" value={String(count)} onChange={(e) => setCount(Number(e.target.value))}>
              {Array.from({ length: maxRun }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{(n * facility.slot_minutes) / 60} hour{n * facility.slot_minutes > 60 ? "s" : ""}</option>
              ))}
            </SelectField>
          )}
          {!isRehab && (
            <TextField label="Players" name="players" type="number" min={1} max={facility.max_players ?? 8} defaultValue={2} required error={errors.players} />
          )}

          <TextField label="Full name" name="full_name" autoComplete="name" required error={errors.full_name} />
          <TextField label="Mobile number" name="mobile" type="tel" autoComplete="tel" required error={errors.mobile} />
          <TextField label="Email (for your confirmation)" name="email" type="email" autoComplete="email" required error={errors.email} />

          {isRehab && (
            <>
              <TextField label="What would you like help with?" name="concern" placeholder="e.g. lower back pain, knee injury" required error={errors.concern} />
              <TextField label="Age" name="age" type="number" min={5} max={110} error={errors.age} />
              <SelectField label="Gender (optional)" name="gender" defaultValue="" error={errors.gender}>
                <option value="">Prefer not to say</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </SelectField>
            </>
          )}
          <TextArea label="Notes (optional)" name="notes" error={errors.notes} className="sm:col-span-2" />
          <div className="sm:col-span-2"><ConsentCheckbox /></div>
          {message && <div className="sm:col-span-2"><FormAlert kind="error">{message}</FormAlert></div>}
          <div className="sm:col-span-2">
            <button className="btn-primary" disabled={busy}>{busy ? "Booking…" : isRehab ? "Request appointment" : "Book court"}</button>
            {facility.requires_approval && <p className="mt-2 text-sm text-subtle">We’ll confirm your appointment by phone or email.</p>}
          </div>
        </form>
      )}
    </div>
  );
}
