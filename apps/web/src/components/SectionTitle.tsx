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
        "text-[39px] font-semibold tracking-tight text-foreground",
        className,
      )}
    >
      {children}
    </h2>
  );
}
