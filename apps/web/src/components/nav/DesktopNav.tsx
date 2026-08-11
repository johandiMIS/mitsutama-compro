import { NAV_LINKS } from "./nav-links";
import { NavDropdownTrigger } from "./NavDropdownTrigger";
import { NavLink } from "./NavLink";

export function DesktopNav() {
  return (
    <nav aria-label="Main" className="hidden items-center gap-8 text-sm lg:flex">
      {NAV_LINKS.map((link) =>
        link.dropdown ? (
          <NavDropdownTrigger key={link.label} label={link.label} />
        ) : (
          <NavLink key={link.href} href={link.href}>
            {link.label}
          </NavLink>
        ),
      )}
    </nav>
  );
}
