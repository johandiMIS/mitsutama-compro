import Link from "next/link";
import type { z } from "zod";
import type { CategorizedProductsSchema } from "@compro/types";
import { slugify } from "@/components/nav/nav-links";
import { Block } from "./Block";
import { Badge } from "./badges";
import { BlockImage } from "./BlockImage";
import { BlockHeading } from "./Heading";
import { CategorySidebar } from "./CategorySidebar";

type Props = z.output<typeof CategorizedProductsSchema>;
type Product = Props["categories"][number]["products"][number];

/** Stable, unique DOM ids from category names: "AC Source" -> "ac-source", repeats get -2, -3. */
function categoryIds(names: string[]): string[] {
  const seen = new Map<string, number>();
  return names.map((name) => {
    const base = slugify(name) || "category";
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    return count === 1 ? base : `${base}-${count}`;
  });
}

function ProductCard({ product }: { product: Product }) {
  const body = (
    <>
      {product.image ? (
        <BlockImage
          image={product.image}
          ratio="aspect-[4/3]"
          fit="object-contain"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="rounded-b-none"
        />
      ) : null}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          {product.model ? (
            <p className="text-xs font-semibold tracking-wide text-brand-ink">{product.model}</p>
          ) : null}
          <h4 className="text-lg font-semibold text-foreground">{product.name}</h4>
        </div>
        {product.badges.length > 0 ? (
          <ul className="flex flex-wrap gap-2" aria-label="Certifications">
            {product.badges.map((badge) => (
              <li key={badge}>
                <Badge id={badge} />
              </li>
            ))}
          </ul>
        ) : null}
        {product.bullets.length > 0 ? (
          <ul className="list-disc space-y-1 pl-4 text-sm leading-relaxed text-muted-ink">
            {product.bullets.map((bullet, index) => (
              <li key={index}>{bullet}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </>
  );

  const frame =
    "flex h-full flex-col overflow-hidden rounded-lg border border-black/[.08] bg-background dark:border-white/[.145]";

  return product.href ? (
    <Link href={product.href} className={`${frame} transition-shadow hover:shadow-lg`}>
      {body}
    </Link>
  ) : (
    <div className={frame}>{body}</div>
  );
}

export function CategorizedProducts({ id, tagline, title, intro, categories }: Props) {
  const ids = categoryIds(categories.map((category) => category.name));
  const sidebar = categories.map((category, index) => ({ id: ids[index], name: category.name }));

  return (
    <Block id={id} className="flex flex-col gap-10">
      <BlockHeading tagline={tagline} title={title} intro={intro} />
      {/* Block flow below `lg` (grid from `lg`), so the mobile chip bar's containing block is
          this whole wrapper and it stays pinned while the categories scroll past. */}
      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[260px_1fr] lg:gap-12">
        <CategorySidebar categories={sidebar} />
        <div className="flex flex-col gap-14">
          {categories.map((category, index) => (
            <section key={ids[index]} id={ids[index]} className="scroll-mt-32">
              <h3 className="mb-6 text-2xl font-semibold tracking-tight text-foreground">
                {category.name}
              </h3>
              <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {category.products.map((product, productIndex) => (
                  <li key={productIndex}>
                    <ProductCard product={product} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </Block>
  );
}
