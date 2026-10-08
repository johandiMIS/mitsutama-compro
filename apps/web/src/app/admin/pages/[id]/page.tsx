"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Puck, type Data } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { ExternalLink, Settings } from "lucide-react";
import {
  EMPTY_PAGE_DOCUMENT,
  type AdminNavGroupDto,
  type AdminPageDto,
  type PageValidationIssue,
} from "@compro/types";
import { Button } from "@/components/ui/button";
import { ApiError, adminApi } from "@/lib/admin-api";
import { useAdminError } from "@/lib/use-admin-error";
import { editorConfig } from "@/features/pages/editor/editor-config";
import { SettingsForm } from "./SettingsForm";

/**
 * Puck can attach bookkeeping beyond `{ root, content }`. The API validates the document
 * strictly, so send exactly the stored shape.
 */
function toDocument(data: Data): Record<string, unknown> {
  return { root: data.root ?? { props: {} }, content: data.content ?? [] };
}

/**
 * Puck keys every block by `props.id`. Drafts created by hand or by an AI import before the
 * API started assigning ids have none, which makes Puck's outline log "unique key" errors.
 * Fill them in on load; the next save persists them.
 */
function withBlockIds(document: unknown): Data {
  const doc = (document ?? EMPTY_PAGE_DOCUMENT) as Data;
  return {
    ...doc,
    content: (doc.content ?? []).map((block, index) =>
      block.props?.id
        ? block
        : { ...block, props: { ...block.props, id: `${block.type}-${Date.now().toString(36)}-${index}` } },
    ),
  };
}

