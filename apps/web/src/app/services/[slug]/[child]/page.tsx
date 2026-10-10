import type { Metadata } from "next";
import { CatalogRoute, catalogRouteMetadata } from "@/features/pages/catalog-route";

type Props = { params: Promise<{ slug: string; child: string }> };

/** /services/<parent>/<child>: a page nested under another page. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { child } = await params;
  return catalogRouteMetadata("services", child);
}

export default async function Page({ params }: Props) {
  const { slug, child } = await params;
  return <CatalogRoute section="services" slug={child} parent={slug} />;
}
