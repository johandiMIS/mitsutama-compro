import Image from "next/image";
import { SectionContainer } from "@/components/SectionContainer";
import { SectionTagline } from "@/components/SectionTagline";
import { SectionTitle } from "@/components/SectionTitle";

// Two art-directed cuts of the same figure — the labels are baked into the image, so this is a
// real layout change (horizontal timeline vs. vertical stack), not something `object-fit` can do.
// The 7:1 strip only becomes legible once the container is wide, so it takes over at `xl`
// (1280px) and the stacked cut covers every width below that. `xl` rather than `lg`, since `lg`
// is overridden to 1180px as the nav's own hamburger threshold — see docs/design-profile.md.
const FIGURE_MOBILE = {
  src: "/core-solution/core-solution-mobile.webp",
  width: 1480,
  height: 1344,
};

const FIGURE_DESKTOP = {
  src: "/core-solution/core-solution-desktop.webp",
  width: 5124,
  height: 736,
};

// Both cuts carry the real alt text rather than one being aria-hidden: `hidden`/`xl:hidden` is
// `display: none`, which already drops the inactive one out of the accessibility tree, so exactly
// one is ever announced. Marking either one aria-hidden would leave the figure unnamed at the
// breakpoint where the other is the hidden one.
const FIGURE_ALT =
  "Four core solutions: Calibration for accuracy and traceability, Service for optimal and reliable performance, Integration for integrated testing systems, and Instrumentation from global technology brands.";

export function CoreSolutions() {
  return (
    <section id="core-solutions" className="w-full scroll-mt-16 py-8">
      <SectionContainer className="flex flex-col items-start gap-8 text-left">
        <div className="flex flex-col items-start gap-4">
          <SectionTagline>OUR CORE SOLUTIONS</SectionTagline>
          <SectionTitle>Four Core Solutions. One Reliable Partner.</SectionTitle>
          <p className="max-w-4xl text-sm leading-7 text-muted-ink">
            From measurement accuracy to system performance, we provide integrated solutions
            designed to ensure reliable results throughout your testing process.
          </p>
        </div>

        {/* always-light: both cuts bake in near-black labels and a black axis rule, and neither has
            a dark-inked version — so the chip stays white in both themes. Replace this with
            `-dark` siblings and a `dark:hidden`/`hidden dark:block` pair if they're ever drawn.
            The chip hugs the stacked cut below `xl` so it doesn't sit in a wide band of empty
            white; at `xl` it spans the container like the strip does. */}
        <div className="always-light w-full max-w-md p-4 xl:max-w-none">
          <Image
            {...FIGURE_MOBILE}
            alt={FIGURE_ALT}
            className="h-auto w-full xl:hidden"
            sizes="(min-width: 448px) 416px, 100vw"
          />
          <Image
            {...FIGURE_DESKTOP}
            alt={FIGURE_ALT}
            className="hidden h-auto w-full xl:block"
            sizes="100vw"
          />
        </div>
      </SectionContainer>
    </section>
  );
}
