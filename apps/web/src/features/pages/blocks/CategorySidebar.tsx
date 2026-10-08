"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type SidebarCategory = { id: string; name: string };

/** Space the sticky site header (64px) takes, plus breathing room. Must match `scroll-mt-*`. */
const HEADER_OFFSET = 96;

/**
 * Scroll-spy for CategorizedProducts. The cards stay server-rendered; only this list is
 * client code. A category is "active" once its section's top passes a line just below the
 * header (the last one to do so wins).
 *
 * Below `lg` it becomes a sticky horizontal chip bar with the same active state.
 */
export function CategorySidebar({ categories }: { categories: SidebarCategory[] }) {
  const [active, setActive] = useState(categories[0]?.id ?? "");

  useEffect(() => {
    let frame = 0;
    // Active = the last category whose top has crossed a line a little below the header.
    // Position-based rather than IntersectionObserver so the final, short category still
    // activates once it scrolls into view, even though its top never reaches the header.
    function update() {
      frame = 0;
      const line = HEADER_OFFSET + window.innerHeight * 0.3;
      let current = categories[0]?.id ?? "";
      for (const category of categories) {
        const element = document.getElementById(category.id);
        if (element && element.getBoundingClientRect().top <= line) current = category.id;
      }
      setActive(current);
    }
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [categories]);

  function go(event: React.MouseEvent<HTMLAnchorElement>, id: string) {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    // replaceState, not a hash navigation: the sidebar shouldn't fill the back button.
    history.replaceState(null, "", `#${id}`);
    setActive(id);
  }

  return (
    <nav
      aria-label="Product categories"
      className={cn(
        // Mobile: chip bar pinned under the site header.
        "sticky top-16 z-10 -mx-6 overflow-x-auto bg-background/90 px-6 py-3 backdrop-blur sm:-mx-10 sm:px-10 md:-mx-20 md:px-20",
        // Desktop: vertical list pinned beside the content.
        "lg:top-28 lg:mx-0 lg:self-start lg:overflow-visible lg:bg-transparent lg:p-0 lg:backdrop-blur-none",
      )}
    >
      <ul className="flex gap-2 lg:flex-col lg:gap-1">
        {categories.map((category) => {
          const isActive = category.id === active;
          return (
            <li key={category.id} className="shrink-0">
              <a
                href={`#${category.id}`}
                onClick={(event) => go(event, category.id)}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-semibold whitespace-nowrap transition-colors lg:whitespace-normal",
                  isActive
                    ? "bg-primary text-white lg:bg-transparent lg:text-brand-ink"
                    : "bg-surface text-foreground hover:text-brand-ink lg:bg-transparent",
                )}
              >
                {category.name}
                <span aria-hidden="true" className={cn("hidden lg:inline", !isActive && "invisible")}>
                  →
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
