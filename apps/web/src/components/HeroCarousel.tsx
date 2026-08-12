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

const SLIDE_IMAGES = [
  "/hero/hero-1.webp",
  "/hero/hero-2.webp",
  "/hero/hero-3.webp",
  "/hero/hero-4.webp",
  "/hero/hero-5.webp",
  "/hero/hero-6.webp",
];

export function HeroCarousel() {
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
          {SLIDE_IMAGES.map((image, index) => (
            <CarouselItem key={`${image}-${index}`} className="relative h-full">
              <Image
                src={image}
                alt=""
                fill
                className="object-cover"
                sizes="57vw"
                priority={index === 0}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselDots api={api} className="absolute inset-x-0 bottom-4" />
      </Carousel>
    </div>
  );
}
