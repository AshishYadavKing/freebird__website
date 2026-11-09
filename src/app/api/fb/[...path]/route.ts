/**
 * Relay from the browser to the CRM's public website API.
 *
 *   browser  →  /api/fb/website/leads/contact  →  CRM /api/v1/website/leads/contact
 *
 * Why a relay: the CRM address and WEBSITE_SERVER_KEY stay on this server, and the
 * CRM gets the visitor's real IP (X-Visitor-IP) for rate limits and spam checks.
 * Only /website/* paths are forwarded — nothing else in the CRM is reachable here.
 */
import { NextRequest, NextResponse } from "next/server";
import { API_BASE, serverHeaders } from "@/lib/api";

export const dynamic = "force-dynamic";

const ALLOWED = /^website\/[a-z0-9\-/]+$/i;
const MAX_BODY = 6 * 1024 * 1024; // résumé uploads (5 MB) + form fields

function visitorIp(req: NextRequest): string | null {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip");
}

async function relay(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const target = path.join("/");
  if (!ALLOWED.test(target) || target.includes("..")) {
    return NextResponse.json({ status: false, message: "Not found." }, { status: 404 });
  }

  const headers = serverHeaders(visitorIp(req));
  const ua = req.headers.get("user-agent");
  if (ua) headers["User-Agent"] = ua;

  let body: BodyInit | undefined;
  if (req.method !== "GET") {
    const len = Number(req.headers.get("content-length") ?? 0);
    if (len > MAX_BODY) {
      return NextResponse.json({ status: false, message: "That upload is too large." }, { status: 413 });
    }
    const type = req.headers.get("content-type") ?? "application/json";
    headers["Content-Type"] = type;
    body = await req.arrayBuffer();
  }

  const url = `${API_BASE}/${target}${req.nextUrl.search}`;
  try {
    const res = await fetch(url, { method: req.method, headers, body, cache: "no-store" });
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("content-type") ?? "application/json", "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { status: false, message: "We couldn’t reach our booking system. Please try again in a moment." },
      { status: 502 },
    );
  }
}

export { relay as GET, relay as POST };
