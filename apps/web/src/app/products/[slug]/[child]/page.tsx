import type { Metadata } from "next";
import { CatalogRoute, catalogRouteMetadata } from "@/features/pages/catalog-route";

type Props = { params: Promise<{ slug: string; child: string }> };

/** /products/<parent>/<child>: a page nested under another page. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { child } = await params;
  return catalogRouteMetadata("products", child);
}

export default async function Page({ params }: Props) {
  const { slug, child } = await params;
  return <CatalogRoute section="products" slug={child} parent={slug} />;
}
