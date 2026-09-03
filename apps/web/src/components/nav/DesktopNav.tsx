"use client";

import { useEffect, useState } from "react";
import { SectionContainer } from "@/components/SectionContainer";
import { NAV_LINKS } from "./nav-links";
import { NavDropdownTrigger } from "./NavDropdownTrigger";
import { NavLink } from "./NavLink";
import { NavMegaMenu } from "./NavMegaMenu";

const panelIdFor = (label: string) => `nav-menu-${label.toLowerCase()}`;

export function DesktopNav() {
  const [openLabel, setOpenLabel] = useState<string | null>(null);
  const openLink = NAV_LINKS.find((link) => link.dropdown && link.label === openLabel);

  useEffect(() => {
    if (!openLabel) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenLabel(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openLabel]);

  return (
    // The panel is a descendant, so moving the pointer from a trigger down into the menu does
    // not fire mouseleave — only leaving the nav and the menu together closes it.
    <div className="hidden lg:block" onMouseLeave={() => setOpenLabel(null)}>
      <nav aria-label="Main" className="flex items-center gap-8 text-sm">
        {NAV_LINKS.map((link) =>
          link.dropdown ? (
            <NavDropdownTrigger
              key={link.label}
              label={link.label}
              open={openLabel === link.label}
              panelId={panelIdFor(link.label)}
              onClick={() => setOpenLabel((v) => (v === link.label ? null : link.label))}
              onMouseEnter={() => setOpenLabel(link.label)}
            />
          ) : (
            <NavLink key={link.href} href={link.href} onMouseEnter={() => setOpenLabel(null)}>
              {link.label}
            </NavLink>
          ),
        )}
      </nav>

      {openLink?.dropdown && (
        // Positioned against the sticky <header>, so the panel spans the viewport edge to edge.
        <div
          id={panelIdFor(openLink.label)}
          className="absolute inset-x-0 top-full border-t-2 border-primary bg-background shadow-[0_14px_28px_0_#00000014] dark:border-b dark:border-white/[.145] dark:shadow-none"
        >
          <SectionContainer className="py-8">
            <NavMegaMenu
              groups={openLink.groups}
              columns={openLink.columns}
              onNavigate={() => setOpenLabel(null)}
            />
          </SectionContainer>
        </div>
      )}
    </div>
  );
}
