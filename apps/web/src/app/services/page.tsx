import { CatalogIndexPage, catalogIndexMetadata } from "@/components/CatalogPage";

export const metadata = catalogIndexMetadata("services");

export default function Page() {
  return <CatalogIndexPage section="services" />;
}
