import { HERO_IMAGE_EXTENSION, HERO_IMAGE_MIME } from "@compro/types";

/** Formats the admin picker accepts; anything but WebP is converted before upload. */
export const CONVERTIBLE_IMAGE_TYPES = ["image/jpeg", "image/png", HERO_IMAGE_MIME];

/**
 * Longest edge kept after conversion. Matches next/image's largest default device size
 * (3840), so nothing larger could ever be served. The hero draws a landscape image wider
 * than its slot (it covers a square box): a 3280×2592 image is ~2480 device px wide on a
 * 3440×1440 ultrawide, and a 16:9 one ~3490px, so a lower cap would soften it there.
 */
const MAX_EDGE = 3840;

/** WebP quality (0–1). 0.82 is visually indistinguishable from the source for photos. */
const QUALITY = 0.82;

/** Refuse to decode anything bigger than this, so a huge file can't stall the tab. */
const MAX_INPUT_BYTES = 30 * 1024 * 1024;

export interface PreparedImage {
  file: File;
  width: number;
  height: number;
  /** True when the bytes were re-encoded or resized, false when uploaded as-is. */
  converted: boolean;
}

/**
 * Turns a JPEG, PNG or WebP into an upload-ready WebP, downscaled to MAX_EDGE.
 *
 * A WebP that is already small enough is passed through untouched, since re-encoding
 * would only lose quality. Runs entirely in the browser; the API still verifies the
 * stored bytes are a real WebP, so this is a convenience, not a security boundary.
 */
export async function prepareWebp(file: File): Promise<PreparedImage> {
  if (!CONVERTIBLE_IMAGE_TYPES.includes(file.type)) {
    throw new Error(`"${file.name}" is not a JPG, PNG or WebP image.`);
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error(`"${file.name}" is too large to convert (over 30 MB).`);
  }

  let bitmap: ImageBitmap;
  try {
    // `from-image` applies the EXIF orientation, so phone photos don't upload sideways.
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error(`"${file.name}" could not be read as an image.`);
  }

  try {
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    if (file.type === HERO_IMAGE_MIME && scale === 1) {
      return { file, width, height, converted: false };
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is not available in this browser.");
    context.imageSmoothingQuality = "high";
    context.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, HERO_IMAGE_MIME, QUALITY),
    );
    // Browsers without a WebP encoder silently fall back to PNG instead of failing.
    if (!blob || blob.type !== HERO_IMAGE_MIME) {
      throw new Error(
        "This browser cannot convert images to WebP. Use Chrome, Edge or Firefox, or upload a .webp file.",
      );
    }

    const name = file.name.replace(/\.[^.]+$/, "") + HERO_IMAGE_EXTENSION;
    return {
      file: new File([blob], name, { type: HERO_IMAGE_MIME }),
      width,
      height,
      converted: true,
    };
  } finally {
    bitmap.close();
  }
}
