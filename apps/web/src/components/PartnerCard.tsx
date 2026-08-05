export function PartnerCard({
  name,
  category,
}: {
  name: string;
  category: string;
}) {
  return (
    <div className="flex flex-col gap-4 border border-black/[.08] p-6 dark:border-white/[.145]">
      <div className="flex h-16 w-32 items-center justify-center bg-white px-4">
        <span className="text-sm font-semibold text-zinc-800">{name}</span>
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold text-black dark:text-zinc-50">{name}</h3>
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">{category}</p>
      </div>
    </div>
  );
}
