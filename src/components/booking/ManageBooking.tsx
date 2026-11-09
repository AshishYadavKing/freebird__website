"use client";

import { useState, type FormEvent } from "react";
import { FormAlert, TextField } from "@/components/forms/Fields";
import { postJson } from "@/lib/client-api";
import { longDate, money, time12 } from "@/lib/format";

type Booking = {
  booking_ref: string; status: string; resource: string; club: string; club_address: string | null;
  date: string; start_time: string; end_time: string; full_name: string; price: number; can_cancel_online: boolean;
};

/** Look up a booking by reference + phone, and cancel it. */
export function ManageBooking({ initialRef }: { initialRef: string }) {
  const [ref, setRef] = useState(initialRef);
  const [mobile, setMobile] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function lookup(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await postJson<Booking>("bookings/lookup", { booking_ref: ref.trim(), mobile });
    setBusy(false);
    if (res.ok && res.data) setBooking(res.data);
    else setError(res.errors.booking_ref ? "Enter the booking reference from your confirmation." : res.message);
  }

  async function cancel() {
    if (!booking || !confirm("Cancel this booking?")) return;
    setBusy(true);
    setError(null);
    const res = await postJson<Booking>("bookings/cancel", { booking_ref: booking.booking_ref, mobile });
    setBusy(false);
    if (res.ok && res.data) {
      setBooking(res.data);
      setNotice(res.message);
    } else setError(res.message);
  }

  if (booking) {
    return (
      <div className="card flex max-w-xl flex-col gap-4">
        {notice && <FormAlert kind="success">{notice}</FormAlert>}
        {error && <FormAlert kind="error">{error}</FormAlert>}
        <span className={`pill self-start ${booking.status === "cancelled" ? "bg-mist text-muted" : booking.status === "pending" ? "bg-sky-tint text-sky" : "bg-go-tint text-go"}`}>
          {booking.status === "pending" ? "Waiting for confirmation" : booking.status.replace("_", " ")}
        </span>
        <h2 className="font-display text-3xl font-extrabold uppercase">{booking.resource}</h2>
        <p className="text-ink-soft">{longDate(booking.date)} · {time12(booking.start_time)}–{time12(booking.end_time)}</p>
        <p className="text-ink-soft">{booking.club}{booking.club_address ? `, ${booking.club_address}` : ""}</p>
        {booking.price > 0 && <p className="text-ink-soft">{money(booking.price, { cents: true })}, paid at the club</p>}
        {booking.can_cancel_online ? (
          <button type="button" className="btn-secondary self-start" disabled={busy} onClick={cancel}>{busy ? "Cancelling…" : "Cancel booking"}</button>
        ) : booking.status !== "cancelled" ? (
          <p className="text-sm text-muted">It’s too close to the start to cancel online. Please call the club.</p>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={lookup} className="flex max-w-md flex-col gap-4">
      <TextField label="Booking reference" name="booking_ref" value={ref} onChange={(e) => setRef(e.target.value)} required />
      <TextField label="Phone number used to book" name="mobile" type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} required />
      {error && <FormAlert kind="error">{error}</FormAlert>}
      <button className="btn-primary self-start" disabled={busy}>{busy ? "Finding…" : "Find my booking"}</button>
    </form>
  );
}
