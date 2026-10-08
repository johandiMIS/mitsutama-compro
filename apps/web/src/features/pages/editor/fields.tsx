"use client";

import * as React from "react";
import type { CustomField } from "@puckeditor/core";
import { BADGE_IDS, HERO_IMAGE_MIME, MEDIA_IMAGE_MAX_BYTES, type BadgeId, type PageImage } from "@compro/types";
import { adminApi, uploadToS3 } from "@/lib/admin-api";
import { CONVERTIBLE_IMAGE_TYPES, prepareWebp } from "@/lib/image-to-webp";

/**
 * Editor-only custom fields. Puck's built-in array field holds objects, but the page
 * schemas store plain string arrays and `{ url, alt }` images, so these fields read and
 * write exactly the stored shapes — what the editor saves is what the API validates.
 *
 * Puck's panel is light-themed whatever the site theme is, so these pin light ink with
 * `always-light` instead of using theme tokens.
 */

const INPUT =
  "w-full rounded border border-black/20 bg-white px-2 py-1.5 text-sm text-black outline-none focus:border-black/60";
const SMALL_BUTTON =
  "rounded border border-black/20 bg-white px-2 py-1 text-xs font-semibold text-black hover:bg-black/5 disabled:opacity-50";

function Label({ children }: { children: React.ReactNode }) {
  return <span className="mb-1 block text-xs font-semibold text-black/70">{children}</span>;
}

// ---- image ----------------------------------------------------------------

/** Converts to WebP in the browser, uploads straight to S3, and returns the public URL. */
async function uploadImage(original: File): Promise<string> {
  const prepared = await prepareWebp(original);
  if (prepared.file.size > MEDIA_IMAGE_MAX_BYTES) {
    throw new Error(`Still ${(prepared.file.size / 1048576).toFixed(1)} MB after conversion; the limit is 5 MB.`);
  }
  const presigned = await adminApi.media.presign({
    filename: prepared.file.name,
    contentType: HERO_IMAGE_MIME,
    sizeBytes: prepared.file.size,
  });
  await uploadToS3(presigned, prepared.file);
  const media = await adminApi.media.commit({
    key: presigned.key,
    width: prepared.width,
    height: prepared.height,
  });
  return media.url;
}

function ImageInput({
  value,
  onChange,
}: {
  value: PageImage | undefined;
  onChange: (value: PageImage | undefined) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const url = value?.url ?? "";

  async function pick(file: File | undefined) {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const uploaded = await uploadImage(file);
      onChange({ url: uploaded, alt: value?.alt ?? "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="always-light flex flex-col gap-2">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element -- editor thumbnail of an uploaded file
        <img src={url} alt="" className="max-h-32 w-full rounded border border-black/10 bg-black/5 object-contain" />
      ) : (
        <p className="rounded border border-dashed border-black/20 p-3 text-center text-xs text-black/60">
          No image
        </p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={[...CONVERTIBLE_IMAGE_TYPES, ".jpg", ".jpeg", ".png", ".webp"].join(",")}
        className="hidden"
        onChange={(event) => void pick(event.target.files?.[0])}
      />
      <div className="flex gap-2">
        <button type="button" className={SMALL_BUTTON} disabled={busy} onClick={() => inputRef.current?.click()}>
          {busy ? "Uploading…" : url ? "Replace image" : "Upload image"}
        </button>
        {url && (
          <button type="button" className={SMALL_BUTTON} disabled={busy} onClick={() => onChange(undefined)}>
            Remove
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-xs text-red-700">
          {error}
        </p>
      )}
      {url && (
        <label>
          <Label>Alt text (leave empty if decorative)</Label>
          <input
            className={INPUT}
            value={value?.alt ?? ""}
            maxLength={300}
            onChange={(event) => onChange({ url, alt: event.target.value })}
          />
        </label>
      )}
    </div>
  );
}

export const imageField = (label = "Image"): CustomField<PageImage | undefined> => ({
  type: "custom",
  label,
  render: ({ value, onChange }) => <ImageInput value={value} onChange={onChange} />,
});

// ---- string list ----------------------------------------------------------

function StringListInput({
  value,
  onChange,
  multiline,
  addLabel,
}: {
  value: string[] | undefined;
  onChange: (value: string[]) => void;
  multiline: boolean;
  addLabel: string;
}) {
  const items = value ?? [];
  const set = (index: number, text: string) => onChange(items.map((item, i) => (i === index ? text : item)));
  return (
    <div className="always-light flex flex-col gap-2">
      {items.map((item, index) => (
        <div key={index} className="flex items-start gap-2">
          {multiline ? (
            <textarea className={INPUT} rows={3} value={item} onChange={(event) => set(index, event.target.value)} />
          ) : (
            <input className={INPUT} value={item} onChange={(event) => set(index, event.target.value)} />
          )}
          <button
            type="button"
            className={SMALL_BUTTON}
            aria-label="Remove"
            onClick={() => onChange(items.filter((_, i) => i !== index))}
          >
            ✕
          </button>
        </div>
      ))}
      <div>
        <button type="button" className={SMALL_BUTTON} onClick={() => onChange([...items, ""])}>
          + {addLabel}
        </button>
      </div>
    </div>
  );
}

export const stringListField = (
  label: string,
  addLabel: string,
  multiline = false,
): CustomField<string[] | undefined> => ({
  type: "custom",
  label,
  render: ({ value, onChange }) => (
    <StringListInput value={value} onChange={onChange} multiline={multiline} addLabel={addLabel} />
  ),
});

// ---- badges ---------------------------------------------------------------

const BADGE_LABELS: Record<BadgeId, string> = {
  ce: "CE",
  rohs2: "RoHS 2",
  "taiwan-excellence": "Taiwan Excellence",
};

export const badgesField = (): CustomField<BadgeId[] | undefined> => ({
  type: "custom",
  label: "Certifications",
  render: ({ value, onChange }) => {
    const selected = value ?? [];
    return (
      <div className="always-light flex flex-wrap gap-3">
        {BADGE_IDS.map((id) => (
          <label key={id} className="flex items-center gap-1.5 text-sm text-black">
            <input
              type="checkbox"
              checked={selected.includes(id)}
              onChange={(event) =>
                onChange(event.target.checked ? [...selected, id] : selected.filter((badge) => badge !== id))
              }
            />
            {BADGE_LABELS[id]}
          </label>
        ))}
      </div>
    );
  },
});
