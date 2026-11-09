import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

// next.config is evaluated before Next loads .env files, so load them here:
// FREEBIRD_API_URL decides which host may serve article photos.
loadEnvConfig(process.cwd());

/** Old PHP site URLs → new pages (301), so search rankings and saved links keep working. */
const LEGACY: Record<string, string> = {
  "/index.php": "/",
  "/index12.php": "/",
  "/about.php": "/about",
  "/memberships.php": "/memberships",
  "/memberships-plan.php": "/memberships",
  "/membership-plans-client.php": "/memberships",
  "/membership_signup.php": "/join",
  "/membership_signup_client.php": "/join",
  "/corporate-membership.php": "/corporate",
  "/personal-training.php": "/personal-training",
  "/book_consultation.php": "/personal-training",
  "/online-training.php": "/online-training",
  "/rehab.php": "/rehab",
  "/book_rehab.php": "/rehab",
  "/book-badminton-court.php": "/badminton",
  "/book-badminton.php": "/badminton",
  "/high-spirits-studio.php": "/high-spirits-studio",
  "/transformations.php": "/transformations",
  "/gym-details.php": "/locations",
  "/contact-us.php": "/contact",
  "/career.php": "/careers",
  "/freepass.php": "/free-pass",
  "/calorie-calculator.php": "/calorie-calculator",
  "/store.php": "/store",
  "/product-details.php": "/store",
  "/checkout.php": "/store",
  "/member-login.php": "/app",
  "/member-dashboard.php": "/app",
};

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

/** Article photos are served by the CRM (…/storage/…): allow that host for next/image. */
function crmImageHosts() {
  const api = new URL(process.env.FREEBIRD_API_URL ?? "http://127.0.0.1:8001/api/v1");
  const hosts = [{ protocol: api.protocol.replace(":", "") as "http" | "https", hostname: api.hostname, port: api.port, pathname: "/storage/**" }];
  // Local development: Laravel's APP_URL is usually localhost while the API is reached via 127.0.0.1.
  if (api.hostname === "127.0.0.1") hosts.push({ ...hosts[0], hostname: "localhost" });
  return hosts;
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: crmImageHosts(),
    // Next blocks images from private/loopback IPs (SSRF guard). Only relax that when the CRM
    // itself runs on this machine (local development); production uses a public hostname.
    dangerouslyAllowLocalIP: ["127.0.0.1", "localhost"].includes(new URL(process.env.FREEBIRD_API_URL ?? "http://127.0.0.1").hostname),
  },
  async redirects() {
    return Object.entries(LEGACY).map(([source, destination]) => ({ source, destination, permanent: true }));
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
