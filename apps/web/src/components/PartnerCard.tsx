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
      {/* `fill` rather than width/height props: the logos are all 6:1, but the box they sit in is
          whatever a third of the grid happens to be, so a declared ratio would always disagree with
          the rendered one. object-contain letterboxes each logo inside the 64px-tall strip. */}
      <div className="relative h-16 w-full">
        <Image
          src={logo}
          alt={`${name} logo`}
          fill
          className="object-contain object-left"
          sizes="(min-width: 640px) 33vw, 100vw"
        />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold text-black dark:text-zinc-50">{name}</h3>
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">{category}</p>
      </div>
    </div>
  );
}
