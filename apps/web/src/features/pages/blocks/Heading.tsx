import { SectionTagline } from "@/components/SectionTagline";
import { SectionTitle } from "@/components/SectionTitle";

/** Tagline + title + optional intro, shared by every block that opens a section. */
export function BlockHeading({
  tagline,
  title,
  intro,
}: {
  tagline?: string;
  title: string;
  intro?: string;
}) {
  return (
    <div className="flex flex-col items-start gap-4">
      {tagline ? <SectionTagline>{tagline}</SectionTagline> : null}
      <SectionTitle>{title}</SectionTitle>
      {intro ? <p className="max-w-3xl text-base leading-relaxed text-muted-ink">{intro}</p> : null}
    </div>
  );
}
