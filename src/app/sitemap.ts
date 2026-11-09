import type { MetadataRoute } from "next";

const PAGES = ["", "memberships", "join", "free-pass", "personal-training", "online-training", "rehab", "badminton",
  "high-spirits-studio", "transformations", "locations", "about", "corporate", "careers", "contact", "store", "app",
  "calorie-calculator", "privacy", "terms", "refund-policy"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return PAGES.map((p) => ({ url: `${base}/${p}`, changeFrequency: "weekly", priority: p === "" ? 1 : p === "memberships" ? 0.9 : 0.6 }));
}
