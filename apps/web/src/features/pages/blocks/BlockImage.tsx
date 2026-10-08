import Image from "next/image";
import type { PageImage } from "@compro/types";
import { cn } from "@/lib/utils";

/** Content image in a fixed-ratio frame. The host is allowlisted by next.config.ts. */
export function BlockImage({
  image,
  className,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  ratio = "aspect-[4/3]",
  fit = "object-cover",
}: {
  image: PageImage;
  className?: string;
  sizes?: string;
  ratio?: string;
  fit?: "object-cover" | "object-contain";
}) {
  return (
    <div className={cn("relative w-full overflow-hidden rounded-lg bg-surface", ratio, className)}>
      {/* A new block in the editor starts with an empty URL; next/image throws on that. */}
      {image.url ? <Image src={image.url} alt={image.alt} fill sizes={sizes} className={fit} /> : null}
    </div>
  );
}
