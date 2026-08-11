import Image from "next/image";

export function PartnerCard({
  name,
  category,
  logo,
}: {
  name: string;
  category: string;
  logo: string;
}) {
  return (
    <div className="flex flex-col gap-4 border border-black/[.08] p-4 dark:border-white/[.145]">
      <div className="flex h-16 w-full items-center justify-start">
        <Image
          src={logo}
          alt={`${name} logo`}
          width={160}
          height={64}
          className="h-full w-auto max-w-full object-contain object-left"
        />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold text-black dark:text-zinc-50">{name}</h3>
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">{category}</p>
      </div>
    </div>
  );
}
