import Image from "next/image";
import Link from "next/link";
import { PhoneIcon } from "@/components/icons/PhoneIcon";
import { NAV_LINKS } from "@/components/nav/nav-links";
import { SectionContainer } from "@/components/SectionContainer";
import { TECHNOLOGY_PARTNERS } from "@/components/TechnologyPartners";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    // always-dark: black in both themes, so the ink tokens inside are pinned to their dark
    // values by `.always-dark` and need no `dark:` variants.
    <footer className="always-dark w-full border-t-4 border-primary bg-black">
      <SectionContainer className="grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 xl:grid-cols-5">
        <div className="flex flex-col gap-4 xl:col-span-2">
          <Link href="/" className="flex items-center gap-3">
            {/* dark-mode:exempt — the square mark is brand red/navy only, no dark ink to lose. */}
            <Image
              src="/logo-square.webp"
              alt="Mitsutama Indo Teknik"
              width={205}
              height={128}
              className="h-10 w-auto"
            />
            <span className="text-base leading-tight font-semibold">
              Mitsutama
              <br />
              Indo Teknik
            </span>
          </Link>
          <p className="max-w-xs text-sm text-muted-ink">
            Your trusted Technology Solution Provider for Industry, Research & Education.
          </p>
          <p className="text-sm font-semibold tracking-wide text-brand-ink">
            ENGINEERING-DRIVEN. DATA-ACCURATE. INDUSTRY-TRUSTED.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-ink">Navigate</p>
          <ul className="flex flex-col gap-3">
            {NAV_LINKS.filter((link) => !link.dropdown).map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm font-semibold hover:text-brand-ink">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-ink">Partners</p>
          <ul className="flex flex-col gap-3">
            {TECHNOLOGY_PARTNERS.map((partner) => (
              <li key={partner.name} className="text-sm font-semibold">
                {partner.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-ink">Get in Touch</p>
          {/* Dummy address — replace with the real office address once confirmed. */}
          <p className="max-w-xs text-sm text-muted-ink">
            Kawasan Industri Sinar Kemis, Jl. Sinar Kemis Blok E No. 5, Pasar Kemis, Kab. Tangerang,
            Banten 15560.
          </p>
          <a
            href="tel:+10000000000"
            className="flex items-center gap-2 text-sm font-semibold hover:text-brand-ink"
          >
            <PhoneIcon />
            021-5927050
          </a>
        </div>
      </SectionContainer>

      <SectionContainer className="border-t border-white/10 py-6">
        <p className="text-xs text-muted-ink">
          &copy; {year} PT. Mitsutama Indo Teknik. All rights reserved.
        </p>
      </SectionContainer>
    </footer>
  );
}
