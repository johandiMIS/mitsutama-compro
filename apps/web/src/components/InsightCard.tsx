import Image from "next/image";

export function InsightCard({
  image,
  category,
  title,
  date,
}: {
  image: string;
  category: string;
  title: string;
  date: string;
}) {
  return (
    <article className="relative aspect-[3/4] w-full overflow-hidden border border-zinc-200 dark:border-zinc-800 sm:aspect-[4/3]">
      <Image
        src={image}
        alt={title}
        fill
        className="object-cover"
        sizes="(min-width: 640px) 33vw, 100vw"
      />
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-background p-4 backdrop-blur sm:p-6">
        <p className="text-sm font-semibold text-brand-ink">{category}</p>
        <h3 className="line-clamp-2 text-base font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-ink">{date}</p>
      </div>
    </article>
  );
}
