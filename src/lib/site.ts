/**
 * Facts about the clubs that the CRM doesn't hold (yet): marketing copy, hours,
 * amenities. Taken from the current freebirdgym site. Items in [BRACKETS] still
 * need real information from the gym.
 *
 * `match` links each club to its CRM branch by name, so live data (plans,
 * bookings) attaches to the right club.
 */

export type Club = {
  slug: "mississauga" | "brampton";
  name: string;
  match: RegExp;
  address: string;
  postal: string;
  phone: string;
  phoneHref: string;
  hours: string[];
  openNow247: boolean;
  tag: string;
  amenities: string[];
  mapsUrl: string;
};

export const CLUBS: Club[] = [
  {
    slug: "mississauga",
    name: "Mississauga",
    match: /mississauga/i,
    address: "U100, 1331 Crestlawn Dr, Mississauga, ON",
    postal: "L4W 1P8",
    phone: "905 238 1331",
    phoneHref: "tel:+19052381331",
    hours: ["Open & staffed 24/7"],
    openNow247: true,
    tag: "Open 24/7 · Staffed 24/7",
    amenities: ["23,000 sq ft floor", "Custom-built strength equipment", "Group classes room", "Men’s sauna & spa", "Women’s sauna & spa", "Hourly cleaning"],
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=1331+Crestlawn+Dr+Mississauga+ON+L4W+1P8",
  },
  {
    slug: "brampton",
    name: "Brampton",
    match: /brampton/i,
    address: "284 Orenda Rd #11, Brampton, ON",
    postal: "L6T 4X6",
    phone: "905 459 6255",
    phoneHref: "tel:+19054596255",
    hours: ["Mon–Fri 7AM–11PM", "Sat–Sun 9AM–9PM"],
    openNow247: false,
    tag: "Personal training studio",
    amenities: ["1-on-1 coaching", "Rehab & mobility", "Badminton courts", "High Spirits Studio"],
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=284+Orenda+Rd+11+Brampton+ON+L6T+4X6",
  },
];

export const SITE = {
  name: "Free Bird Health Clubs",
  short: "Free Bird",
  email: "info@freebirdgym.com",
  slogan: "Fly with high spirits.",
  years: "15+",
  memberCap: "1,500",
  sqft: "23,000",
  // [APP STORE LINKS] — replace with the real store URLs.
  appStore: "#app-store",
  playStore: "#google-play",
};

export const NAV = [
  { href: "/memberships", label: "Memberships" },
  { href: "/personal-training", label: "Training" },
  { href: "/rehab", label: "Rehab" },
  { href: "/badminton", label: "Badminton" },
  { href: "/store", label: "Store" },
  { href: "/locations", label: "Locations" },
  { href: "/articles", label: "Articles" },
  { href: "/about", label: "About" },
];

export function clubForBranchName(name: string): Club | undefined {
  return CLUBS.find((c) => c.match.test(name));
}
