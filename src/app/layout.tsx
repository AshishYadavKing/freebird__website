import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { CLUBS, SITE } from "@/lib/site";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const barlow = Barlow_Condensed({ variable: "--font-barlow", subsets: ["latin"], weight: ["600", "700", "800"], display: "swap" });

const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Free Bird Gym — 24/7 gym in Mississauga & personal training in Brampton", template: "%s · Free Bird Gym" },
  description:
    "Mississauga’s cleanest 24/7 gym and a personal-training studio in Brampton. Memberships, personal training, rehab, badminton courts and a free 3-day pass.",
  openGraph: { type: "website", siteName: SITE.name, locale: "en_CA", images: ["/images/gym-floor.webp"] },
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = { themeColor: "#0A0D14" };

/** schema.org data so Google shows both clubs (address, phone, hours) in local results. */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": CLUBS.map((c) => ({
    "@type": "ExerciseGym",
    name: `Free Bird Gym ${c.name}`,
    url: `${siteUrl}/locations#${c.slug}`,
    telephone: c.phoneHref.replace("tel:", ""),
    email: SITE.email,
    address: { "@type": "PostalAddress", streetAddress: c.address.split(",").slice(0, -2).join(",").trim(), addressLocality: c.name, addressRegion: "ON", postalCode: c.postal, addressCountry: "CA" },
    openingHours: c.openNow247 ? "Mo-Su 00:00-23:59" : ["Mo-Fr 07:00-23:00", "Sa-Su 09:00-21:00"],
  })),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-CA" className={`${inter.variable} ${barlow.variable}`}>
      <body className="flex min-h-screen flex-col antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2">
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">{children}</main>
        <Footer />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
