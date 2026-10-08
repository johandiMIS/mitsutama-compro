"use client";

import * as React from "react";
import { PAGE_SECTIONS, type AdminNavGroupDto, type AdminPageDto, type PageSection } from "@compro/types";
import { Button } from "@/components/ui/button";
import { slugify } from "@/components/nav/nav-links";

const FIELD =
  "h-9 rounded-md border border-black/[.08] bg-background px-3 text-sm outline-none focus:border-brand-ink dark:border-white/[.145]";

export const SECTION_LABELS: Record<PageSection, string> = {
  products: "Products",
  services: "Services",
  solutions: "Solutions",
};

export interface NewPageValues {
  section: PageSection;
  title: string;
  slug: string;
  /** "group:<id>" | "parent:<id>" | "" */
  placement: string;
}

/**
 * Where a new page goes: under a menu group (a top-level page, listed in the menu) or under
 * another page (a child, reachable by link). Options are limited to the chosen section.
 */
export function NewPageForm({
  groups,
  pages,
  busy,
  onCreate,
  onCancel,
  initial,
}: {
  groups: AdminNavGroupDto[];
  pages: AdminPageDto[];
  busy: boolean;
  onCreate: (values: NewPageValues) => void;
  onCancel: () => void;
  initial?: Partial<NewPageValues>;
}) {
  const [section, setSection] = React.useState<PageSection>(initial?.section ?? "products");
  const [title, setTitle] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [slugTouched, setSlugTouched] = React.useState(false);
  const [placement, setPlacement] = React.useState(initial?.placement ?? "");

  const sectionGroups = groups.filter((group) => group.section === section);
  const sectionPages = pages.filter((page) => page.section === section);

  function changeSection(next: PageSection) {
    setSection(next);
    setPlacement("");
  }

  return (
    <form
      className="flex flex-col gap-4 rounded-md border border-black/[.08] p-4 dark:border-white/[.145]"
      onSubmit={(event) => {
        event.preventDefault();
        onCreate({ section, title: title.trim(), slug, placement });
      }}
    >
      <h2 className="text-base font-semibold">New page</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold">Section</span>
          <select
            value={section}
            onChange={(event) => changeSection(event.target.value as PageSection)}
            className={FIELD}
          >
            {PAGE_SECTIONS.map((value) => (
              <option key={value} value={value}>
                {SECTION_LABELS[value]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold">Place under</span>
          <select value={placement} onChange={(event) => setPlacement(event.target.value)} className={FIELD}>
            <option value="">Nowhere yet (hidden from menu)</option>
            <optgroup label="Menu group (appears in the menu)">
              {sectionGroups.map((group) => (
                <option key={group.id} value={`group:${group.id}`}>
                  {group.title}
                </option>
              ))}
            </optgroup>
            <optgroup label="Child of page (reachable by link)">
              {sectionPages.map((page) => (
                <option key={page.id} value={`parent:${page.id}`}>
                  {page.title}
                </option>
              ))}
            </optgroup>
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold">Title</span>
          <input
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              if (!slugTouched) setSlug(slugify(event.target.value));
            }}
            maxLength={200}
            required
            autoFocus
            className={FIELD}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold">URL slug</span>
          <input
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(slugify(event.target.value));
            }}
            maxLength={120}
            required
            className={FIELD}
          />
          <span className="text-xs text-muted-ink">
            /{section}/{slug || "…"}
          </span>
        </label>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={busy || !title.trim() || !slug}>
          Create and edit
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
