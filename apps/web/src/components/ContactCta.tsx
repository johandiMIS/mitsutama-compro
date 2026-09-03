import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { SectionContainer } from "@/components/SectionContainer";
import { SectionTagline } from "@/components/SectionTagline";
import { SectionTitle } from "@/components/SectionTitle";

const CTA_BG_IMAGE = "/cta_bg.webp";

export function ContactCta() {
  return (
    // always-dark: brand-red fill behind a photo in both themes, so the white heading and
    // tagline inside are fixed by design and must not be paired with `dark:`.
    <section
      id="contact"
      className="relative w-full scroll-mt-16 overflow-hidden bg-primary py-16"
    >
      <Image
        src={CTA_BG_IMAGE}
        alt=""
        fill
        className="object-cover"
        sizes="100vw"
      />
      <SectionContainer className="relative flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col items-start gap-4">
          <SectionTagline variant="white">LET&apos;S DISCUSS YOUR PROJECT</SectionTagline>
          <SectionTitle className="max-w-xl text-white">
            Need engineering solutions you can trust?
          </SectionTitle>
        </div>
        {/* always-light: a white chip on the red band — `.always-light` pins `--brand-ink` to
            its light value, so the label stays the deep brand red on white in dark mode too. */}
        <a
          href="mailto:hello@example.com"
          className="always-light flex h-12 shrink-0 items-center justify-center gap-2 rounded-md px-6 text-base font-semibold text-brand-ink transition-colors hover:bg-zinc-100"
        >
          Request a Consultation
          <ArrowRight className="h-4 w-4" />
        </a>
      </SectionContainer>
    </section>
  );
}
