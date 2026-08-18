export type NavMenuItem = { label: string; href: string };
export type NavMenuGroup = { title: string; items: NavMenuItem[] };

export type NavLinkItem =
  | { label: string; href: string; dropdown: false }
  | { label: string; dropdown: true; columns: number; groups: NavMenuGroup[] };

/** Destination pages for the mega-menu entries don't exist yet — every submenu item points at
 * "#" until routes are built. Swap this helper's href for the real path per item then. */
const item = (label: string): NavMenuItem => ({ label, href: "#" });

const PRODUCT_GROUPS: NavMenuGroup[] = [
  {
    title: "Chroma",
    items: [
      item("Power Electronic Test and Equipment"),
      item("Inverter Test and Equipment"),
      item("Battery Test and Equipment"),
      item("EV and EVSE Test and Equipment"),
    ],
  },
  {
    title: "IMC",
    items: [
      item("Vehicle Dynamic Test and Equipment"),
      item("EV Power Analyzer"),
      item("Train NVH Monitoring and Analysis"),
      item("Aeroplanes NVH and Analysis"),
      item("Structure Analyzer"),
      item("Bridge Monitoring and Analysis"),
      item("Fuel Cell Monitoring and Analysis"),
    ],
  },
  {
    title: "GRAS",
    items: [
      item("Head and Torso"),
      item("Engine Microphone"),
      item("Brake Microphone"),
      item("In Cabin Microphone"),
      item("Production Microphone"),
    ],
  },
  {
    title: "Audio Precision",
    items: [
      item("DAC, Power Amplifier and DSP Test and Equipment"),
      item("Audio Device Production Test and Quality Check"),
      item("Headphone, Earbud and Smart Speaker Test"),
      item("Automotive Entertainment Test and Equipment"),
    ],
  },
  {
    title: "Lisun Group",
    items: [
      item("Luminaire Test and Equipment"),
      item("Home Appliance Test and Equipment"),
      item("Cable and Wire Test and Equipment"),
    ],
  },
];

const SERVICE_GROUPS: NavMenuGroup[] = [
  {
    title: "Testing and Certification",
    items: [
      item("Dyno Testing"),
      item("Brake Testing"),
      item("PV Testing and Certification"),
      item("Battery Testing and Certification"),
      item("Aero Dynamic Testing and Certification"),
      item("Bridge Testing and Certification"),
    ],
  },
  {
    title: "Calibration",
    items: [
      item("EVSE Calibration"),
      item("Battery Test Calibration"),
      item("Caliper Calibration"),
      item("Torque Wrench Calibration"),
      item("Environmental Chamber Calibration"),
      item("Shaker Calibration"),
      item("Sound Level Meter Calibration"),
      item("Microphone Calibration"),
      item("Audio Analyzer Calibration"),
      item("Oscilloscope Calibration"),
      item("AC/DC Source and Load Calibration"),
    ],
  },
];

const SOLUTION_GROUPS: NavMenuGroup[] = [
  {
    title: "Standard Compliance",
    items: [
      item("IEC 62133 Battery Standard Solution"),
      item("IEC 62619 Battery Standard Solution"),
      item("UN 38.3 Battery Standard Solution"),
      item("UNR 136 Battery Standard Solution"),
      item("UNR 100 Battery Standard Solution"),
      item("IEC 61215 Photovoltaic (PV) Standard Solution"),
      item("IEC 61730 Photovoltaic (PV) Standard Solution"),
      item("IEC 60335 Home Appliance and Similar Electrical Appliance Standard Solution"),
      // NOTE: IEC 61215 is listed twice in the supplied design — kept verbatim.
      item("IEC 61215 Photovoltaic (PV) Standard Solution"),
      item("IEC 60598 Luminaire Standard Solution"),
    ],
  },
];

export const NAV_LINKS: NavLinkItem[] = [
  { href: "#home", label: "Home", dropdown: false },
  { href: "#about", label: "About", dropdown: false },
  // `columns` is the desktop mega-menu width, per the supplied designs.
  { label: "Products", dropdown: true, columns: 3, groups: PRODUCT_GROUPS },
  { label: "Services", dropdown: true, columns: 2, groups: SERVICE_GROUPS },
  { label: "Solutions", dropdown: true, columns: 2, groups: SOLUTION_GROUPS },
  { href: "#partners", label: "Partners", dropdown: false },
  { href: "#insights", label: "Insight", dropdown: false },
];
