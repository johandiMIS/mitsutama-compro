import type { Metadata } from "next";
import {
  CatalogDetailPage,
  catalogDetailMetadata,
  catalogStaticParams,
} from "@/components/CatalogPage";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return catalogStaticParams("products");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return catalogDetailMetadata("products", slug);
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <CatalogDetailPage section="products" slug={slug} />;
}
