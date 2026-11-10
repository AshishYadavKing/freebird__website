"use client";

import { ConsentCheckbox, SelectField, TextArea, TextField } from "./Fields";
import { LeadForm } from "./LeadForm";

export type ClubOption = { id: number; label: string };

function ClubSelect({ clubs, error, required = false, label = "Club" }: { clubs: ClubOption[]; error?: string; required?: boolean; label?: string }) {
  return (
    <SelectField label={label} name="branch_id" error={error} required={required} defaultValue="">
      <option value="" disabled={required}>{required ? "Choose a club" : "Any club"}</option>
      {clubs.map((c) => (
        <option key={c.id} value={c.id}>{c.label}</option>
      ))}
    </SelectField>
  );
}

export const TRIAL_CLAIMED_KEY = "fb-free-trial-claimed";

/** Remember on this device that the visitor claimed their trial (so the pop-up stops). */
export function markTrialClaimed() {
  try {
    localStorage.setItem(TRIAL_CLAIMED_KEY, new Date().toISOString());
  } catch { /* private mode: fine */ }
}

export function FreePassForm({ clubs, dark = false, onSuccess }: { clubs: ClubOption[]; dark?: boolean; onSuccess?: () => void }) {
  return (
    <LeadForm endpoint="leads/free-pass" submitLabel="Send my free pass" dark={dark} onSuccess={() => { markTrialClaimed(); onSuccess?.(); }}>
      {(e) => (
        <>
          <TextField label="Full name" name="full_name" autoComplete="name" required error={e.full_name} />
          <TextField label="Mobile number" name="mobile" type="tel" autoComplete="tel" placeholder="(905) 000-0000" required error={e.mobile} />
          <TextField label="Email (optional)" name="email" type="email" autoComplete="email" error={e.email} />
          <ClubSelect clubs={clubs} error={e.branch_id} required />
          <div className="sm:col-span-2"><ConsentCheckbox /></div>
          {e.captcha_token && <p className="field-error sm:col-span-2">{e.captcha_token}</p>}
        </>
      )}
    </LeadForm>
  );
}

const REASONS = ["Membership", "Personal training", "Rehab", "Badminton", "Billing", "General question"];

export function ContactForm({ clubs }: { clubs: ClubOption[] }) {
  return (
    <LeadForm endpoint="leads/contact" submitLabel="Send message">
      {(e) => (
        <>
          <TextField label="Full name" name="full_name" autoComplete="name" required error={e.full_name} />
          <TextField label="Email" name="email" type="email" autoComplete="email" required error={e.email} />
          <TextField label="Phone (optional)" name="mobile" type="tel" autoComplete="tel" error={e.mobile} />
          <SelectField label="What's it about?" name="reason" error={e.reason} defaultValue="General question">
            {REASONS.map((r) => <option key={r}>{r}</option>)}
          </SelectField>
          <ClubSelect clubs={clubs} error={e.branch_id} />
          <TextArea label="Message" name="message" required error={e.message} className="sm:col-span-2" />
          <div className="sm:col-span-2"><ConsentCheckbox /></div>
        </>
      )}
    </LeadForm>
  );
}

export function CorporateForm({ clubs }: { clubs: ClubOption[] }) {
  return (
    <LeadForm endpoint="leads/corporate" submitLabel="Request a company quote">
      {(e) => (
        <>
          <TextField label="Your name" name="full_name" autoComplete="name" required error={e.full_name} />
          <TextField label="Work email" name="email" type="email" autoComplete="email" required error={e.email} />
          <TextField label="Company" name="company" autoComplete="organization" required error={e.company} />
          <TextField label="Team size" name="team_size" type="number" min={1} inputMode="numeric" error={e.team_size} />
          <TextField label="Phone (optional)" name="mobile" type="tel" autoComplete="tel" error={e.mobile} />
          <ClubSelect clubs={clubs} error={e.branch_id} label="Preferred club" />
          <TextArea label="Anything we should know?" name="message" error={e.message} className="sm:col-span-2" />
          <div className="sm:col-span-2"><ConsentCheckbox /></div>
        </>
      )}
    </LeadForm>
  );
}

const ROLES = ["Personal trainer", "Front desk", "Rehab / physio", "Cleaning", "Sales", "Other"];

export function CareerForm({ clubs }: { clubs: ClubOption[] }) {
  return (
    <LeadForm endpoint="leads/career" submitLabel="Send application" multipart>
      {(e) => (
        <>
          <TextField label="Full name" name="full_name" autoComplete="name" required error={e.full_name} />
          <TextField label="Email" name="email" type="email" autoComplete="email" required error={e.email} />
          <TextField label="Mobile number" name="mobile" type="tel" autoComplete="tel" required error={e.mobile} />
          <SelectField label="Position" name="reason" required error={e.reason} defaultValue="">
            <option value="" disabled>Choose a position</option>
            {ROLES.map((r) => <option key={r}>{r}</option>)}
          </SelectField>
          <ClubSelect clubs={clubs} error={e.branch_id} label="Preferred club" />
          <TextField label="Résumé (PDF or Word, max 5 MB)" name="resume" type="file" accept=".pdf,.doc,.docx" error={e.resume} />
          <TextArea label="Tell us about yourself" name="message" error={e.message} className="sm:col-span-2" />
        </>
      )}
    </LeadForm>
  );
}

export function NewsletterForm() {
  return (
    <LeadForm endpoint="newsletter" submitLabel="Subscribe" className="flex flex-col gap-3 sm:flex-row" dark>
      {(e) => (
        <div className="flex-1">
          <label className="sr-only" htmlFor="f-newsletter-email">Email</label>
          <input id="f-newsletter-email" name="email" type="email" required placeholder="you@email.com" autoComplete="email" className="field" />
          {e.email && <p className="mt-1 text-sm text-red-300">{e.email}</p>}
          <p className="mt-2 text-xs text-ink-muted">By subscribing you agree to receive emails from Free Bird. Unsubscribe anytime.</p>
        </div>
      )}
    </LeadForm>
  );
}
