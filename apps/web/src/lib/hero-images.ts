import type { HeroImageDto } from "@compro/types";

export interface HeroSlide {
  src: string;
  alt: string;
  /** Intrinsic size, when known; used to request a large enough variant (see HeroCarousel). */
  width: number | null;
  height: number | null;
}

/** Shipped with the site, so the hero is never empty when the API is down or unpopulated. */
const FALLBACK_SLIDES: HeroSlide[] = [1, 2, 3, 4, 5, 6].map((n) => ({
  src: `/hero/hero-${n}.webp`,
  alt: "",
  width: 3280,
  height: 2592,
}));

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3007"
).replace(/\/+$/, "");

const IMAGE_HOST = process.env.NEXT_PUBLIC_IMAGE_HOST?.trim();

/** How long a fetched list is reused before Next refetches it in the background. */
const REVALIDATE_SECONDS = 60;

/**
 * next/image throws at render for any host not in `images.remotePatterns`, which
 * `next.config.ts` builds from NEXT_PUBLIC_IMAGE_HOST. Dropping mismatches here turns a
 * misconfigured env into a fallback to the static set rather than a broken homepage.
 */
function isAllowedHost(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname === IMAGE_HOST;
  } catch {
    return false;
  }
}

/**
 * Server-only. Reads the admin-managed set from `GET /hero-images`, falling back to the
 * bundled images when the API is unreachable, errors, or has nothing usable.
 */
export async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const response = await fetch(`${API_BASE}/hero-images`, {
      next: { revalidate: REVALIDATE_SECONDS },
      // Don't hold the homepage render hostage to a hung API.
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    const images = (await response.json()) as HeroImageDto[];
    const slides = images
      .filter((image) => isAllowedHost(image.url))
      .map((image) => ({
        src: image.url,
        alt: image.alt,
        width: image.width,
        height: image.height,
      }));

    if (images.length > 0 && slides.length < images.length) {
      console.warn(
        `[hero] ${images.length - slides.length} image(s) skipped: host does not match NEXT_PUBLIC_IMAGE_HOST (${IMAGE_HOST || "unset"}).`,
      );
    }
    return slides.length > 0 ? slides : FALLBACK_SLIDES;
  } catch (error) {
    // One line, not a stack trace: this is routine during `next build`, when the API
    // usually isn't running. The page is still built with `revalidate`, so it picks up
    // the API's images on its own within REVALIDATE_SECONDS of the API coming up.
    const cause = (error as { cause?: { code?: string } }).cause?.code;
    const reason = cause ?? (error instanceof Error ? error.message : String(error));
    const duringBuild = process.env.NEXT_PHASE === "phase-production-build";
    console.warn(
      `[hero] ${API_BASE}/hero-images unavailable (${reason}); using bundled images.` +
        (duringBuild
          ? ` Expected during build — the page refreshes within ${REVALIDATE_SECONDS}s once the API is up.`
          : ""),
    );
    return FALLBACK_SLIDES;
  }
}
