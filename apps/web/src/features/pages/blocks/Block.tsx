import type { ReactNode } from "react";
import { SectionContainer } from "@/components/SectionContainer";
import { cn } from "@/lib/utils";

/** Common frame: page-width container, vertical rhythm, and the block's id for deep links. */
export function Block({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="w-full scroll-mt-20">
      <SectionContainer className={cn("py-16", className)}>{children}</SectionContainer>
    </section>
  );
}
