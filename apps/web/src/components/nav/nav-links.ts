export type NavLinkItem =
  | { label: string; href: string; dropdown: false }
  | { label: string; dropdown: true };

export const NAV_LINKS: NavLinkItem[] = [
  { href: "#home", label: "Home", dropdown: false },
  { href: "#about", label: "About", dropdown: false },
  { label: "Products", dropdown: true },
  { label: "Services", dropdown: true },
  { label: "Solutions", dropdown: true },
  { href: "#partners", label: "Partners", dropdown: false },
  { href: "#insights", label: "Insight", dropdown: false },
];
