import type { ReactNode } from "react";

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-[39px] font-semibold tracking-tight text-black dark:text-zinc-50">
      {children}
    </h2>
  );
}
