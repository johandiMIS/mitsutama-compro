import Image from "next/image";
import { CountToYear } from "@/components/CountToYear";
import { SectionContainer } from "@/components/SectionContainer";
import { SectionTagline } from "@/components/SectionTagline";
import { SectionTitle } from "@/components/SectionTitle";

// Reuses the Industries photo until an about-specific image is supplied.
const INTRO_IMAGE = "/industries/industries-automotive.webp";

const INTRO_PARAGRAPHS = [
  "PT. Mitsutama Indo Teknik is a Technology Solution Provider specializing in testing, measurement, calibration, maintenance, and system integration for manufacturing industries, laboratories, and Research & Development (R&D) in Indonesia.",
  "Supported by international technology principals and extensive engineering experience, we deliver reliable, application-focused solutions tailored to each customer's needs.",
  "Beyond our core Test & Measurement capabilities, we also provide supporting engineering services including metal fabrication, dies making, jig & fixture, and engineering support to deliver more comprehensive solutions.",
];

export function AboutIntro() {
  return (
    <section className="w-full py-14">
      <SectionContainer className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="flex flex-col items-start gap-4">
          <SectionTagline>ABOUT US</SectionTagline>
          <SectionTitle>
            Technology Solution Provider
            <br className="hidden sm:inline" /> for Industry, Research &amp; Education
          </SectionTitle>
          <div className="flex flex-col gap-4">
            {INTRO_PARAGRAPHS.map((paragraph) => (
              <p key={paragraph} className="text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* The badge hangs off the photo's bottom-left corner, so this wrapper must not clip. */}
        <div className="relative">
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface">
            <Image
              src={INTRO_IMAGE}
              alt="Engineers running a test and measurement rig"
              fill
              className="object-cover"
              sizes="(min-width: 1180px) 50vw, 100vw"
            />
          </div>
          <div className="absolute bottom-0 -left-4 flex flex-col gap-1 bg-brand-navy px-5 py-4 text-white md:-left-6">
            <p className="text-xs">Established in</p>
            {/* tabular-nums keeps the badge from jittering while the digits count down. */}
            <p className="text-[40px] font-bold leading-none tabular-nums">
              <CountToYear target={2010} />
            </p>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}
