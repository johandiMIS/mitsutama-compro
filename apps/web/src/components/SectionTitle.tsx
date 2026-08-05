import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "text-[39px] font-semibold tracking-tight text-black dark:text-zinc-50",
        className,
      )}
    >
      {children}
    </h2>
  );
}
