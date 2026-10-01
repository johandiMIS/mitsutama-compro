import { CatalogIndexPage, catalogIndexMetadata } from "@/components/CatalogPage";

export const metadata = catalogIndexMetadata("products");

export default function Page() {
  return <CatalogIndexPage section="products" />;
}
