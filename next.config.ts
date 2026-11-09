import type { NextConfig } from "next";

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

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: { formats: ["image/avif", "image/webp"] },
  async redirects() {
    return Object.entries(LEGACY).map(([source, destination]) => ({ source, destination, permanent: true }));
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
