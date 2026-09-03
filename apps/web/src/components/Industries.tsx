"use client";

import Image from "next/image";
import { useState } from "react";
import { SectionContainer } from "@/components/SectionContainer";
import { SectionTagline } from "@/components/SectionTagline";
import { SectionTitle } from "@/components/SectionTitle";
import { ArrowRightIcon } from "@/components/icons/ArrowRightIcon";

const INDUSTRIES = [
  {
    name: "Automotive",
    title: "NVH, Engine & Thermal Testing",
    description:
      "Advanced testing solutions for vehicle performance, noise, vibration, thermal management, and powertrain validation.",
    image: "/industries/industries-automotive.webp",
  },
  {
    name: "Electronics & Semiconductor",
    title: "PCB, Power Supply & Quality Control",
    description:
      "Precision testing and measurement solutions for electronic components, power systems, and manufacturing quality assurance.",
    image: "/industries/industries-electronics-semiconductor.webp",
  },
  {
    name: "Energy & Battery",
    title: "EV, ESS & Charge-Discharge Testing",
    description:
      "Comprehensive testing solutions for electric vehicle batteries, energy storage systems (ESS), and battery performance validation.",
    image: "/industries/industries-energy-battery.webp",
  },
  {
    name: "Aerospace & Defense",
    title: "Structural & Acoustic Testing",
    description:
      "High-precision measurement solutions for structural integrity, vibration analysis, and acoustic performance testing.",
    image: "/industries/industries-aerospace-defense.webp",
  },
  {
    name: "Building & Environmental",
    title: "HVAC, Noise & Air Quality",
    description:
      "Testing and monitoring solutions for HVAC systems, environmental noise, indoor air quality, and regulatory compliance.",
    image: "/industries/industries-building-environmental.webp",
  },
];

export function Industries() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = INDUSTRIES[activeIndex];

  return (
    <section id="industries" className="w-full scroll-mt-16 py-8">
      <SectionContainer className="flex flex-col w-full items-start gap-10 text-left lg:grid-cols-2">
        <div className="flex flex-col items-start gap-4">
          <SectionTagline>INDUSTRIES WE SERVE</SectionTagline>
          <SectionTitle>Tailored Solutions for Every Industry</SectionTitle>
          <p className="max-w-2xl text-sm leading-7 text-muted-ink">
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
                      ? "text-brand-ink"
                      : "text-foreground hover:text-brand-ink"
                      }`}
                  >
                    {isActive && <ArrowRightIcon size={14} />}
                    {industry.name}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="relative w-full bg-surface xl:col-span-9">
            <div className="relative aspect-[3/4] w-full overflow-hidden sm:aspect-[4/3]">
              <Image
                src={active.image}
                alt={active.name}
                fill
                className="object-cover"
                sizes="(min-width: 1280px) 75vw, 100vw"
              />
            </div>
            {/* Every industry's caption is rendered stacked in the same grid cell, with the
                inactive ones hidden — so the box is always as tall as the longest copy and
                keeps one height across all five, instead of resizing per selection. */}
            <div className="grid bg-surface p-4 sm:absolute sm:inset-x-0 sm:bottom-0 sm:bg-background/70 sm:p-6 sm:backdrop-blur">
              {INDUSTRIES.map((industry) => (
                <div
                  key={industry.name}
                  aria-hidden={industry !== active}
                  className={`col-start-1 row-start-1 flex flex-col gap-1 ${industry === active ? "" : "invisible"
                    }`}
                >
                  <h3 className="text-base font-semibold text-foreground">
                    {industry.title}
                  </h3>
                  <p className="text-sm leading-6 text-muted-ink">
                    {industry.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}
