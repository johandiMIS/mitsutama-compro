import Image from "next/image";
import Link from "next/link";
import { PhoneIcon } from "@/components/icons/PhoneIcon";
import { NAV_LINKS } from "@/components/nav/nav-links";
import { SectionContainer } from "@/components/SectionContainer";
import { TECHNOLOGY_PARTNERS } from "@/components/TechnologyPartners";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t-4 border-primary bg-black text-white">
      <SectionContainer className="grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 xl:grid-cols-5">
        <div className="flex flex-col gap-4 xl:col-span-2">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo-square.webp"
              alt="Mitsutama Indo Teknik"
              width={64}
              height={64}
              className="h-10 w-auto"
            />
            <span className="text-base leading-tight font-semibold">
              Mitsutama
              <br />
              Indo Teknik
            </span>
          </Link>
          <p className="max-w-xs text-sm text-zinc-400">
            Your trusted Technology Solution Provider for Industry, Research & Education.
          </p>
          <p className="text-sm font-semibold tracking-wide text-primary">
            ENGINEERING-DRIVEN. DATA-ACCURATE. INDUSTRY-TRUSTED.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-sm text-zinc-500">Navigate</p>
          <ul className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm font-semibold hover:text-primary">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-sm text-zinc-500">Partners</p>
          <ul className="flex flex-col gap-3">
            {TECHNOLOGY_PARTNERS.map((partner) => (
              <li key={partner.name} className="text-sm font-semibold">
                {partner.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-sm text-zinc-500">Get in Touch</p>
          {/* Dummy address — replace with the real office address once confirmed. */}
          <p className="max-w-xs text-sm text-zinc-400">
            Kawasan Industri Sinar Kemis, Jl. Sinar Kemis Blok E No. 5, Pasar Kemis, Kab. Tangerang,
            Banten 15560.
          </p>
          <a
            href="tel:+10000000000"
            className="flex items-center gap-2 text-sm font-semibold hover:text-primary"
          >
            <PhoneIcon />
            021-5927050
          </a>
        </div>
      </SectionContainer>

      <SectionContainer className="border-t border-white/10 py-6">
        <p className="text-xs text-zinc-500">
          &copy; {year} PT. Mitsutama Indo Teknik. All rights reserved.
        </p>
      </SectionContainer>
    </footer>
  );
}