export default function AdminPageEditor() {
  const { id } = useParams<{ id: string }>();
  const { error, setError, handleError } = useAdminError();
  const [page, setPage] = React.useState<AdminPageDto | null>(null);
  const [allPages, setAllPages] = React.useState<AdminPageDto[]>([]);
  const [groups, setGroups] = React.useState<AdminNavGroupDto[]>([]);
  const [issues, setIssues] = React.useState<PageValidationIssue[]>([]);
  const [busy, setBusy] = React.useState<"save" | "publish" | "unpublish" | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [showSettings, setShowSettings] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);

  /** Latest editor content, kept out of state so typing doesn't re-render the whole screen. */
  const latest = React.useRef<Data | null>(null);
  const savedJson = React.useRef("");

  React.useEffect(() => {
    let cancelled = false;
    Promise.all([adminApi.pages.get(id), adminApi.pages.list(), adminApi.navGroups.list()])
      .then(([loaded, pages, groupRows]) => {
        if (cancelled) return;
        const data = withBlockIds(loaded.draftData);
        latest.current = data;
        // Compare against what is stored, so ids added above show as an unsaved change.
        savedJson.current = JSON.stringify(toDocument((loaded.draftData ?? EMPTY_PAGE_DOCUMENT) as unknown as Data));
        setDirty(JSON.stringify(toDocument(data)) !== savedJson.current);
        setPage({ ...loaded, draftData: data as unknown as AdminPageDto["draftData"] });
        setAllPages(pages);
        setGroups(groupRows);
      })
      .catch((err: unknown) => {
        if (!cancelled) handleError(err, "Could not load this page.");
      });
    return () => {
      cancelled = true;
    };
  }, [id, handleError]);

  // A browser warning is the only guard against losing edits to a closed tab or a link click.
  React.useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const saveDraft = React.useCallback(async (): Promise<AdminPageDto | null> => {
    if (!latest.current) return null;
    setError(null);
    setIssues([]);
    const document = toDocument(latest.current);
    try {
      const saved = await adminApi.pages.update(id, { draftData: document });
      savedJson.current = JSON.stringify(document);
      setDirty(false);
      setPage(saved);
      return saved;
    } catch (err) {
      if (err instanceof ApiError && err.issues.length > 0) {
        setIssues(err.issues);
        setError(`${err.message} — the draft was not saved.`);
      } else {
        handleError(err, "Could not save the draft.");
      }
      return null;
    }
  }, [id, setError, handleError]);

  async function onSave() {
    setNotice(null);
    setBusy("save");
    const saved = await saveDraft();
    if (saved) setNotice("Draft saved.");
    setBusy(null);
  }

  async function onPublish() {
    setNotice(null);
    setBusy("publish");
    try {
      // Publish what is on screen, not what was last saved.
      if (!(await saveDraft())) return;
      setPage(await adminApi.pages.publish(id));
      setNotice("Published. The live page and menu are updated.");
    } catch (err) {
      handleError(err, "Could not publish.");
    } finally {
      setBusy(null);
    }
  }

  async function onUnpublish() {
    if (!window.confirm("Take this page off the site? It will 404 and leave the menu until republished.")) return;
    setNotice(null);
    setBusy("unpublish");
    try {
      setPage(await adminApi.pages.unpublish(id));
      setNotice("Unpublished. The draft is kept.");
    } catch (err) {
      handleError(err, "Could not unpublish.");
    } finally {
      setBusy(null);
    }
  }

  const live = page?.status === "published";

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-background text-foreground">
      <header className="flex flex-wrap items-center gap-3 border-b border-black/[.08] px-4 py-2 dark:border-white/[.145]">
        <Link href="/admin/pages" className="text-sm font-semibold text-muted-ink hover:text-brand-ink">
          ← Pages
        </Link>
        <h1 className="min-w-0 flex-1 truncate text-sm font-semibold">
          {page?.title ?? "Loading…"}
          {page && (
            <span className="ml-2 font-normal text-muted-ink">
              /{page.section}/{page.slug}
            </span>
          )}
        </h1>

        {page && (
          <span className="rounded bg-surface px-2 py-0.5 text-xs font-semibold text-muted-ink">
            {live ? (page.hasUnpublishedChanges || dirty ? "Live · unpublished edits" : "Live") : "Draft"}
            {dirty ? " · unsaved" : ""}
          </span>
        )}

        <Button variant="ghost" size="sm" onClick={() => setShowSettings((value) => !value)}>
          <Settings />
          Page settings
        </Button>
        {live && page && (
          <a
            href={`/${page.section}/${page.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-7 items-center gap-1 px-2 text-[0.8rem] font-semibold text-muted-ink hover:text-brand-ink"
          >
            <ExternalLink className="size-3.5" />
            View live
          </a>
        )}
        <Button variant="outline" size="sm" disabled={!page || busy !== null || !dirty} onClick={() => void onSave()}>
          {busy === "save" ? "Saving…" : "Save draft"}
        </Button>
        {live && (
          <Button variant="outline" size="sm" disabled={busy !== null} onClick={() => void onUnpublish()}>
            {busy === "unpublish" ? "Unpublishing…" : "Unpublish"}
          </Button>
        )}
        <Button size="sm" disabled={!page || busy !== null} onClick={() => void onPublish()}>
          {busy === "publish" ? "Publishing…" : live ? "Publish changes" : "Publish"}
        </Button>
      </header>

      {(error || notice || issues.length > 0) && (
        <div className="flex flex-col gap-1 border-b border-black/[.08] px-4 py-2 text-sm dark:border-white/[.145]">
          {error && (
            <p role="alert" className="text-brand-ink">
              {error}
            </p>
          )}
          {notice && !error && (
            <p role="status" className="text-muted-ink">
              {notice}
            </p>
          )}
          {issues.length > 0 && (
            <ul className="max-h-32 overflow-auto font-mono text-xs">
              {issues.map((issue, index) => (
                <li key={index}>
                  <span className="text-brand-ink">{issue.path}</span> — {issue.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {showSettings && page && (
        <div className="max-h-[45vh] overflow-auto border-b border-black/[.08] px-4 py-4 dark:border-white/[.145]">
          <SettingsForm
            page={page}
            pages={allPages}
            groups={groups}
            onSaved={(saved) => {
              setPage((current) => (current ? { ...saved, draftData: current.draftData } : saved));
              setNotice(
                saved.status === "published"
                  ? "Settings saved and applied to the live page."
                  : "Settings saved.",
              );
            }}
          />
        </div>
      )}

      <div className="min-h-0 flex-1">
        {page && (
          <Puck
            config={editorConfig}
            data={(page.draftData ?? EMPTY_PAGE_DOCUMENT) as unknown as Data}
            // Rendered in the page rather than an iframe so the site's Tailwind styles,
            // fonts and dark-mode tokens apply to the preview.
            iframe={{ enabled: false }}
            // Our header above owns Save / Publish; hide Puck's own.
            overrides={{ header: () => <></> }}
            onChange={(data) => {
              latest.current = data;
              setDirty(JSON.stringify(toDocument(data)) !== savedJson.current);
            }}
          />
        )}
      </div>
    </div>
  );
}
