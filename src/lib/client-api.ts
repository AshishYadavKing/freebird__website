/**
 * Browser-side calls to the CRM, always through this site's /api/fb relay.
 */

export type ApiResult<T = unknown> = {
  ok: boolean;
  status: number;
  message: string;
  data?: T;
  /** Laravel validation errors: field → first message */
  errors: Record<string, string>;
};

async function parse<T>(res: Response): Promise<ApiResult<T>> {
  let body: { status?: boolean; message?: string; data?: T; errors?: Record<string, string[]> } = {};
  try {
    body = await res.json();
  } catch {
    // ignore
  }
  const errors: Record<string, string> = {};
  for (const [k, v] of Object.entries(body.errors ?? {})) errors[k] = Array.isArray(v) ? v[0] : String(v);

  const ok = res.ok && body.status !== false;
  const fallback =
    res.status === 429 ? "Too many attempts. Please wait a moment and try again."
      : res.status >= 500 ? "Something went wrong on our side. Please try again."
        : "Please check the form and try again.";

  return { ok, status: res.status, message: body.message ?? (ok ? "Done." : fallback), data: body.data, errors };
}

export async function postJson<T = unknown>(path: string, payload: Record<string, unknown>): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`/api/fb/website/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    return parse<T>(res);
  } catch {
    return { ok: false, status: 0, message: "You seem to be offline. Check your connection and try again.", errors: {} };
  }
}

export async function postForm<T = unknown>(path: string, form: FormData): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`/api/fb/website/${path}`, { method: "POST", headers: { Accept: "application/json" }, body: form });
    return parse<T>(res);
  } catch {
    return { ok: false, status: 0, message: "You seem to be offline. Check your connection and try again.", errors: {} };
  }
}

export async function getJson<T = unknown>(path: string): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`/api/fb/website/${path}`, { headers: { Accept: "application/json" } });
    return parse<T>(res);
  } catch {
    return { ok: false, status: 0, message: "You seem to be offline. Check your connection and try again.", errors: {} };
  }
}

/** Page attribution sent with every lead (page path + UTM tags). */
export function attribution(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const q = new URLSearchParams(window.location.search);
  const out: Record<string, string> = { page: window.location.pathname };
  for (const k of ["utm_source", "utm_medium", "utm_campaign"]) {
    const v = q.get(k);
    if (v) out[k] = v;
  }
  return out;
}
