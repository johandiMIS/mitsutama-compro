import type { Metadata } from "next";
import {
  CatalogRoute,
  catalogRouteMetadata,
  catalogRouteStaticParams,
} from "@/features/pages/catalog-route";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return catalogRouteStaticParams("solutions");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return catalogRouteMetadata("solutions", slug);
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <CatalogRoute section="solutions" slug={slug} />;
}
