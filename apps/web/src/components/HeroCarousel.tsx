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

// Dummy slide images — replace with the real 5 hero photos once available.
const DUMMY_SLIDE_IMAGES = [
  "/building.webp",
  "/industries/industries-automotive.webp",
  "/why-choose-us.webp",
  // "/industries/industries-automotive.webp",
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
          {DUMMY_SLIDE_IMAGES.map((image, index) => (
            <CarouselItem key={`${image}-${index}`} className="relative h-full">
              <Image
                src={image}
                alt=""
                fill
                className="object-cover"
                sizes="57vw"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselDots api={api} className="absolute inset-x-0 bottom-4" />
      </Carousel>
    </div>
  );
}
