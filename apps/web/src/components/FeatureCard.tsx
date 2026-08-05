import type { ReactNode } from "react";

export function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex h-full flex-col gap-4 border border-black/[.08] p-6 text-left dark:border-white/[.145]">
      <div className="flex h-12 w-12 items-center justify-center bg-primary/10">
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold text-black dark:text-zinc-50">{title}</h3>
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">{description}</p>
      </div>
    </div>
  );
}
