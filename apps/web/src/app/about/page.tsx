import type { Metadata } from "next";
import { About } from "@/components/About";
import { AboutIntro } from "@/components/AboutIntro";
import { PageHero } from "@/components/PageHero";
import { Partners } from "@/components/Partners";

export const metadata: Metadata = {
  title: "About Us | Mitsutama Indo Teknik",
  description:
    "PT. Mitsutama Indo Teknik is a Technology Solution Provider specializing in testing, measurement, calibration, maintenance, and system integration in Indonesia.",
};

export default function AboutPage() {
  return (
    <div className="flex flex-1 flex-col items-center bg-background">
      <PageHero title="About Us" breadcrumbs={[{ label: "Home", href: "/" }, { label: "About" }]} />
      <AboutIntro />
      <Partners />
      <About />
    </div>
  );
}
