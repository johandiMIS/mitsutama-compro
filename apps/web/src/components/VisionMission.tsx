import Image from "next/image";
import { FeatureListItem } from "@/components/FeatureListItem";
import { SectionContainer } from "@/components/SectionContainer";
import { SectionTagline } from "@/components/SectionTagline";
import { SectionTitle } from "@/components/SectionTitle";
import { CheckIcon } from "@/components/icons/CheckIcon";

// Placeholder photo until a vision & mission image is supplied.
const VISION_IMAGE = "/choose-us.webp";

const VISION =
  "To become a trusted Technology Solution Provider in testing, measurement, calibration, maintenance, and system integration.";

// Split across two columns, each vertically centred — so the right column staggers against the
// left, the same way the Why Choose Us list does.
const MISSION_LEFT = [
  "Provide high-quality technology solutions",
  "Deliver professional technical support",
  "Improve customer productivity",
];

const MISSION_RIGHT = [
  "Continuously develop our technical capabilities",
  "Build long-term partnerships based on trust & performance",
];

export function VisionMission() {
  return (
    <section id="vision-mission" className="w-full scroll-mt-16 bg-zinc-900 py-8">
      <SectionContainer className="grid w-full grid-cols-1 gap-10 text-left xl:grid-cols-12">
        <div className="relative aspect-[208/277] w-full overflow-hidden bg-zinc-800 xl:aspect-auto xl:col-span-4 xl:h-full">
          <Image
            src={VISION_IMAGE}
            alt="Engineers assembling instrumentation on site"
            fill
            className="object-cover"
            sizes="(min-width: 1280px) 33vw, 100vw"
          />
        </div>

        <div className="flex flex-col gap-8 xl:col-span-8">
          <div className="flex flex-col items-start gap-4">
            <SectionTagline>VISION &amp; MISSION</SectionTagline>
            <SectionTitle className="text-white">Our Vision</SectionTitle>
            <p className="max-w-3xl text-sm leading-7 text-zinc-400">{VISION}</p>
          </div>

          <div className="flex flex-col items-start gap-4">
            <SectionTitle className="text-white">Our Mission</SectionTitle>
            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col justify-center gap-4">
                {MISSION_LEFT.map((mission) => (
                  <FeatureListItem
                    key={mission}
                    icon={<CheckIcon size={18} color="var(--color-primary)" />}
                    title={mission}
                  />
                ))}
              </div>
              <div className="flex flex-col justify-center gap-4">
                {MISSION_RIGHT.map((mission) => (
                  <FeatureListItem
                    key={mission}
                    icon={<CheckIcon size={18} color="var(--color-primary)" />}
                    title={mission}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}
