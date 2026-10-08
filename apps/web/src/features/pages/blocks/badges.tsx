import type { BadgeId } from "@compro/types";

/**
 * Display names for the fixed badge set. The JSON can only name a badge; it can never
 * supply an image. Swap the chip for a logo in `public/badges/<id>.svg` once the artwork
 * is supplied — the id is already the key.
 */
const BADGE_LABELS: Record<BadgeId, string> = {
  ce: "CE",
  rohs2: "RoHS 2",
  "taiwan-excellence": "Taiwan Excellence",
};

export function Badge({ id }: { id: BadgeId }) {
  return (
    <span className="rounded border border-black/[.08] px-2 py-0.5 text-xs font-semibold text-foreground dark:border-white/[.145]">
      {BADGE_LABELS[id]}
    </span>
  );
}
