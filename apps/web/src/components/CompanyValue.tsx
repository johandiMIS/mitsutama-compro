import { FeatureCard } from "@/components/FeatureCard";
import { SectionContainer } from "@/components/SectionContainer";
import { SectionTagline } from "@/components/SectionTagline";
import { SectionTitle } from "@/components/SectionTitle";
import { HandIcon } from "@/components/icons/HandIcon";
import { LightbulbIcon } from "@/components/icons/LightbulbIcon";
import { PersonsIcon } from "@/components/icons/PersonsIcon";
import { ScalesIcon } from "@/components/icons/ScalesIcon";
import { StarIcon } from "@/components/icons/StarIcon";

const QUOTE =
  "Customer trust is not built by what we say, but by what we do and take responsibility for every day.";

const COMPANY_VALUES = [
  {
    icon: ScalesIcon,
    title: "Integrity",
    description: "We uphold honesty, transparency, and accountability in everything we do.",
  },
  {
    icon: StarIcon,
    title: "Professionalism",
    description: "We deliver our expertise with discipline, precision, and commitment.",
  },
  {
    icon: LightbulbIcon,
    title: "Innovation",
    description:
      "We continuously seek better technologies and solutions to meet evolving industry needs.",
  },
  {
    icon: HandIcon,
    title: "Responsibility",
    description: "We take ownership of our work and the results we deliver.",
  },
  {
    icon: PersonsIcon,
    title: "Collaboration",
    description:
      "We build strong partnerships with customers, technology principals, and our team.",
  },
];

export function CompanyValue() {
  return (
    <section id="company-value" className="w-full scroll-mt-16 py-10">
      <SectionContainer className="flex flex-col items-start gap-8 text-left">
        <div className="flex w-full flex-col items-start gap-4">
          <SectionTagline>COMPANY VALUE</SectionTagline>
          <div className="flex w-full flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <SectionTitle>The Mitsutama Way</SectionTitle>
            <blockquote className="flex items-start gap-3 bg-zinc-50 px-6 py-5 dark:bg-zinc-800/40 md:max-w-[60%]">
              <span aria-hidden="true" className="text-xl font-bold leading-none text-brand-ink">
                &ldquo;
              </span>
              <p className="text-sm font-semibold leading-6 text-foreground">
                {QUOTE}
              </p>
              <span aria-hidden="true" className="text-xl font-bold leading-none text-brand-ink">
                &rdquo;
              </span>
            </blockquote>
          </div>
        </div>

        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {COMPANY_VALUES.map((value) => (
            <FeatureCard
              key={value.title}
              icon={<value.icon size={24} color="var(--color-brand-ink)" />}
              title={value.title}
              description={value.description}
            />
          ))}
        </div>
      </SectionContainer>
    </section>
  );
}
