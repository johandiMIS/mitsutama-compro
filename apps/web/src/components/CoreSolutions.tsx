import Image from "next/image";
import { SectionContainer } from "@/components/SectionContainer";
import { SectionTagline } from "@/components/SectionTagline";
import { SectionTitle } from "@/components/SectionTitle";

// The figure carries its own labels. A mobile-shaped version is still to come — add it here and
// swap the two on a breakpoint once it lands; this wide one is unreadable on a phone.
const FIGURE = {
  src: "/core-solution/core-solution-desktop.webp",
  width: 5124,
  height: 736,
};

export function CoreSolutions() {
  return (
    <section id="core-solutions" className="w-full scroll-mt-16 py-8">
      <SectionContainer className="flex flex-col items-start gap-8 text-left">
        <div className="flex flex-col items-start gap-4">
          <SectionTagline>OUR CORE SOLUTIONS</SectionTagline>
          <SectionTitle>Four Core Solutions. One Reliable Partner.</SectionTitle>
          <p className="max-w-4xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">
            From measurement accuracy to system performance, we provide integrated solutions
            designed to ensure reliable results throughout your testing process.
          </p>
        </div>

        <Image
          src={FIGURE.src}
          width={FIGURE.width}
          height={FIGURE.height}
          alt="Four core solutions: Calibration for accuracy and traceability, Service for optimal and reliable performance, Integration for integrated testing systems, and Instrumentation from global technology brands."
          className="h-auto w-full"
          sizes="100vw"
        />
      </SectionContainer>
    </section>
  );
}
