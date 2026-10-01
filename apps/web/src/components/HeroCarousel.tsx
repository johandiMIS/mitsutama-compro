"use client";

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { CarouselDots } from "@/components/ui/carousel-dots";
import type { HeroSlide } from "@/lib/hero-images";

/**
 * `sizes` for one slide. The slide box is square and the image covers it, so a landscape
 * image is drawn wider than the box by its aspect ratio: on a 3440px-wide screen the
 * desktop box is 57vw = 1961px, but a 3280×2592 image fills it at ~2481px. Declaring
 * just the box width makes next/image pick a variant too small and upscale it.
 */
function slideSizes(slide: HeroSlide): string {
  const aspect =
    slide.width && slide.height ? Math.max(1, slide.width / slide.height) : 16 / 9;
  return `(min-width: 1180px) ${Math.ceil(57 * aspect)}vw, ${Math.ceil(100 * aspect)}vw`;
}

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [api, setApi] = React.useState<CarouselApi>();

  return (
    <div className="w-full h-full">
      <Carousel
        setApi={setApi}
        opts={{ loop: true }}
        plugins={[Autoplay({ delay: 4000, stopOnInteraction: false })]}
        className="h-full"
      >
        <CarouselContent className="h-full">
          {slides.map((slide, index) => (
            <CarouselItem key={`${slide.src}-${index}`} className="relative h-full overflow-hidden">
              {/* Square image box, centred and full-bleed across the slide: the
                  carousel/clip container crops it rather than reshaping the photo. */}
              <div className="absolute left-1/2 top-1/2 aspect-square w-full -translate-x-1/2 -translate-y-1/2">
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  className="object-cover"
                  sizes={slideSizes(slide)}
                  priority={index === 0}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselDots api={api} className="absolute inset-x-0 bottom-4" />
      </Carousel>
    </div>
  );
}
