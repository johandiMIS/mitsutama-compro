import Image from "next/image";
import { SectionContainer } from "@/components/SectionContainer";
import { SectionTagline } from "@/components/SectionTagline";
import { SectionTitle } from "@/components/SectionTitle";

const LEGAL_IMAGE = {
  src: "/legal-information/Image.webp",
  width: 2424,
  height: 1180,
};

const REGISTRATIONS = [
  { label: "Tax Identification Number (NPWP)", value: "1000 000 0588 6052" },
  { label: "Business Identification Number (NIB)", value: "3009250077611" },
];

const BUSINESS_ACTIVITIES = [
  "Wholesale of Heavy Machinery",
  "Wholesale of Software",
  "Calibration Services",
  "Wholesale of Laboratory Equipment",
  "Installation and Other Industrial Design Activities",
];

export function LegalInformation() {
  return (
    <section
      id="legal-information"
      className="w-full scroll-mt-16 bg-zinc-50 py-10 dark:bg-zinc-800/40"
    >
      {/* The tagline sits above the grid, so the title and the figure start on the same line and
          the two columns are free to match each other's height. */}
      <SectionContainer className="flex flex-col gap-4 text-left">
        <SectionTagline>LEGAL INFORMATION</SectionTagline>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Grid stretch makes this column as tall as the figure; justify-between then spreads
              the title, cards and activities so the last bullet lands on the figure's bottom. */}
          <div className="flex flex-col gap-6 lg:justify-between">
            <SectionTitle>Company Legal Information</SectionTitle>

            <dl className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
              {REGISTRATIONS.map((registration) => (
                <div
                  key={registration.label}
                  className="flex flex-col gap-2 border border-black/[.08] px-5 py-4 dark:border-white/[.145]"
                >
                  <dt className="text-sm font-semibold text-black dark:text-zinc-50">
                    {registration.label}
                  </dt>
                  <dd className="text-sm text-zinc-600 dark:text-zinc-400">
                    {registration.value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-black dark:text-zinc-50">
                Registered Business Activities
              </h3>
              <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {BUSINESS_ACTIVITIES.map((activity) => (
                  <li key={activity}>{activity}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Natural ratio normally; min-h-full + object-cover only kicks in when the text column
              is the taller of the two, so the two always end level on desktop. */}
          <Image
            src={LEGAL_IMAGE.src}
            width={LEGAL_IMAGE.width}
            height={LEGAL_IMAGE.height}
            alt="Engineer operating a test and measurement system"
            className="h-auto w-full lg:min-h-full lg:object-cover"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        </div>
      </SectionContainer>
    </section>
  );
}
