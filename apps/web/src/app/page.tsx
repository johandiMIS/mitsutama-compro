import { About } from "@/components/About";
import { ContactCta } from "@/components/ContactCta";
import { Hero } from "@/components/Hero";
import { Industries } from "@/components/Industries";
import { LatestInsight } from "@/components/LatestInsight";
import { Partners } from "@/components/Partners";
import { TechnologyPartners } from "@/components/TechnologyPartners";
import { WhyChooseUs } from "@/components/WhyChooseUs";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center bg-background">
      <Hero />
      <Partners />
      <About />
      <Industries />
      <WhyChooseUs />
      <TechnologyPartners />
      <LatestInsight />
      <ContactCta />
    </div>
  );
}
