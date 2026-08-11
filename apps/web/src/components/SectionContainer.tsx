import type { ElementType, ReactNode } from "react";

export function SectionContainer({
  as: Tag = "div",
  className = "",
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag className={`mx-auto w-full max-w-[1920px] px-6 sm:px-10 md:px-20 ${className}`}>
      {children}
    </Tag>
  );
}
