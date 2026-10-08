"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { PAGE_SECTIONS, type AdminNavGroupDto, type PageSection } from "@compro/types";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/lib/admin-api";
import { useAdminError } from "@/lib/use-admin-error";

const SECTION_LABELS: Record<PageSection, string> = {
  products: "Products",
  services: "Services",
  solutions: "Solutions",
};

const INPUT =
  "h-9 rounded-md border border-black/[.08] bg-background px-3 text-sm outline-none focus:border-brand-ink dark:border-white/[.145]";

export default function AdminNavigationPage() {
  const { error, setError, handleError } = useAdminError();
  const [groups, setGroups] = React.useState<AdminNavGroupDto[] | null>(null);
  const [busy, setBusy] = React.useState(false);

  const refresh = React.useCallback(async () => {
    try {
      setGroups(await adminApi.navGroups.list());
    } catch (err) {
      handleError(err, "Could not load menu groups.");
      setGroups([]);
    }
  }, [handleError]);

  React.useEffect(() => {
    let cancelled = false;
    adminApi.navGroups
      .list()
      .then((rows) => !cancelled && setGroups(rows))
      .catch((err: unknown) => {
        if (cancelled) return;
        handleError(err, "Could not load menu groups.");
        setGroups([]);
      });
    return () => {
      cancelled = true;
    };
  }, [handleError]);

  async function run(action: () => Promise<unknown>, fallback: string) {
    setError(null);
    setBusy(true);
    try {
      await action();
      await refresh();
    } catch (err) {
      handleError(err, fallback);
    } finally {
      setBusy(false);
    }
  }

  /** Renumbers the section 0..n after moving one group, so ties and gaps never matter. */
  function move(section: PageSection, index: number, delta: -1 | 1) {
    const list = (groups ?? []).filter((group) => group.section === section);
    const target = index + delta;
    if (target < 0 || target >= list.length) return;
    const reordered = [...list];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    void run(
      () =>
        Promise.all(
          reordered.map((group, position) =>
            group.sortOrder === position
              ? Promise.resolve()
              : adminApi.navGroups.update(group.id, { sortOrder: position }),
          ),
        ),
      "Could not reorder.",
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Menu groups</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-ink">
          The columns of the Products, Services and Solutions menus. Pages are placed in a group
          from the Pages screen; the menu itself is built from published pages, so there is no
          separate menu to keep in step. Order here is the order on the site.
        </p>
      </div>

      {error && (
        <p role="alert" className="text-sm text-brand-ink">
          {error}
        </p>
      )}

      {groups === null ? (
        <p className="text-sm text-muted-ink">Loading…</p>
      ) : (
        PAGE_SECTIONS.map((section) => (
          <SectionGroups
            key={section}
            section={section}
            groups={groups.filter((group) => group.section === section)}
            busy={busy}
            onMove={(index, delta) => move(section, index, delta)}
            onRename={(id, title) =>
              run(() => adminApi.navGroups.update(id, { title }), "Could not rename.")
            }
            onDelete={(id) => run(() => adminApi.navGroups.remove(id), "Could not delete.")}
            onCreate={(title) =>
              run(() => adminApi.navGroups.create({ section, title }), "Could not add the group.")
            }
          />
        ))
      )}
    </div>
  );
}

function SectionGroups({
  section,
  groups,
  busy,
  onMove,
  onRename,
  onDelete,
  onCreate,
}: {
  section: PageSection;
  groups: AdminNavGroupDto[];
  busy: boolean;
  onMove: (index: number, delta: -1 | 1) => void;
  onRename: (id: string, title: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onCreate: (title: string) => Promise<void>;
}) {
  const [newTitle, setNewTitle] = React.useState("");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draftTitle, setDraftTitle] = React.useState("");

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{SECTION_LABELS[section]}</h2>

      {groups.length === 0 ? (
        <p className="text-sm text-muted-ink">No groups yet.</p>
      ) : (
        <ul className="divide-y divide-black/[.08] rounded-md border border-black/[.08] dark:divide-white/[.145] dark:border-white/[.145]">
          {groups.map((group, index) => (
            <li key={group.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              {editingId === group.id ? (
                <form
                  className="flex flex-1 items-center gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void onRename(group.id, draftTitle.trim()).then(() => setEditingId(null));
                  }}
                >
                  <input
                    autoFocus
                    value={draftTitle}
                    onChange={(event) => setDraftTitle(event.target.value)}
                    maxLength={120}
                    required
                    className={`${INPUT} flex-1`}
                    aria-label="Group title"
                  />
                  <Button type="submit" size="icon" disabled={busy || !draftTitle.trim()} aria-label="Save title">
                    <Check />
                  </Button>
                  <Button type="button" size="icon" variant="ghost" onClick={() => setEditingId(null)} aria-label="Cancel">
                    <X />
                  </Button>
                </form>
              ) : (
                <>
                  <span className="flex-1 text-sm font-semibold">{group.title}</span>
                  <span className="text-xs text-muted-ink">
                    {group.pageCount} page{group.pageCount === 1 ? "" : "s"}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={busy || index === 0}
                      onClick={() => onMove(index, -1)}
                      aria-label={`Move ${group.title} up`}
                    >
                      <ArrowUp />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={busy || index === groups.length - 1}
                      onClick={() => onMove(index, 1)}
                      aria-label={`Move ${group.title} down`}
                    >
                      <ArrowDown />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(group.id);
                        setDraftTitle(group.title);
                      }}
                      aria-label={`Rename ${group.title}`}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      disabled={busy || group.pageCount > 0}
                      title={group.pageCount > 0 ? "Move or delete its pages first" : undefined}
                      onClick={() => {
                        if (window.confirm(`Delete the group "${group.title}"?`)) void onDelete(group.id);
                      }}
                      aria-label={`Delete ${group.title}`}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      <form
        className="flex items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const title = newTitle.trim();
          if (title) void onCreate(title).then(() => setNewTitle(""));
        }}
      >
        <input
          value={newTitle}
          onChange={(event) => setNewTitle(event.target.value)}
          placeholder={`New ${SECTION_LABELS[section].toLowerCase()} group`}
          maxLength={120}
          className={`${INPUT} w-72`}
          aria-label={`New ${SECTION_LABELS[section]} group title`}
        />
        <Button type="submit" disabled={busy || !newTitle.trim()}>
          <Plus />
          Add group
        </Button>
      </form>
    </section>
  );
}
