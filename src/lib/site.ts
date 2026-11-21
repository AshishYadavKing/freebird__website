/**
 * Facts about the clubs that the CRM doesn't hold (yet): marketing copy, hours,
 * amenities. Taken from the current freebirdgym site. Items in [BRACKETS] still
 * need real information from the gym.
 *
 * `match` links each club to its CRM branch by name, so live data (plans,
 * bookings) attaches to the right club.
 */

export type ClubFeature = { t: string; d: string };

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
  /** Google search for the club's business profile, where visitors read and leave reviews. */
  reviewsUrl: string;
  page: {
    title: string;
    intro: string;
    sizeLine: string;
    includes: string[];
    highlight: { title: string; text: string };
    features: ClubFeature[];
  };
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
    reviewsUrl: "https://www.google.com/search?q=Free+Bird+Gym+Mississauga+reviews",
    page: {
      title: "Mississauga’s best 24/7 gym",
      intro: "Located near Dixie & Eglinton Ave E, our 24/7 facility offers all you need to call this gym your home.",
      sizeLine: "In our 23,000 sq ft Mississauga gym, you’ll find your new fitness journey. The gym includes:",
      includes: ["24/7 access", "24/7 staff", "Group classes in a dedicated room", "Custom-built strength equipment", "Men’s sauna & spa rooms", "Women’s sauna & spa rooms", "Hourly cleaning"],
      highlight: { title: "Never overcrowded", text: "The gym is capped at 1,500 members, so you’ll never face the dreaded overcrowded gym." },
      features: [
        { t: "Gender-separated sauna & spa rooms", d: "Premium spa and sauna rooms, separate for men and women, so you can unwind and decompress after a workout." },
        { t: "Staff on site 24/7", d: "Free Bird staff are on site around the clock, keeping the gym clean and adding safety while you train." },
        { t: "Custom-built training equipment", d: "Custom cable trainers and free weights, designed for lifters at every stage." },
        { t: "24/7 unlimited access", d: "Unlimited access to the gym, open 24/7. Work out whenever you like." },
        { t: "Personal training just for you", d: "Whether you want to lose weight, get stronger, become more flexible or compete, our trainers are here to help." },
        { t: "Optional online training", d: "Getting to the gym every day can be hard, so we offer an easy-to-use online training programme too." },
        { t: "Fascial Stretch Therapy", d: "FST™ is a complete, full-body functional mobility restoration system. Available on request." },
        { t: "Custom nutrition plans", d: "Our qualified trainers can design nutrition and meal plans based on your goals." },
      ],
    },
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
    reviewsUrl: "https://www.google.com/search?q=Free+Bird+Gym+Brampton+reviews",
    page: {
      title: "The biggest & best personal training studio in Canada",
      intro: "Our premier personal-training studio on Orenda Rd combines expert guidance, personalised programmes and a supportive environment to help you reach your goals.",
      sizeLine: "In our 12,000 sq ft Brampton studio, you’ll find your new personal training journey. The studio includes:",
      includes: ["An exclusive, PT-only space", "Online training available for members", "Very affordable membership options", "Custom-built strength equipment", "In-house supplements", "InBody machines for accurate tracking"],
      highlight: { title: "Personal training clients only", text: "Serviced by 25+ coaches, our studio is dedicated only to personal training clients. This is not a regular gym." },
      features: [
        { t: "15+ years of experience", d: "Over 15 years guiding physical transformations, with the skills to help you get the results you want." },
        { t: "Over 1,500 transformations", d: "Our clients are living proof of what dedication, expert guidance and a personal plan can do." },
        { t: "Customised programming", d: "No cookie-cutter routines — a programme that fits you, for real results and lasting progress." },
        { t: "Custom-designed equipment", d: "All free weights, cable and hydraulic press machines are custom made: higher weight loads, longer cables and taller frames." },
        { t: "A holistic approach", d: "Plans built around your goals, challenges and lifestyle — strength, weight loss, hormone balance or overall health." },
        { t: "InBody tracking", d: "Accurate body-composition scans so you and your coach can see real progress, not just the scale." },
      ],
    },
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
  // Member (client) app. Store-neutral Apple link so it opens in the visitor's own country store.
  instagram: "https://www.instagram.com/freebirdgym/",
  facebook: "https://www.facebook.com/profile.php?id=61558764231759",
  appStore: process.env.NEXT_PUBLIC_APP_STORE_URL || "https://apps.apple.com/app/freebird-client/id6795422591",
  playStore: process.env.NEXT_PUBLIC_PLAY_STORE_URL || "https://play.google.com/store/apps/details?id=com.freebird.client",
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
