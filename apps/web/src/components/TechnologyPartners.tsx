import { PartnerCard } from "@/components/PartnerCard";
import { SectionContainer } from "@/components/SectionContainer";
import { SectionTagline } from "@/components/SectionTagline";
import { SectionTitle } from "@/components/SectionTitle";

export const TECHNOLOGY_PARTNERS = [
  {
    name: "Chroma",
    category: "Power Electronics & Energy System",
    logo: "/tech-partner/chroma.webp",
  },
  {
    name: "Audio Precision",
    category: "Audio & Electroacoustic Testing",
    logo: "/tech-partner/ap.webp",
  },
  {
    name: "IMC Axiometrix",
    category: "Data Acquisition & Dynamic Testing",
    logo: "/tech-partner/imc.webp",
  },
  {
    name: "GRAS Axiometrix",
    category: "Acoustic & NVH Testing",
    logo: "/tech-partner/gras.webp",
  },
  {
    name: "Lisun Group",
    category: "Lighting & Electrical Testing",
    logo: "/tech-partner/lisun.webp",
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
          <PartnerCard
            key={partner.name}
            name={partner.name}
            category={partner.category}
            logo={partner.logo}
          />
        ))}
      </SectionContainer>
    </section>
  );
}
