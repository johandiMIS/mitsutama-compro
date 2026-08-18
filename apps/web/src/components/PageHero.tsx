import Link from "next/link";
import { SectionContainer } from "@/components/SectionContainer";
import { ChevronRightIcon } from "@/components/icons/ChevronRightIcon";

/** Deeper than --primary: the band sits behind white text and the brand red is too bright for it. */
const BAND_RED = "#c5242b";

/** Equilateral tessellation — a 5%-white triangle per tile, the band colour showing between them. */
const TRIANGLE_PATTERN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='62' height='54'%3E%3Cpath d='M31 0 62 54 0 54Z' fill='%23ffffff' fill-opacity='0.05'/%3E%3C/svg%3E\")";

export type Breadcrumb = { label: string; href?: string };

export function PageHero({ title, breadcrumbs }: { title: string; breadcrumbs: Breadcrumb[] }) {
  return (
    <section
      className="w-full text-white"
      style={{ backgroundColor: BAND_RED, backgroundImage: TRIANGLE_PATTERN }}
    >
      <SectionContainer className="flex flex-col gap-3 py-12">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            {breadcrumbs.map((crumb, index) => (
              <li key={crumb.label} className="flex items-center gap-2">
                {index > 0 && (
                  <ChevronRightIcon size={12} color="rgba(255,255,255,0.7)" />
                )}
                {crumb.href ? (
                  <Link href={crumb.href} className="text-white/90 transition-colors hover:text-white">
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current="page">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <h1 className="text-[39px] font-bold tracking-tight">{title}</h1>
      </SectionContainer>
    </section>
  );
}
