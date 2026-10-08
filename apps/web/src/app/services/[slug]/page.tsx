import type { Metadata } from "next";
import {
  CatalogRoute,
  catalogRouteMetadata,
  catalogRouteStaticParams,
} from "@/features/pages/catalog-route";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return catalogRouteStaticParams("services");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return catalogRouteMetadata("services", slug);
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <CatalogRoute section="services" slug={slug} />;
}
