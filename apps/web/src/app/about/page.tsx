import type { Metadata } from "next";
import { About } from "@/components/About";
import { AboutIntro } from "@/components/AboutIntro";
import { CompanyValue } from "@/components/CompanyValue";
import { ContactCta } from "@/components/ContactCta";
import { CoreSolutions } from "@/components/CoreSolutions";
import { LegalInformation } from "@/components/LegalInformation";
import { PageHero } from "@/components/PageHero";
import { Partners } from "@/components/Partners";
import { VisionMission } from "@/components/VisionMission";

export const metadata: Metadata = {
  title: "About Us | Mitsutama Indo Teknik",
  description:
    "PT. Mitsutama Indo Teknik is a Technology Solution Provider specializing in testing, measurement, calibration, maintenance, and system integration in Indonesia.",
};

export default function AboutPage() {
  return (
    <div className="flex flex-1 flex-col items-center bg-background">
      <PageHero title="About Us" breadcrumbs={[{ label: "Home", href: "/" }, { label: "About" }]} />
      <AboutIntro />
      <Partners />
      <About />
      <VisionMission />
      <CoreSolutions />
      <LegalInformation />
      <CompanyValue />
      <ContactCta />
    </div>
  );
}
