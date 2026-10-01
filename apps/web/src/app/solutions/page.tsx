import { CatalogIndexPage, catalogIndexMetadata } from "@/components/CatalogPage";

export const metadata = catalogIndexMetadata("solutions");

export default function Page() {
  return <CatalogIndexPage section="solutions" />;
}
