"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Copy, Upload } from "lucide-react";
import type { AdminPageDto, PageValidationIssue } from "@compro/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { ApiError, adminApi } from "@/lib/admin-api";
import { useAdminError } from "@/lib/use-admin-error";
import { cn } from "@/lib/utils";

const ENVELOPE_EXAMPLE = `{
  "section": "products",
  "slug": "ac-power-source-61800",
  "title": "AC Power Source 61800",
  "parent": "power-electronic-test-and-equipment",
  "seoDescription": "…",
  "data": { "root": { "props": {} }, "content": [ { "type": "ProductIntro", "props": { "title": "…" } } ] }
}`;

/** The prompt an editor pastes into an AI assistant, followed by the live JSON Schema. */
function buildAiPrompt(schema: Record<string, unknown>): string {
  return [
    "Write a web page for a company site as JSON. Output JSON only, no commentary.",
    "",
    "Use ONLY the block types in the schema below, and no other properties. Do not invent image",
    "URLs: omit `image` unless I give you an uploaded URL. `badges` may only be ce, rohs2 or",
    "taiwan-excellence. Links must start with / or https://. Text fields use plain text; RichText",
    "`body` may use Markdown paragraphs, - lists, **bold** and [links](/path).",
    "",
    "Wrap the page in this envelope. `parent` is the slug of the page it sits under (or use",
    '`"group": "<menu group title>"` for a top-level page). `data` must match the schema.',
    "",
    ENVELOPE_EXAMPLE,
    "",
    "JSON Schema for `data`:",
    JSON.stringify(schema, null, 2),
  ].join("\n");
}

export default function AdminImportPage() {
  const { error, setError, handleError } = useAdminError();
  const [text, setText] = React.useState("");
  const [issues, setIssues] = React.useState<PageValidationIssue[]>([]);
  const [imported, setImported] = React.useState<AdminPageDto | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  async function copySchema() {
    setError(null);
    try {
      const schema = await adminApi.pages.schema();
      await navigator.clipboard.writeText(buildAiPrompt(schema));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      handleError(err, "Could not copy the schema.");
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIssues([]);
    setImported(null);

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      setError(`That is not valid JSON: ${err instanceof Error ? err.message : "parse error"}`);
      return;
    }

    setBusy(true);
    try {
      setImported(await adminApi.pages.import(parsed as Parameters<typeof adminApi.pages.import>[0]));
    } catch (err) {
      if (err instanceof ApiError && err.issues.length > 0) {
        setIssues(err.issues);
        setError(`${err.message} — nothing was saved.`);
      } else {
        handleError(err, "Import failed.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function loadFile(file: File | undefined) {
    if (!file) return;
    setText(await file.text());
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link href="/admin/pages" className="text-sm font-semibold text-muted-ink hover:text-brand-ink">
          ← Pages
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Import a page from JSON</h1>
        <p className="text-sm leading-6 text-muted-ink">
          Have an AI write the page, paste its JSON here, and it is checked against the same rules as
          the editor. It is saved as a <strong>draft</strong> — it never goes live until you publish it
          from the editor. Importing an existing <code>section</code> + <code>slug</code> replaces that
          page&apos;s draft.
        </p>
      </div>

      <div>
        <Button variant="outline" size="lg" onClick={() => void copySchema()}>
          {copied ? <Check /> : <Copy />}
          {copied ? "Copied — paste it into your AI chat" : "Copy prompt and schema for AI"}
        </Button>
      </div>

      <form onSubmit={(event) => void submit(event)} className="flex flex-col gap-3">
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          spellCheck={false}
          rows={18}
          placeholder={ENVELOPE_EXAMPLE}
          aria-label="Page JSON"
          className="rounded-md border border-black/[.08] bg-background p-3 font-mono text-xs leading-5 outline-none focus:border-brand-ink dark:border-white/[.145]"
        />
        <div className="flex flex-wrap gap-2">
          <Button type="submit" size="lg" disabled={busy || !text.trim()}>
            {busy ? "Checking…" : "Validate and save as draft"}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => void loadFile(event.target.files?.[0])}
          />
          <Button type="button" variant="ghost" size="lg" onClick={() => fileRef.current?.click()}>
            <Upload />
            Load a .json file
          </Button>
        </div>
      </form>

      {error && (
        <p role="alert" className="text-sm text-brand-ink">
          {error}
        </p>
      )}

      {issues.length > 0 && (
        <ul className="flex flex-col gap-1 rounded-md border border-black/[.08] p-3 font-mono text-xs dark:border-white/[.145]">
          {issues.map((issue, index) => (
            <li key={index}>
              <span className="text-brand-ink">{issue.path}</span> — {issue.message}
            </li>
          ))}
        </ul>
      )}

      {imported && (
        <div role="status" className="flex flex-col gap-3 rounded-md border border-black/[.08] p-4 dark:border-white/[.145]">
          <p className="text-sm">
            Saved <strong>{imported.title}</strong> (<code>/{imported.section}/{imported.slug}</code>) as a
            draft.
          </p>
          <div>
            <Link
              href={`/admin/pages/${imported.id}`}
              className={cn(buttonVariants({ size: "lg" }))}
            >
              Review in the editor
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
