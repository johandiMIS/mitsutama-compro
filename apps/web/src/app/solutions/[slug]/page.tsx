import type { Metadata } from "next";
import {
  CatalogDetailPage,
  catalogDetailMetadata,
  catalogStaticParams,
} from "@/components/CatalogPage";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return catalogStaticParams("solutions");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return catalogDetailMetadata("solutions", slug);
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <CatalogDetailPage section="solutions" slug={slug} />;
}
