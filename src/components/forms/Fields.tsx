"use client";

import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

type Base = { label: string; name: string; error?: string; hint?: string; className?: string };

export function TextField({ label, name, error, hint, className, ...rest }: Base & InputHTMLAttributes<HTMLInputElement>) {
  const id = `f-${name}`;
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label}
        <input id={id} name={name} className="field" aria-invalid={!!error} aria-describedby={error ? `${id}-e` : undefined} {...rest} />
      </label>
      {hint && !error && <p className="mt-1 text-sm text-subtle">{hint}</p>}
      {error && <p id={`${id}-e`} className="field-error mt-1">{error}</p>}
    </div>
  );
}

export function TextArea({ label, name, error, className, ...rest }: Base & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = `f-${name}`;
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label}
        <textarea id={id} name={name} rows={4} className="field" aria-invalid={!!error} {...rest} />
      </label>
      {error && <p className="field-error mt-1">{error}</p>}
    </div>
  );
}

export function SelectField({ label, name, error, className, children, ...rest }: Base & SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  const id = `f-${name}`;
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label}
        <select id={id} name={name} className="field" aria-invalid={!!error} {...rest}>
          {children}
        </select>
      </label>
      {error && <p className="field-error mt-1">{error}</p>}
    </div>
  );
}

/** Hidden field bots fill in and people never see (matches the CRM's honeypot). */
export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Leave this empty
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

/** CASL-compliant opt-in: unticked by default, separate from the request itself. */
export function ConsentCheckbox({ label = "Send me tips and offers from Free Bird by email or text. I can unsubscribe anytime." }: { label?: string }) {
  return (
    <label className="flex items-start gap-3 text-sm text-muted">
      <input type="checkbox" name="marketing_consent" value="1" className="mt-0.5 h-5 w-5 shrink-0 accent-fire" />
      {label}
    </label>
  );
}

export function FormAlert({ kind, children }: { kind: "error" | "success"; children: ReactNode }) {
  const cls = kind === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-go/30 bg-go-tint text-go";
  return (
    <div role={kind === "error" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm font-medium ${cls}`}>
      {children}
    </div>
  );
}

/** FormData → plain object, with the consent checkbox as a boolean. */
export function formToObject(form: HTMLFormElement): Record<string, unknown> {
  const fd = new FormData(form);
  const out: Record<string, unknown> = {};
  fd.forEach((v, k) => {
    if (typeof v === "string") out[k] = v.trim();
  });
  out.marketing_consent = fd.get("marketing_consent") === "1";
  for (const [k, v] of Object.entries(out)) if (v === "") delete out[k];
  return out;
}
