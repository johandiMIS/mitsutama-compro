import { ContactCta } from "@/components/ContactCta";

/** The page template already ends with a ContactCta; this lets an editor place one mid-page. */
export function ContactCtaBlock({ id }: { id?: string }) {
  return (
    <div id={id} className="w-full">
      <ContactCta />
    </div>
  );
}
