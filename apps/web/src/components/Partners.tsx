"use client";

import AutoScroll from "embla-carousel-auto-scroll";
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
    <section
      id="partners"
      className="flex w-full scroll-mt-16 flex-col items-center gap-10 px-6 py-20 text-center"
    >
      <div className="flex flex-col items-center gap-4">
        <p className="max-w-2xl text-base font-bold leading-7 text-zinc-600 dark:text-zinc-400">
          Trusted Across Industry, Research & Government
        </p>
      </div>

      <Carousel
        opts={{ loop: true, dragFree: true, align: "start" }}
        plugins={[
          AutoScroll({ speed: 1, startDelay: 0, stopOnInteraction: false, stopOnMouseEnter: true }),
        ]}
        className="w-full max-w-5xl [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
      >
        <CarouselContent>
          {/* Duplicated so there's enough width to loop seamlessly at any screen size. */}
          {[...DUMMY_PARTNERS, ...DUMMY_PARTNERS].map((name, index) => (
            <CarouselItem key={`${name}-${index}`} className="basis-auto pl-6">
              <div className="flex h-16 w-40 shrink-0 items-center justify-center rounded-lg border border-black/[.08] text-sm font-medium text-zinc-500 dark:border-white/[.145] dark:text-zinc-400">
                {name}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
