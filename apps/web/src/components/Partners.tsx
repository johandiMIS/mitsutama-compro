"use client";

import AutoScroll from "embla-carousel-auto-scroll";
import { SectionContainer } from "@/components/SectionContainer";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

// Dummy partner logos — replace with real partner logos once available.
const DUMMY_PARTNERS = [
  "National Research Center",
  "Energy Utility",
  "Battery Manufacturer",
  "Semiconductor Fab",
  "Technical University",
  "Automotive OEM",
  "Government Metrology"
];

export function Partners() {
  return (
    <section id="partners" className="w-full scroll-mt-16 py-8 text-center">
      <SectionContainer className="flex flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-4">
          <p className="max-w-2xl text-base font-semibold leading-7 text-zinc-600 dark:text-zinc-400">
            Trusted Across Industry, Research & Government
          </p>
        </div>

        <Carousel
          opts={{ loop: true, dragFree: true, align: "start" }}
          plugins={[
            AutoScroll({ speed: 1, startDelay: 0, stopOnInteraction: false, stopOnMouseEnter: true }),
          ]}
          className="w-full [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
        >
          <CarouselContent>
            {/* Duplicated so there's enough width to loop seamlessly at any screen size. */}
            {[...DUMMY_PARTNERS, ...DUMMY_PARTNERS].map((name, index) => (
              <CarouselItem key={`${name}-${index}`} className="basis-auto pl-6">
                <div className="flex h-16 w-40 shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                  {name}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </SectionContainer>
    </section>
  );
}
