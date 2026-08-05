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

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden py-8">
      <div className="aspect-[1440/664] relative">
        <Image src="/Hero.webp" alt="" fill priority className="object-cover" sizes="100vw" />
        <div className="absolute top-[2.4%] w-[57%] h-[98%] overflow-hidden" style={{
          clipPath: "polygon(0% 0%, 100% 0%, 90% 100%, 0% 100%)"
        }}>
          <HeroCarousel />
        </div>
        <div className="absolute right-0 top-0 flex h-[97.5%] w-[43%] flex-col justify-center gap-6 bg-primary px-10 py-10 text-white">
          <SectionTagline variant="white">
            ENGINEERING-DRIVEN. DATA-ACCURATE. INDUSTRY-TRUSTED.
          </SectionTagline>
          <SectionTitle className="text-white">
            Technology Solution Provider for{" "}
            <span className="text-brand-navy">Industry</span>, Research & Education
          </SectionTitle>
          <p className="max-w-md text-sm text-white/80">
            Engineering-driven solutions for Test &amp; Measurement, Calibration, System
            Integration and Industrial Innovation — so every measurement you make is accurate,
            repeatable and reliable.
          </p>
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
