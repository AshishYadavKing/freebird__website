/**
 * Server-side client for the Free Bird CRM API (Laravel).
 *
 * FREEBIRD_API_URL and WEBSITE_SERVER_KEY are deliberately NOT NEXT_PUBLIC_: all CRM
 * calls happen on this server (pages, and the /api/fb relay for forms), so the
 * browser never sees the API address or the key.
 */
import "server-only";
import { connection } from "next/server";

export const API_BASE = (process.env.FREEBIRD_API_URL ?? "http://127.0.0.1:8001/api/v1").replace(/\/+$/, "");

type Envelope<T> = { status: boolean; message?: string; data: T };

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Headers proving this is the website's server; the CRM then counts the real visitor. */
export function serverHeaders(visitorIp?: string | null): Record<string, string> {
  const h: Record<string, string> = { Accept: "application/json" };
  const key = process.env.WEBSITE_SERVER_KEY;
  if (key) {
    h["X-Website-Key"] = key;
    if (visitorIp) h["X-Visitor-IP"] = visitorIp;
  }
  return h;
}

type GetOptions = {
  /** Seconds to cache the response (ISR). Defaults to 5 minutes. */
  revalidate?: number | false;
  tags?: string[];
};

export async function apiGet<T>(path: string, { revalidate = 300, tags }: GetOptions = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: serverHeaders(),
    next: { revalidate, tags },
  });

  let body: Envelope<T> | null = null;
  try {
    body = (await res.json()) as Envelope<T>;
  } catch {
    // Non-JSON (e.g. an HTML error page) — handled below.
  }

  if (!res.ok || !body || body.status !== true) {
    throw new ApiError(body?.message ?? `CRM request failed: ${res.status} ${path}`, res.status, body);
  }
  return body.data;
}

/**
 * The whole JSON body, for the few older CRM endpoints that don't wrap their
 * payload in `data` (e.g. the legal pages: {status, title, content}). Null on failure.
 */
export async function apiGetBody<T extends Record<string, unknown>>(path: string, { revalidate = 300, tags }: GetOptions = {}): Promise<T | null> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { headers: serverHeaders(), next: { revalidate, tags } });
  } catch {
    return crmUnavailable();
  }
  if (!res.ok) return transient(res.status) ? crmUnavailable() : null;
  try {
    const body = (await res.json()) as T & { status?: boolean };
    return body.status === false ? null : body;
  } catch {
    return null;
  }
}

/** Like apiGet, but returns null instead of throwing — for optional page sections. */
export async function apiGetSafe<T>(path: string, opts?: GetOptions): Promise<T | null> {
  try {
    return await apiGet<T>(path, opts);
  } catch (e) {
    if (!(e instanceof ApiError) || transient(e.status)) return crmUnavailable();
    return null;
  }
}

/** CRM down, in maintenance (503) or rate-limited (429) — not a real "not found". */
function transient(status: number): boolean {
  return status === 429 || status >= 500;
}

/**
 * The CRM couldn't be reached. Never let a page be saved (built or refreshed)
 * with its CRM sections empty: this makes the page render per request instead —
 * at build time it bails the page out of static generation, and during a
 * background refresh it aborts the refresh so the last good copy keeps serving.
 * CRM responses themselves stay cached per fetch, so this costs little.
 */
async function crmUnavailable(): Promise<null> {
  await connection();
  return null;
}
