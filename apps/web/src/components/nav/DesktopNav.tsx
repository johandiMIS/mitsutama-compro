import { NAV_LINKS } from "./nav-links";
import { NavLink } from "./NavLink";

export function DesktopNav() {
  return (
    <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
      {NAV_LINKS.map((link) => (
        <NavLink key={link.href} href={link.href}>
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}
