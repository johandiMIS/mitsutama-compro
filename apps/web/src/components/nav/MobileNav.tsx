"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { CloseIcon } from "../icons/CloseIcon";
import { MenuIcon } from "../icons/MenuIcon";
import { NAV_LINKS } from "./nav-links";
import { NAV_ICON_BUTTON, NavContactButton, NavIconActions } from "./NavActions";
import { NavLink } from "./NavLink";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  /** Accordion, not multi-open: only one of Products/Services/Solutions is expanded at a time. */
  const [openSection, setOpenSection] = useState<string | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  function close() {
    setOpen(false);
    setOpenSection(null);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
        buttonRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="flex items-center gap-2 lg:hidden">
      <NavIconActions />
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label="Toggle navigation menu"
        onClick={() => (open ? close() : setOpen(true))}
        className={NAV_ICON_BUTTON}
      >
        {open ? <CloseIcon size={18} /> : <MenuIcon size={18} />}
      </button>

      {open && (
        <nav
          id="mobile-nav-panel"
          aria-label="Main"
          className="fixed inset-x-0 top-16 z-40 flex max-h-[calc(100vh-4rem)] flex-col overflow-y-auto border-t-2 border-primary bg-background px-6 pb-8 pt-4 text-sm"
        >
          {NAV_LINKS.map((link) => {
            if (!link.dropdown) {
              return (
                <div key={link.href} className="py-3">
                  <NavLink href={link.href} onClick={close} onLightSurface>
                    {link.label}
                  </NavLink>
                </div>
              );
            }

            const isExpanded = openSection === link.label;
            const panelId = `mobile-nav-${link.label.toLowerCase()}`;

            return (
              <div key={link.label}>
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  aria-controls={panelId}
                  onClick={() => setOpenSection(isExpanded ? null : link.label)}
                  className={`flex w-full items-center justify-between py-3 text-left font-semibold transition-colors ${
                    isExpanded ? "text-primary" : "text-black hover:text-primary"
                  }`}
                >
                  {link.label}
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  />
                </button>

                {isExpanded && (
                  <div
                    id={panelId}
                    className="divide-y divide-black/10 border-y border-black/10"
                  >
                    {link.groups.map((group) => (
                      <div key={group.title} className="flex flex-col gap-4 py-6">
                        <p className="text-xs uppercase tracking-[0.08em] text-zinc-500">
                          {group.title}
                        </p>
                        <ul className="flex flex-col gap-4">
                          {/* Keyed by index: the supplied menu content repeats one label. */}
                          {group.items.map((menuItem, itemIndex) => (
                            <li key={`${menuItem.label}-${itemIndex}`}>
                              <Link
                                href={menuItem.href}
                                onClick={close}
                                className="font-semibold text-black transition-colors hover:text-primary"
                              >
                                {menuItem.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <div className="mt-5 border-t border-black/10 pt-6">
            <NavContactButton onClick={close} />
          </div>
        </nav>
      )}
    </div>
  );
}
