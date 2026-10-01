export type NavMenuItem = { label: string; href: string };
export type NavMenuGroup = { title: string; items: NavMenuItem[] };

export type NavLinkItem =
  | { label: string; href: string; dropdown: false }
  | {
      label: string;
      /** Section root, e.g. /products — its index page, and the prefix that marks the tab active. */
      href: string;
      dropdown: true;
      columns: number;
      groups: NavMenuGroup[];
    };

/** URL-safe slug: "AC/DC Source and Load Calibration" -> "ac-dc-source-and-load-calibration". */
export function slugify(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Builds menu entries for one section, each linking to /<section>/<slug-of-label>. */
const itemIn =
  (section: string) =>
  (label: string): NavMenuItem => ({ label, href: `${section}/${slugify(label)}` });

const productItem = itemIn("/products");
const serviceItem = itemIn("/services");
const solutionItem = itemIn("/solutions");

const PRODUCT_GROUPS: NavMenuGroup[] = [
  {
    title: "Chroma",
    items: [
      productItem("Power Electronic Test and Equipment"),
      productItem("Inverter Test and Equipment"),
      productItem("Battery Test and Equipment"),
      productItem("EV and EVSE Test and Equipment"),
    ],
  },
  {
    title: "IMC",
    items: [
      productItem("Vehicle Dynamic Test and Equipment"),
      productItem("EV Power Analyzer"),
      productItem("Train NVH Monitoring and Analysis"),
      productItem("Aeroplanes NVH and Analysis"),
      productItem("Structure Analyzer"),
      productItem("Bridge Monitoring and Analysis"),
      productItem("Fuel Cell Monitoring and Analysis"),
    ],
  },
  {
    title: "GRAS",
    items: [
      productItem("Head and Torso"),
      productItem("Engine Microphone"),
      productItem("Brake Microphone"),
      productItem("In Cabin Microphone"),
      productItem("Production Microphone"),
    ],
  },
  {
    title: "Audio Precision",
    items: [
      productItem("DAC, Power Amplifier and DSP Test and Equipment"),
      productItem("Audio Device Production Test and Quality Check"),
      productItem("Headphone, Earbud and Smart Speaker Test"),
      productItem("Automotive Entertainment Test and Equipment"),
    ],
  },
  {
    title: "Lisun Group",
    items: [
      productItem("Luminaire Test and Equipment"),
      productItem("Home Appliance Test and Equipment"),
      productItem("Cable and Wire Test and Equipment"),
    ],
  },
];

const SERVICE_GROUPS: NavMenuGroup[] = [
  {
    title: "Testing and Certification",
    items: [
      serviceItem("Dyno Testing"),
      serviceItem("Brake Testing"),
      serviceItem("PV Testing and Certification"),
      serviceItem("Battery Testing and Certification"),
      serviceItem("Aero Dynamic Testing and Certification"),
      serviceItem("Bridge Testing and Certification"),
    ],
  },
  {
    title: "Calibration",
    items: [
      serviceItem("EVSE Calibration"),
      serviceItem("Battery Test Calibration"),
      serviceItem("Caliper Calibration"),
      serviceItem("Torque Wrench Calibration"),
      serviceItem("Environmental Chamber Calibration"),
      serviceItem("Shaker Calibration"),
      serviceItem("Sound Level Meter Calibration"),
      serviceItem("Microphone Calibration"),
      serviceItem("Audio Analyzer Calibration"),
      serviceItem("Oscilloscope Calibration"),
      serviceItem("AC/DC Source and Load Calibration"),
    ],
  },
];

const SOLUTION_GROUPS: NavMenuGroup[] = [
  {
    title: "Standard Compliance",
    items: [
      solutionItem("IEC 62133 Battery Standard Solution"),
      solutionItem("IEC 62619 Battery Standard Solution"),
      solutionItem("UN 38.3 Battery Standard Solution"),
      solutionItem("UNR 136 Battery Standard Solution"),
      solutionItem("UNR 100 Battery Standard Solution"),
      solutionItem("IEC 61215 Photovoltaic (PV) Standard Solution"),
      solutionItem("IEC 61730 Photovoltaic (PV) Standard Solution"),
      solutionItem("IEC 60335 Home Appliance and Similar Electrical Appliance Standard Solution"),
      // NOTE: IEC 61215 is listed twice in the supplied design — kept verbatim.
      solutionItem("IEC 61215 Photovoltaic (PV) Standard Solution"),
      solutionItem("IEC 60598 Luminaire Standard Solution"),
    ],
  },
];

export const NAV_LINKS: NavLinkItem[] = [
  // Root-relative so the anchors still resolve from sub-pages such as /about.
  { href: "/#home", label: "Home", dropdown: false },
  { href: "/about", label: "About", dropdown: false },
  // `columns` is the desktop mega-menu width, per the supplied designs.
  { label: "Products", href: "/products", dropdown: true, columns: 3, groups: PRODUCT_GROUPS },
  { label: "Services", href: "/services", dropdown: true, columns: 2, groups: SERVICE_GROUPS },
  { label: "Solutions", href: "/solutions", dropdown: true, columns: 2, groups: SOLUTION_GROUPS },
  { href: "/#partners", label: "Partners", dropdown: false },
  { href: "/#insights", label: "Insight", dropdown: false },
];

/** The three catalogue sections with placeholder pages under /<section>/[slug]. */
export type CatalogSection = "products" | "services" | "solutions";

/**
 * Looks up a slug in a section's menu, for the page title and breadcrumb. Returns null for
 * slugs not in the menu — those pages still render, titled from the slug itself.
 */
export function findCatalogEntry(
  section: CatalogSection,
  slug: string,
): { section: NavLinkItem & { dropdown: true }; group: NavMenuGroup; item: NavMenuItem } | null {
  const link = NAV_LINKS.find(
    (entry): entry is NavLinkItem & { dropdown: true } =>
      entry.dropdown && entry.href === `/${section}`,
  );
  if (!link) return null;
  for (const group of link.groups) {
    const match = group.items.find((entry) => entry.href === `/${section}/${slug}`);
    if (match) return { section: link, group, item: match };
  }
  return null;
}
