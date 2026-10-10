"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Eye, EyeOff, FilePlus2, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { PAGE_SECTIONS, type AdminNavGroupDto, type AdminPageDto, type PageSection } from "@compro/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { adminApi } from "@/lib/admin-api";
import { useAdminError } from "@/lib/use-admin-error";
import { cn } from "@/lib/utils";
import { NewPageForm, SECTION_LABELS, type NewPageValues } from "./NewPageForm";

export default function AdminPagesPage() {
  const router = useRouter();
  const { error, setError, handleError } = useAdminError();
  const [pages, setPages] = React.useState<AdminPageDto[] | null>(null);
  const [groups, setGroups] = React.useState<AdminNavGroupDto[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [creating, setCreating] = React.useState<Partial<NewPageValues> | null>(null);

  const load = React.useCallback(async () => {
    const [pageRows, groupRows] = await Promise.all([adminApi.pages.list(), adminApi.navGroups.list()]);
    setPages(pageRows);
    setGroups(groupRows);
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    Promise.all([adminApi.pages.list(), adminApi.navGroups.list()])
      .then(([pageRows, groupRows]) => {
        if (cancelled) return;
        setPages(pageRows);
        setGroups(groupRows);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        handleError(err, "Could not load pages. Is the API running on port 3007?");
        setPages([]);
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
      await load();
    } catch (err) {
      handleError(err, fallback);
    } finally {
      setBusy(false);
    }
  }

  async function create(values: NewPageValues) {
    setError(null);
    setBusy(true);
    try {
      const [kind, id] = values.placement.split(":");
      const page = await adminApi.pages.create({
        section: values.section,
        slug: values.slug,
        title: values.title,
        ...(kind === "group" ? { groupId: id } : {}),
        ...(kind === "parent" ? { parentId: id } : {}),
        // A child is reached by link; only top-level pages belong in the menu.
        showInNav: kind === "group",
      });
      router.push(`/admin/pages/${page.id}`);
    } catch (err) {
      handleError(err, "Could not create the page.");
      setBusy(false);
    }
  }

  /** Renumbers one sibling list 0..n after a move, so ties and gaps never matter. */
  function move(siblings: AdminPageDto[], index: number, delta: -1 | 1) {
    const target = index + delta;
    if (target < 0 || target >= siblings.length) return;
    const reordered = [...siblings];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    void run(
      () =>
        Promise.all(
          reordered.map((page, position) =>
            page.sortOrder === position
              ? Promise.resolve()
              : adminApi.pages.update(page.id, { sortOrder: position }),
          ),
        ),
      "Could not reorder.",
    );
  }

  const byParent = React.useMemo(() => {
    const map = new Map<string, AdminPageDto[]>();
    for (const page of pages ?? []) {
      if (!page.parentId) continue;
      map.set(page.parentId, [...(map.get(page.parentId) ?? []), page]);
    }
    return map;
  }, [pages]);

  const rowProps = {
    busy,
    byParent,
    onMove: move,
    onToggleMenu: (page: AdminPageDto) =>
      run(() => adminApi.pages.update(page.id, { showInNav: !page.showInNav }), "Could not update the page."),
    onDelete: (page: AdminPageDto) => {
      if (window.confirm(`Delete "${page.title}"? This cannot be undone.`)) {
        void run(() => adminApi.pages.remove(page.id), "Could not delete the page.");
      }
    },
    onAddChild: (page: AdminPageDto) =>
      setCreating({ section: page.section, placement: `parent:${page.id}` }),
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Pages</h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-ink">
            Product, service and solution pages. Edits are saved as a draft and only go live when you
            publish. Top-level pages appear in the menu under their group.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/pages/import" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
            <Upload />
            Import JSON
          </Link>
          <Button size="lg" onClick={() => setCreating({})}>
            <FilePlus2 />
            New page
          </Button>
        </div>
      </div>

      {creating && pages && (
        <NewPageForm
          key={`${creating.section}-${creating.placement}`}
          groups={groups}
          pages={pages}
          busy={busy}
          initial={creating}
          onCreate={(values) => void create(values)}
          onCancel={() => setCreating(null)}
        />
      )}

      {error && (
        <p role="alert" className="text-sm text-brand-ink">
          {error}
        </p>
      )}

      {pages === null ? (
        <p className="text-sm text-muted-ink">Loading…</p>
      ) : (
        PAGE_SECTIONS.map((section) => (
          <SectionTree
            key={section}
            section={section}
            groups={groups.filter((group) => group.section === section)}
            pages={pages.filter((page) => page.section === section && !page.parentId)}
            {...rowProps}
          />
        ))
      )}
    </div>
  );
}

interface RowProps {
  busy: boolean;
  byParent: Map<string, AdminPageDto[]>;
  onMove: (siblings: AdminPageDto[], index: number, delta: -1 | 1) => void;
  onToggleMenu: (page: AdminPageDto) => void;
  onDelete: (page: AdminPageDto) => void;
  onAddChild: (page: AdminPageDto) => void;
}

const bySortThenTitle = (a: AdminPageDto, b: AdminPageDto) =>
  a.sortOrder - b.sortOrder || a.title.localeCompare(b.title);

function SectionTree({
  section,
  groups,
  pages,
  ...row
}: {
  section: PageSection;
  groups: AdminNavGroupDto[];
  /** Top-level pages of this section (no parent). */
  pages: AdminPageDto[];
} & RowProps) {
  const unplaced = pages.filter((page) => !page.groupId).sort(bySortThenTitle);

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{SECTION_LABELS[section]}</h2>

      {groups.map((group) => {
        const inGroup = pages.filter((page) => page.groupId === group.id).sort(bySortThenTitle);
        return (
          <div key={group.id} className="flex flex-col gap-1">
            <h3 className="text-xs font-semibold tracking-wide text-muted-ink uppercase">{group.title}</h3>
            <PageList pages={inGroup} depth={0} {...row} empty="No pages in this group." />
          </div>
        );
      })}

      {unplaced.length > 0 && (
        <div className="flex flex-col gap-1">
          <h3 className="text-xs font-semibold tracking-wide text-muted-ink uppercase">
            Not in a menu group
          </h3>
          <PageList pages={unplaced} depth={0} {...row} empty="" />
        </div>
      )}
    </section>
  );
}

function PageList({
  pages,
  depth,
  empty,
  ...row
}: { pages: AdminPageDto[]; depth: number; empty: string } & RowProps) {
  if (pages.length === 0) {
    return empty ? <p className="text-sm text-muted-ink">{empty}</p> : null;
  }
  return (
    <ul
      className={cn(
        "divide-y divide-black/[.08] rounded-md border border-black/[.08] dark:divide-white/[.145] dark:border-white/[.145]",
        depth > 0 && "ml-6 mt-1",
      )}
    >
      {pages.map((page, index) => {
        const children = [...(row.byParent.get(page.id) ?? [])].sort(bySortThenTitle);
        return (
          <li key={page.id}>
            <PageRow page={page} siblings={pages} index={index} {...row} />
            {children.length > 0 && (
              <div className="pb-2 pr-2">
                <ChildGroups pages={children} depth={depth + 1} {...row} />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * A parent's child pages, under a heading per product group (the tab they are listed under on
 * the parent). Without any group set it is a plain list; ungrouped children go under
 * "Other products" only when other groups exist.
 */
function ChildGroups({ pages, depth, ...row }: { pages: AdminPageDto[]; depth: number } & RowProps) {
  if (!pages.some((page) => page.productGroup)) {
    return <PageList pages={pages} depth={depth} empty="" {...row} />;
  }
  const groups = new Map<string, AdminPageDto[]>();
  for (const page of pages) {
    const name = page.productGroup?.trim() || "Other products";
    groups.set(name, [...(groups.get(name) ?? []), page]);
  }
  return (
    <div className="ml-6 mt-1 flex flex-col gap-3">
      {[...groups].map(([name, members]) => (
        <div key={name} className="flex flex-col gap-1">
          <h4 className="text-xs font-semibold tracking-wide text-muted-ink uppercase">
            {name} · {members.length}
          </h4>
          <PageList pages={members} depth={0} empty="" {...row} />
        </div>
      ))}
    </div>
  );
}

function PageRow({
  page,
  siblings,
  index,
  busy,
  onMove,
  onToggleMenu,
  onDelete,
  onAddChild,
}: { page: AdminPageDto; siblings: AdminPageDto[]; index: number } & RowProps) {
  const live = page.status === "published";
  const topLevel = !page.parentId;

  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-2.5">
      <div className="flex min-w-0 flex-1 flex-col">
        <Link href={`/admin/pages/${page.id}`} className="truncate text-sm font-semibold hover:text-brand-ink">
          {page.title}
        </Link>
        <span className="truncate text-xs text-muted-ink">
          /{page.section}/{page.slug}
        </span>
      </div>

      <span
        className={cn(
          "rounded px-2 py-0.5 text-xs font-semibold",
          live ? "bg-green-600/10 text-green-700 dark:text-green-400" : "bg-surface text-muted-ink",
        )}
      >
        {live ? (page.hasUnpublishedChanges ? "Live · unpublished edits" : "Live") : "Draft"}
      </span>

      <div className="flex items-center gap-1">
        {topLevel && (
          <Button
            size="icon"
            variant="ghost"
            disabled={busy || !page.groupId}
            onClick={() => onToggleMenu(page)}
            title={
              !page.groupId
                ? "Assign a menu group to show this page in the menu"
                : page.showInNav
                  ? "Shown in the menu — click to hide"
                  : "Hidden from the menu — click to show"
            }
            aria-label={page.showInNav ? `Hide ${page.title} from the menu` : `Show ${page.title} in the menu`}
          >
            {page.showInNav && page.groupId ? <Eye /> : <EyeOff />}
          </Button>
        )}
        <Button
          size="icon"
          variant="ghost"
          disabled={busy || index === 0}
          onClick={() => onMove(siblings, index, -1)}
          aria-label={`Move ${page.title} up`}
        >
          <ArrowUp />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          disabled={busy || index === siblings.length - 1}
          onClick={() => onMove(siblings, index, 1)}
          aria-label={`Move ${page.title} down`}
        >
          <ArrowDown />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => onAddChild(page)} aria-label={`Add a page under ${page.title}`} title="Add a child page">
          <Plus />
        </Button>
        <Link
          href={`/admin/pages/${page.id}`}
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
          aria-label={`Edit ${page.title}`}
        >
          <Pencil />
        </Link>
        <Button
          size="icon"
          variant="destructive"
          disabled={busy || page.childCount > 0}
          title={page.childCount > 0 ? "Delete its child pages first" : undefined}
          onClick={() => onDelete(page)}
          aria-label={`Delete ${page.title}`}
        >
          <Trash2 />
        </Button>
      </div>
    </div>
  );
}
