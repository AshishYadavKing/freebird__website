import type { MetadataRoute } from "next";
import { getArticles } from "@/lib/crm";

export const revalidate = 3600;

const PAGES = ["", "memberships", "join", "free-pass", "personal-training", "online-training", "rehab", "badminton",
  "high-spirits-studio", "transformations", "locations", "about", "articles", "corporate", "careers", "contact", "store", "app",
  "calorie-calculator", "privacy", "terms", "refund-policy"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const pages: MetadataRoute.Sitemap = PAGES.map((p) => ({
    url: `${base}/${p}`,
    changeFrequency: "weekly",
    priority: p === "" ? 1 : p === "memberships" ? 0.9 : 0.6,
  }));

  // Every published article (up to 50 per page, all pages).
  const articles: MetadataRoute.Sitemap = [];
  for (let page = 1, last = 1; page <= last && page <= 20; page++) {
    const data = await getArticles({ page, perPage: 50 });
    last = data.last_page;
    for (const a of data.articles) {
      articles.push({ url: `${base}/articles/${a.slug}`, lastModified: a.published_at ?? undefined, changeFrequency: "monthly", priority: 0.5 });
    }
  }

  return [...pages, ...articles];
}
