"use client";

import { isoDay } from "@/lib/format";

/** Horizontal strip of the next `days` days. */
export function DayPicker({ value, onChange, days = 14 }: { value: string; onChange: (iso: string) => void; days?: number }) {
  const list = Array.from({ length: days }, (_, i) => isoDay(i));

  return (
    <div role="radiogroup" aria-label="Day" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
      {list.map((d) => {
        const date = new Date(`${d}T12:00:00`);
        const on = d === value;
        return (
          <button key={d} type="button" role="radio" aria-checked={on} onClick={() => onChange(d)}
            className={`flex min-w-[68px] flex-col items-center rounded-[12px] border-2 px-3 py-2 ${on ? "border-fire bg-[#FFF4EB]" : "border-line bg-white hover:border-ink"}`}>
            <span className="text-xs font-semibold uppercase text-muted">{date.toLocaleDateString("en-CA", { weekday: "short" })}</span>
            <span className="font-display text-2xl font-extrabold leading-tight">{date.getDate()}</span>
            <span className="text-xs text-muted">{date.toLocaleDateString("en-CA", { month: "short" })}</span>
          </button>
        );
      })}
    </div>
  );
}
