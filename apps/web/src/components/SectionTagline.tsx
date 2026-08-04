import type { ReactNode } from "react";

export function SectionTagline({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-primary">
      <span aria-hidden="true" className="h-px w-4 bg-primary" />
      <p>{children}</p>
    </div>
  );
}
