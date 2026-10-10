import type { Metadata } from "next";
import { CatalogRoute, catalogRouteMetadata } from "@/features/pages/catalog-route";

type Props = { params: Promise<{ slug: string; child: string }> };

/** /solutions/<parent>/<child>: a page nested under another page. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { child } = await params;
  return catalogRouteMetadata("solutions", child);
}

export default async function Page({ params }: Props) {
  const { slug, child } = await params;
  return <CatalogRoute section="solutions" slug={child} parent={slug} />;
}
