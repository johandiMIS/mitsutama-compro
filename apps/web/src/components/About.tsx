import { FeatureCard } from "@/components/FeatureCard";
import { SectionContainer } from "@/components/SectionContainer";
import { SectionTagline } from "@/components/SectionTagline";
import { SectionTitle } from "@/components/SectionTitle";
import { CloudGearIcon } from "@/components/icons/CloudGearIcon";
import { GearBranchesIcon } from "@/components/icons/GearBranchesIcon";
import { MagnetIcon } from "@/components/icons/MagnetIcon";
import { PersonGearIcon } from "@/components/icons/PersonGearIcon";

const ABOUT_FEATURES = [
  {
    icon: MagnetIcon,
    title: "Calibration Services",
    description:
      "International-standard calibration services for industrial testing and measurement instruments.",
  },
  {
    icon: PersonGearIcon,
    title: "Service & Maintenance",
    description:
      "Comprehensive maintenance & repair services to ensure the optimal performance of testing equipment.",
  },
  {
    icon: CloudGearIcon,
    title: "System Integration",
    description:
      "End-to-end testing system integration and instrumentation solutions tailored to your operational requirements.",
  },
  {
    icon: GearBranchesIcon,
    title: "Instrument Distribution",
    description:
      "Supply of high-quality testing and measurement instruments from globally trusted technology brands.",
  },
];

export function About() {
  return (
    <section
      id="about"
      className="w-full scroll-mt-16 py-8"
    >
      <SectionContainer className="flex flex-col items-start gap-10 text-center">
        <div className="flex w-full flex-col items-start gap-4">
          <SectionTagline>ABOUT US</SectionTagline>
          <div className="flex w-full flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <SectionTitle>Who we are</SectionTitle>
            <p className="text-base leading-7 text-zinc-600 dark:text-zinc-400 text-start md:max-w-[70%]">
              PT Mitsutama Indo Teknik is an engineering-driven company that delivers more than just equipment.<br />
              We ensure every testing system produces accurate, repeatable, and reliable results that our customers can trust.
            </p>
          </div>
        </div>

        <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-12">
          {ABOUT_FEATURES.map((feature) => (
            <div key={feature.title} className="xl:col-span-3">
              <FeatureCard
                icon={<feature.icon size={24} color="var(--color-primary)" />}
                title={feature.title}
                description={feature.description}
              />
            </div>
          ))}
        </div>
      </SectionContainer>
    </section>
  );
}
