"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { attribution, postForm, postJson } from "@/lib/client-api";
import { FormAlert, Honeypot, formToObject } from "./Fields";

/**
 * Generic website form: posts to a /website/* endpoint, shows field errors from the
 * CRM inline, and replaces itself with the CRM's confirmation message on success.
 */
export function LeadForm({
  endpoint,
  children,
  submitLabel,
  multipart = false,
  className = "grid gap-4 sm:grid-cols-2",
  dark = false,
  onSuccess,
  prepare,
  successMessage,
}: {
  endpoint: string;
  children: (errors: Record<string, string>) => ReactNode;
  submitLabel: string;
  multipart?: boolean;
  className?: string;
  dark?: boolean;
  /** Called after a successful submit (e.g. to remember that a free trial was claimed). */
  onSuccess?: () => void;
  /**
   * Optional step before sending (JSON forms only): check extra fields and fold them into
   * what the CRM stores, e.g. studio date + hours into the message. Return errors to stop.
   */
  prepare?: (data: Record<string, unknown>, form: HTMLFormElement) => { data?: Record<string, unknown>; errors?: Record<string, string> };
  /** Text shown after a successful submit instead of the CRM's generic confirmation. */
  successMessage?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setMessage(null);

    const form = e.currentTarget;
    let res;
    if (multipart) {
      const fd = new FormData(form);
      fd.set("marketing_consent", fd.get("marketing_consent") === "1" ? "1" : "0");
      for (const [k, v] of Object.entries(attribution())) fd.set(k, v);
      res = await postForm(endpoint, fd);
    } else {
      let data = formToObject(form);
      if (prepare) {
        const out = prepare(data, form);
        if (out.errors && Object.keys(out.errors).length) {
          setBusy(false);
          setErrors(out.errors);
          setMessage("Please fix the highlighted fields.");
          return;
        }
        data = out.data ?? data;
      }
      res = await postJson(endpoint, { ...data, ...attribution() });
    }

    setBusy(false);
    if (res.ok) {
      setDone(successMessage ?? res.message);
      form.reset();
      onSuccess?.();
    } else {
      setErrors(res.errors);
      setMessage(Object.keys(res.errors).length ? "Please fix the highlighted fields." : res.message);
    }
  }

  if (done) {
    return (
      <div className={dark ? "rounded-2xl bg-white/10 p-6 text-ink-text" : ""}>
        <FormAlert kind="success">{done}</FormAlert>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className={`relative ${className}`}>
      <Honeypot />
      {children(errors)}
      {message && (
        <div className="sm:col-span-2">
          <FormAlert kind="error">{message}</FormAlert>
        </div>
      )}
      <div className="sm:col-span-2">
        <button type="submit" className="btn-primary w-full sm:w-auto" disabled={busy}>
          {busy ? "Sending…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
