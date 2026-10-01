"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trash2, Upload } from "lucide-react";
import {
  HERO_IMAGE_EXTENSION,
  HERO_IMAGE_MAX_BYTES,
  HERO_IMAGE_MIME,
  type HeroImageDto,
} from "@compro/types";
import { Button } from "@/components/ui/button";
import { ApiError, adminApi, uploadToS3 } from "@/lib/admin-api";
import { CONVERTIBLE_IMAGE_TYPES, prepareWebp } from "@/lib/image-to-webp";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminHeroPage() {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [images, setImages] = React.useState<HeroImageDto[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  // A 401 from any call means the session cookie is missing or expired.
  const handleError = React.useCallback(
    (err: unknown, fallback: string) => {
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/admin/login");
        return;
      }
      setError(err instanceof ApiError ? err.message : fallback);
    },
    [router],
  );

  const refresh = React.useCallback(async () => {
    try {
      setImages(await adminApi.heroImages.list());
    } catch (err) {
      handleError(err, "Could not reach the API. Is it running on port 3007?");
      setImages([]);
    }
  }, [handleError]);

  // Initial load. Written with explicit promise callbacks rather than `void refresh()`
  // so the state updates happen in a callback, not synchronously in the effect body —
  // and so an unmount mid-flight cancels them instead of setting state on a dead
  // component. Subsequent reloads go through `refresh` from event handlers.
  React.useEffect(() => {
    let cancelled = false;

    adminApi.heroImages
      .list()
      .then((rows) => {
        if (!cancelled) setImages(rows);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        handleError(err, "Could not reach the API. Is it running on port 3007?");
        setImages([]);
      });

    return () => {
      cancelled = true;
    };
  }, [handleError]);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    setNotice(null);
    setUploading(true);

    let added = 0;
    let converted = 0;
    try {
      for (const original of Array.from(files)) {
        // JPG/PNG are converted (and anything oversized downscaled) to WebP here, in
        // the browser. The API still only ever receives WebP, and still verifies the
        // stored bytes, so this changes nothing about what the server trusts.
        setNotice(`Preparing "${original.name}"…`);
        const prepared = await prepareWebp(original).catch((err: unknown) => {
          throw new ApiError(
            err instanceof Error ? err.message : `"${original.name}" could not be converted.`,
            400,
          );
        });
        const file = prepared.file;
        if (prepared.converted) converted += 1;

        // Checked again server-side; this only fails fast before a pointless round trip.
        if (file.size > HERO_IMAGE_MAX_BYTES) {
          throw new ApiError(
            `"${original.name}" is ${formatBytes(file.size)} even after conversion; the limit is ${formatBytes(HERO_IMAGE_MAX_BYTES)}.`,
            400,
          );
        }
        setNotice(`Uploading "${original.name}"…`);

        const presigned = await adminApi.heroImages.presign({
          filename: file.name,
          contentType: HERO_IMAGE_MIME,
          sizeBytes: file.size,
        });

        await uploadToS3(presigned, file);

        await adminApi.heroImages.commit({
          key: presigned.key,
          alt: "",
          width: prepared.width,
          height: prepared.height,
        });
        added += 1;
      }

      setNotice(
        `Added ${added} image${added === 1 ? "" : "s"} to the hero carousel` +
          (converted ? ` (${converted} converted to WebP).` : "."),
      );
    } catch (err) {
      setNotice(null);
      handleError(err, "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
      await refresh();
    }
  }

  async function handleDelete(image: HeroImageDto) {
    setError(null);
    setNotice(null);
    setDeletingId(image.id);
    try {
      await adminApi.heroImages.remove(image.id);
      setNotice("Image removed.");
      await refresh();
    } catch (err) {
      handleError(err, "Could not remove that image.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleLogout() {
    try {
      await adminApi.session.logout();
    } finally {
      router.replace("/admin/login");
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Hero carousel images
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-ink">
            Images shown in the homepage hero. JPG, PNG or WebP — JPG and PNG are
            converted to WebP and large images resized before upload, so they stay
            fast to load. Uploads go straight to S3.
          </p>
        </div>
        <Button variant="ghost" size="lg" onClick={handleLogout}>
          Sign out
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        <input
          ref={inputRef}
          type="file"
          accept={[...CONVERTIBLE_IMAGE_TYPES, ".jpg", ".jpeg", ".png", HERO_IMAGE_EXTENSION].join(",")}
          multiple
          className="hidden"
          onChange={(event) => void handleFiles(event.target.files)}
        />
        <div>
          <Button
            size="lg"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading…" : "Add images"}
          </Button>
        </div>

        {error && (
          <p role="alert" className="text-sm text-brand-ink">
            {error}
          </p>
        )}
        {notice && !error && (
          <p role="status" className="text-sm text-muted-ink">
            {notice}
          </p>
        )}
      </div>

      {images === null ? (
        <p className="text-sm text-muted-ink">Loading…</p>
      ) : images.length === 0 ? (
        <div className="rounded-md border border-dashed border-black/[.08] p-10 text-center dark:border-white/[.145]">
          <p className="text-sm text-muted-ink">
            No hero images yet. Add a JPG, PNG or WebP image to get started.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <li
              key={image.id}
              className="flex flex-col gap-3 rounded-md border border-black/[.08] p-3 dark:border-white/[.145]"
            >
              {/* always-light: uploaded artwork of unknown ink, so it keeps a fixed
                  white backdrop rather than sitting on the dark admin page. */}
              <div className="always-light relative aspect-[3/2] w-full overflow-hidden rounded">
                <Image
                  src={image.url}
                  alt={image.alt || ""}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  unoptimized
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted-ink">
                  {image.width && image.height
                    ? `${image.width}×${image.height} · `
                    : ""}
                  {formatBytes(image.sizeBytes)}
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={deletingId === image.id}
                  onClick={() => void handleDelete(image)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {deletingId === image.id ? "Removing…" : "Remove"}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
