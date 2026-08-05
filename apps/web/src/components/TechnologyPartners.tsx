import { PartnerCard } from "@/components/PartnerCard";
import { SectionContainer } from "@/components/SectionContainer";
import { SectionTagline } from "@/components/SectionTagline";
import { SectionTitle } from "@/components/SectionTitle";

// Dummy data — swap `logo` for a real image once each partner's logo is available.
export const TECHNOLOGY_PARTNERS = [
  {
    name: "Chroma",
    category: "Power Electronics & Energy System",
  },
  {
    name: "Audio Precision",
    category: "Audio & Electroacoustic Testing",
  },
  {
    name: "IMC Axiometrix",
    category: "Data Acquisition & Dynamic Testing",
  },
  {
    name: "GRAS Axiometrix",
    category: "Acoustic & NVH Testing",
  },
  {
    name: "Lisun Group",
    category: "Lighting & Electrical Testing",
  },
];

export function TechnologyPartners() {
  return (
    <section id="technology-partners" className="w-full scroll-mt-16 py-8">
      <SectionContainer className="grid w-full grid-cols-1 gap-6 text-left sm:grid-cols-3">
        <div className="flex flex-col items-start justify-start gap-4">
          <SectionTagline>TECHNOLOGY PARTNER</SectionTagline>
          <SectionTitle>A portfolio of global principals</SectionTitle>
        </div>

        {TECHNOLOGY_PARTNERS.map((partner) => (
          <PartnerCard key={partner.name} name={partner.name} category={partner.category} />
        ))}
      </SectionContainer>
    </section>
  );
}
