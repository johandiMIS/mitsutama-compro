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
    <article className="relative aspect-[4/3] w-full overflow-hidden border border-zinc-200 dark:border-zinc-800">
      <Image
        src={image}
        alt={title}
        fill
        className="object-cover"
        sizes="(min-width: 640px) 33vw, 100vw"
      />
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-white p-6 backdrop-blur">
        <p className="text-sm font-semibold text-primary">{category}</p>
        <h3 className="text-base font-semibold text-black">{title}</h3>
        <p className="text-sm text-zinc-500">{date}</p>
      </div>
    </article>
  );
}
