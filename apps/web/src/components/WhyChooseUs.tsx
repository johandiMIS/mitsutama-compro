import Image from "next/image";
import { FeatureListItem } from "@/components/FeatureListItem";
import { SectionContainer } from "@/components/SectionContainer";
import { SectionTagline } from "@/components/SectionTagline";
import { SectionTitle } from "@/components/SectionTitle";
import { MagnetIcon } from "@/components/icons/MagnetIcon";

// Dummy data — replace with real copy once finalized.
const WHY_CHOOSE_US_LEFT = [
  {
    title: "Engineering-Based Solutions",
    description:
      "We deliver solutions built on deep engineering expertise—not just product sales.",
  },
  {
    title: "Reliable After-Sales Support",
    description:
      "Committed to responsive, long-term after-sales service that ensures your systems continue to perform at their best.",
  },
  {
    title: "Fast & Local Technical Support",
    description:
      "Our local engineering team understands the unique needs of Indonesia's industrial sector and provides timely, hands-on assistance.",
  },
];

const WHY_CHOOSE_US_RIGHT = [
  {
    title: "Multi-Industry Experience",
    description:
      "Proven expertise serving the automotive, electronics, energy, aerospace, and environmental industries with tailored engineering solutions.",
  },
  {
    title: "International Standards",
    description:
      "All our solutions and services are delivered in accordance with internationally recognized ISO, IEC, and ASTM standards.",
  },
];

export function WhyChooseUs() {
  return (
    <section id="why-choose-us" className="w-full scroll-mt-16 bg-zinc-900 py-8">
      <SectionContainer className="grid w-full grid-cols-1 gap-10 text-left xl:grid-cols-12">
        <div className="relative aspect-[208/277] w-full overflow-hidden bg-zinc-800 xl:aspect-auto xl:col-span-4 xl:h-full">
          <Image
            src="/choose-us.webp"
            alt="Engineer inspecting industrial testing equipment"
            fill
            className="object-cover"
            sizes="(min-width: 1280px) 33vw, 100vw"
          />
        </div>

        <div className="flex flex-col gap-8 xl:col-span-8">
          <div className="flex flex-col items-start gap-4">
            <SectionTagline>WHY CHOOSE US</SectionTagline>
            <SectionTitle className="text-white">Why choose us</SectionTitle>
            <p className="max-w-xl text-sm leading-7 text-zinc-400">
              Trusted engineering expertise, reliable support, and industry-proven solutions that
              help your business achieve accurate, dependable, and sustainable results.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col justify-center gap-4">
              {WHY_CHOOSE_US_LEFT.map((feature) => (
                <FeatureListItem
                  key={feature.title}
                  icon={<MagnetIcon size={18} color="var(--color-primary)" />}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
            <div className="flex flex-col justify-center gap-4">
              {WHY_CHOOSE_US_RIGHT.map((feature) => (
                <FeatureListItem
                  key={feature.title}
                  icon={<MagnetIcon size={18} color="var(--color-primary)" />}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}
