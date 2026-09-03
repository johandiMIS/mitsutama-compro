import type { ReactNode } from "react";

const VARIANT_CLASSES = {
  primary: "text-brand-ink",
  white: "text-white",
};

export function SectionTagline({
  children,
  variant = "primary",
}: {
  children: ReactNode;
  variant?: keyof typeof VARIANT_CLASSES;
}) {
  return (
    <div className={`flex items-center gap-2 text-xs ${VARIANT_CLASSES[variant]}`}>
      <span aria-hidden="true" className="h-px w-4 bg-current" />
      <p>{children}</p>
    </div>
  );
}
