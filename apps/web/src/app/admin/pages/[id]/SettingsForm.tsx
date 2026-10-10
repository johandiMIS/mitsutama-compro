"use client";

import * as React from "react";
import type { AdminNavGroupDto, AdminPageDto } from "@compro/types";
import { Button } from "@/components/ui/button";
import { slugify } from "@/components/nav/nav-links";
import { adminApi } from "@/lib/admin-api";
import { useAdminError } from "@/lib/use-admin-error";

const FIELD =
  "h-9 rounded-md border border-black/[.08] bg-background px-3 text-sm outline-none focus:border-brand-ink dark:border-white/[.145]";

/** Descendants of `id`, so a page can't be moved under its own child. */
function descendantIds(id: string, pages: AdminPageDto[]): Set<string> {
  const out = new Set<string>();
  const queue = [id];
  while (queue.length > 0) {
    const current = queue.pop()!;
    for (const page of pages) {
      if (page.parentId === current && !out.has(page.id)) {
        out.add(page.id);
        queue.push(page.id);
      }
    }
  }
  return out;
}

/** Title, URL, menu placement and SEO. Saved separately from content; applies to a live page at once. */
export function SettingsForm({
  page,
  pages,
  groups,
  onSaved,
}: {
  page: AdminPageDto;
  pages: AdminPageDto[];
  groups: AdminNavGroupDto[];
  onSaved: (saved: AdminPageDto) => void;
}) {
  const { error, setError, handleError } = useAdminError();
  const [title, setTitle] = React.useState(page.title);
  const [slug, setSlug] = React.useState(page.slug);
  const [navLabel, setNavLabel] = React.useState(page.navLabel ?? "");
  const [seoTitle, setSeoTitle] = React.useState(page.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = React.useState(page.seoDescription ?? "");
  const [showInNav, setShowInNav] = React.useState(page.showInNav);
  const [placement, setPlacement] = React.useState(
    page.groupId ? `group:${page.groupId}` : page.parentId ? `parent:${page.parentId}` : "",
  );
  const [productGroup, setProductGroup] = React.useState(page.productGroup ?? "");
  const [busy, setBusy] = React.useState(false);

  const live = page.status === "published";
  const blocked = descendantIds(page.id, pages);
  const sectionGroups = groups.filter((group) => group.section === page.section);
  const sectionPages = pages.filter(
    (other) => other.section === page.section && other.id !== page.id && !blocked.has(other.id),
  );
  const inMenu = placement.startsWith("group:");
  const parentId = placement.startsWith("parent:") ? placement.slice("parent:".length) : null;

  // Groups already in use: the parent's category tabs plus what its other children use.
  const [parentGroups, setParentGroups] = React.useState<string[]>([]);
  React.useEffect(() => {
    if (!parentId) return;
    let cancelled = false;
    adminApi.pages
      .get(parentId)
      .then((parent) => {
        if (cancelled) return;
        const names = new Set<string>();
        for (const block of parent.draftData?.content ?? []) {
          if (block.type === "CategorizedProducts") {
            for (const category of block.props.categories) if (category.name.trim()) names.add(category.name);
          }
        }
        for (const other of pages) if (other.parentId === parentId && other.productGroup) names.add(other.productGroup);
        setParentGroups([...names]);
      })
      .catch(() => !cancelled && setParentGroups([]));
    return () => {
      cancelled = true;
    };
  }, [parentId, pages]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    const [kind, targetId] = placement.split(":");
    try {
      const saved = await adminApi.pages.update(page.id, {
        title: title.trim(),
        slug,
        navLabel: navLabel.trim(),
        seoTitle: seoTitle.trim(),
        seoDescription: seoDescription.trim(),
        showInNav: inMenu ? showInNav : false,
        // Empty string clears; the API enforces "group or parent, not both".
        groupId: kind === "group" ? targetId : "",
        parentId: kind === "parent" ? targetId : "",
        // Only meaningful under a parent page; empty string clears it.
        productGroup: kind === "parent" ? productGroup.trim() : "",
      });
      onSaved(saved);
    } catch (err) {
      handleError(err, "Could not save the settings.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="flex max-w-4xl flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold">Title (page heading and breadcrumb)</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} required className={FIELD} />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold">URL slug</span>
          <input
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            maxLength={120}
            required
            disabled={live}
            className={`${FIELD} disabled:opacity-60`}
          />
          <span className="text-xs text-muted-ink">
            {live
              ? "Locked while live — unpublish to change the URL, or links to it would break."
              : `/${page.section}/${slug || "…"}`}
          </span>
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold">Place under</span>
          <select value={placement} onChange={(e) => setPlacement(e.target.value)} className={FIELD}>
            <option value="">Nowhere (hidden from menu)</option>
            <optgroup label="Menu group (appears in the menu)">
              {sectionGroups.map((group) => (
                <option key={group.id} value={`group:${group.id}`}>
                  {group.title}
                </option>
              ))}
            </optgroup>
            <optgroup label="Child of page (reachable by link)">
              {sectionPages.map((other) => (
                <option key={other.id} value={`parent:${other.id}`}>
                  {other.title}
                </option>
              ))}
            </optgroup>
          </select>
        </label>

        {parentId && (
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-semibold">Product group (tab on the parent page)</span>
            <input
              value={productGroup}
              onChange={(e) => setProductGroup(e.target.value)}
              list="product-groups"
              maxLength={120}
              placeholder="e.g. AC Power Source"
              className={FIELD}
            />
            <datalist id="product-groups">
              {parentGroups.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
            <span className="text-xs text-muted-ink">
              Once published, this page is listed as a card under this group on its parent page. A new
              name creates a new group. Leave empty for “Other products”.
            </span>
          </label>
        )}

        <div className="flex flex-col gap-2 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={inMenu && showInNav}
              disabled={!inMenu}
              onChange={(e) => setShowInNav(e.target.checked)}
            />
            <span className="font-semibold">Show in the menu</span>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="font-semibold">Menu label (if shorter than the title)</span>
            <input
              value={navLabel}
              onChange={(e) => setNavLabel(e.target.value)}
              maxLength={120}
              disabled={!inMenu}
              className={`${FIELD} disabled:opacity-60`}
            />
          </label>
        </div>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold">SEO title (optional)</span>
          <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} maxLength={200} className={FIELD} />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold">SEO description (optional)</span>
          <textarea
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
            maxLength={400}
            rows={2}
            className="rounded-md border border-black/[.08] bg-background px-3 py-2 text-sm outline-none focus:border-brand-ink dark:border-white/[.145]"
          />
        </label>
      </div>

      {error && (
        <p role="alert" className="text-sm text-brand-ink">
          {error}
        </p>
      )}
      <div>
        <Button type="submit" disabled={busy || !title.trim() || !slug}>
          {busy ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </form>
  );
}
