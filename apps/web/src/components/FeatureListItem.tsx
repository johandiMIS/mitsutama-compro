import type { ReactNode } from "react";

export function FeatureListItem({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  /** Omit for single-line entries — the row then hugs its content instead of holding
   * the taller card height that keeps described items aligned. */
  description?: string;
}) {
  return (
    <div
      className={
        description
          ? "flex min-h-32 items-start gap-4 bg-white/5 p-4"
          : "flex items-center gap-4 bg-white/5 p-4"
      }
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-primary/10">
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        {description && <p className="text-sm leading-6 text-zinc-400">{description}</p>}
      </div>
    </div>
  );
}
