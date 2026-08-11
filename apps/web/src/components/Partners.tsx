"use client";

import Image from "next/image";
import AutoScroll from "embla-carousel-auto-scroll";
import { SectionContainer } from "@/components/SectionContainer";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

// width/height are each logo's actual pixel dimensions, so the rendered
// aspect ratio matches the source file when scaled to a fixed 32px height.
const PARTNERS = [
  { name: "ALVA", logo: "/partners/alva.png", width: 564, height: 128 },
  { name: "BRIN", logo: "/partners/brin.png", width: 328, height: 128 },
  { name: "ESDM", logo: "/partners/esdm.png", width: 316, height: 128 },
  { name: "GT Radial", logo: "/partners/gtradial.png", width: 840, height: 128 },
  { name: "INKA", logo: "/partners/inka.png", width: 412, height: 128 },
  { name: "ITB", logo: "/partners/itb.png", width: 228, height: 128 },
  { name: "Mitsubishi", logo: "/partners/mitsubishi.png", width: 456, height: 128 },
  { name: "Pertamina", logo: "/partners/pertamina.png", width: 548, height: 128 },
  { name: "PLN", logo: "/partners/pln.png", width: 356, height: 128 },
  { name: "Polytron", logo: "/partners/polytron.png", width: 128, height: 128 },
  { name: "Wuling", logo: "/partners/wuling.png", width: 612, height: 128 },
  { name: "Yamaha", logo: "/partners/yamaha.png", width: 608, height: 128 },
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
            {[...PARTNERS, ...PARTNERS].map((partner, index) => (
              <CarouselItem key={`${partner.name}-${index}`} className="basis-auto pl-4">
                <div className="flex mx-8 mt-4 items-center justify-center">
                  <Image
                    src={partner.logo}
                    alt={`${partner.name} logo`}
                    width={partner.width}
                    height={partner.height}
                    className="h-8 w-auto object-contain"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </SectionContainer>
    </section>
  );
}
