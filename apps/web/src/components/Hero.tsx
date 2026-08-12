import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { SectionTagline } from "@/components/SectionTagline";
import { SectionTitle } from "@/components/SectionTitle";
import { HeroCarousel } from "./HeroCarousel";

// Dummy stats — replace with real figures once available.
const HERO_STATS = [
  { value: "15+", label: "Years of Engineering Experience" },
  { value: "100+", label: "Delivered Projects" },
  { value: "50+", label: "Enterprise & Institutional Clients" },
];

function HeroTagline() {
  return (
    <SectionTagline variant="white">
      ENGINEERING-DRIVEN. DATA-ACCURATE. INDUSTRY-TRUSTED.
    </SectionTagline>
  );
}

function HeroParagraph() {
  return (
    <p className="max-w-md text-sm text-white/80">
      Engineering-driven solutions for Test &amp; Measurement, Calibration, System Integration
      and Industrial Innovation — so every measurement you make is accurate, repeatable and
      reliable.
    </p>
  );
}

function HeroCtas() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <a
        href="#"
        className="flex items-center gap-2 border border-white px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-primary"
      >
        Explore Solutions
        <ArrowRight className="h-4 w-4" />
      </a>
      <a
        href="#contact"
        className="flex items-center gap-2 border border-white px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-primary"
      >
        Contact Us
        <ArrowRight className="h-4 w-4" />
      </a>
    </div>
  );
}

export function Hero() {
  return (
    <section id="home" className="relative w-full scroll-mt-16 overflow-hidden pt-0 py-8">
      {/* <1180px: mobile/tablet design — carousel and content stacked in one column */}
      <div className="flex flex-col lg:hidden">
        <div className="relative aspect-[3/2] w-full">
          <HeroCarousel />
        </div>
        <div className="flex flex-col gap-6 bg-primary px-6 py-10 text-white sm:px-10">
          <HeroTagline />
          <SectionTitle className="text-[28px] leading-tight text-white sm:text-[34px]">
            Technology Solution Provider for{" "}
            <span className="text-brand-navy">Industry</span>, Research & Education
          </SectionTitle>
          <HeroParagraph />
          <HeroCtas />
          <div className="grid grid-cols-3 gap-4">
            {HERO_STATS.map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <span aria-hidden="true" className="h-10 w-0.5 shrink-0 bg-brand-navy" />
                <div className="flex flex-col gap-1">
                  <p className="text-2xl font-semibold tracking-tight text-white">
                    {stat.value}
                  </p>
                  <p className="text-xs text-white/80">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* >=1180px: original design — carousel and content side by side, clipped diagonally */}
      <div className="relative hidden aspect-[1440/664] lg:block">
        <Image src="/Hero.webp" alt="" fill priority className="object-cover" sizes="100vw" />
        <div className="absolute top-[2.4%] w-[57%] h-[98%] overflow-hidden" style={{
          clipPath: "polygon(0% 0%, 100% 0%, 90% 100%, 0% 100%)"
        }}>
          <HeroCarousel />
        </div>
        <div className="absolute right-0 top-0 flex h-[97.5%] w-[43%] flex-col justify-center gap-6 bg-primary px-10 py-10 text-white">
          <HeroTagline />
          <SectionTitle className="text-white">
            Technology Solution Provider for{" "}
            <span className="text-brand-navy">Industry</span>, Research & Education
          </SectionTitle>
          <HeroParagraph />
          <HeroCtas />
          <div className="mt-4 flex items-center gap-8">
            {HERO_STATS.map((stat) => (
              <div key={stat.label} className="flex items-center gap-4">
                <span aria-hidden="true" className="h-10 w-0.5 shrink-0 bg-brand-navy" />
                <div className="flex flex-col gap-1">
                  <p className="text-[39px] font-semibold tracking-tight text-white">
                    {stat.value}
                  </p>
                  <p className="text-xs text-white/80">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
