"use client";

import Image from "next/image";
import { useState } from "react";
import { SectionContainer } from "@/components/SectionContainer";
import { SectionTagline } from "@/components/SectionTagline";
import { SectionTitle } from "@/components/SectionTitle";
import { ArrowRightIcon } from "@/components/icons/ArrowRightIcon";

// All five industries share one placeholder image for now — swap each `image` for its own
// photo once available (5 total), no other changes needed once that happens.
const PLACEHOLDER_IMAGE = "/industries/industries-automotive.webp";

const INDUSTRIES = [
  {
    name: "Automotive",
    title: "NVH, Engine & Thermal Testing",
    description:
      "Advanced testing solutions for vehicle performance, noise, vibration, thermal management, and powertrain validation.",
    image: PLACEHOLDER_IMAGE,
  },
  {
    name: "Electronics & Semiconductor",
    title: "Precision Electronics Testing",
    description:
      "Replace with a short description of testing and measurement services for this industry.",
    image: PLACEHOLDER_IMAGE,
  },
  {
    name: "Energy & Battery",
    title: "Battery & Energy System Validation",
    description:
      "Replace with a short description of testing and measurement services for this industry.",
    image: PLACEHOLDER_IMAGE,
  },
  {
    name: "Aerospace & Defense",
    title: "Aerospace-Grade Reliability Testing",
    description:
      "Replace with a short description of testing and measurement services for this industry.",
    image: PLACEHOLDER_IMAGE,
  },
  {
    name: "Building & Environmental",
    title: "Environmental & Structural Testing",
    description:
      "Replace with a short description of testing and measurement services for this industry.",
    image: PLACEHOLDER_IMAGE,
  },
];

export function Industries() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = INDUSTRIES[activeIndex];

  return (
    <section id="industries" className="w-full scroll-mt-16 py-20">
      <SectionContainer className="flex flex-col w-full items-start gap-10 text-left lg:grid-cols-2">
        <div className="flex flex-col items-start gap-4">
          <SectionTagline>INDUSTRIES WE SERVE</SectionTagline>
          <SectionTitle>Tailored Solutions for Every Industry</SectionTitle>
          <p className="max-w-md text-base leading-7 text-zinc-600 dark:text-zinc-400">
            Delivering precision testing, measurement, calibration, and engineering solutions that
            drive quality, reliability, and innovation.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-6 xl:grid-cols-12">
          <ul className="mt-4 flex flex-col gap-3 xl:col-span-3">
            {INDUSTRIES.map((industry, index) => {
              const isActive = index === activeIndex;
              return (
                <li key={industry.name}>
                  <button
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-current={isActive}
                    className={`flex items-center gap-2 text-sm font-semibold transition-colors ${isActive
                      ? "text-primary"
                      : "text-black hover:text-primary dark:text-zinc-50"
                      }`}
                  >
                    {isActive && <ArrowRightIcon size={14} />}
                    {industry.name}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface xl:col-span-9">
            <Image
              src={active.image}
              alt={active.name}
              fill
              className="object-cover"
              sizes="(min-width: 1280px) 75vw, 100vw"
            />
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-background/90 p-6 backdrop-blur">
              <h3 className="text-base font-semibold text-black dark:text-zinc-50">
                {active.title}
              </h3>
              <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {active.description}
              </p>
            </div>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}
