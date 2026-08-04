"use client";

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { CarouselDots } from "@/components/ui/carousel-dots";

// Dummy data — replace with real slide content.
const DUMMY_SLIDES = [
  { title: "Slide One", body: "Dummy carousel content — replace with real slides." },
  { title: "Slide Two", body: "Auto-slides on a timer, pauses while you interact." },
  { title: "Slide Three", body: "Dots below jump directly to a slide." },
];

export function Hero() {
  const [api, setApi] = React.useState<CarouselApi>();

  return (
    <section className="flex w-full flex-col items-center gap-6 px-6 py-24 text-center sm:py-32">
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-black sm:text-5xl dark:text-zinc-50">
        [Company Name]
      </h1>
      <p className="max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
        Replace this with your company&apos;s tagline — a short line describing what you do and
        who you do it for.
      </p>
      <a
        href="mailto:hello@example.com"
        className="mt-2 flex h-12 items-center justify-center rounded-full bg-primary px-8 text-base font-medium text-white transition-colors hover:bg-primary-hover"
      >
        Get in Touch
      </a>

      <div className="mt-10 w-full max-w-5xl">
        <Carousel
          setApi={setApi}
          opts={{ loop: true }}
          plugins={[Autoplay({ delay: 4000, stopOnInteraction: false })]}
        >
          <CarouselContent>
            {DUMMY_SLIDES.map((slide) => (
              <CarouselItem key={slide.title}>
                <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-2xl bg-surface px-6 text-center sm:h-80">
                  <h2 className="text-2xl font-semibold tracking-tight text-black">
                    {slide.title}
                  </h2>
                  <p className="max-w-md text-base text-zinc-600">{slide.body}</p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselDots api={api} className="absolute inset-x-0 bottom-4" />
        </Carousel>
      </div>
    </section>
  );
}
