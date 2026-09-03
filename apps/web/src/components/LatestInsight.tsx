import { InsightCard } from "@/components/InsightCard";
import { SectionContainer } from "@/components/SectionContainer";
import { SectionTagline } from "@/components/SectionTagline";
import { SectionTitle } from "@/components/SectionTitle";
import { ArrowRightIcon } from "@/components/icons/ArrowRightIcon";

// Dummy data — all three share one placeholder photo for now, replace per-article once
// real photography and copy are available.
const PLACEHOLDER_IMAGE = "/why-choose-us.webp";

const LATEST_INSIGHTS = [
  {
    category: "Battery Testing",
    title: "Building traceable charge-discharge validation for EV cell production",
    date: "2 August 2026 - 04.14 PM",
    image: PLACEHOLDER_IMAGE,
  },
  {
    category: "Calibration",
    title: "Why calibration traceability is the foundation of ISO/IEC 17025 audits",
    date: "2 August 2026 - 04.14 PM",
    image: PLACEHOLDER_IMAGE,
  },
  {
    category: "NVH",
    title: "From lab to road: real-condition NVH measurement with modular DAQ",
    date: "2 August 2026 - 04.14 PM",
    image: PLACEHOLDER_IMAGE,
  },
];

export function LatestInsight() {
  return (
    <section id="insights" className="w-full scroll-mt-16 py-8">
      <SectionContainer className="flex w-full flex-col gap-10 text-left">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div className="flex flex-col items-start gap-4">
            <SectionTagline>LATEST INSIGHT</SectionTagline>
            <SectionTitle>Engineering notes & product updates</SectionTitle>
          </div>
          <a
            href="#"
            className="flex shrink-0 items-center gap-2 border border-primary px-4 py-2 text-sm font-semibold text-brand-ink transition-colors hover:bg-primary hover:text-white"
          >
            View All
            <ArrowRightIcon size={14} />
          </a>
        </div>

        <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-3">
          {LATEST_INSIGHTS.map((insight) => (
            <InsightCard
              key={insight.title}
              image={insight.image}
              category={insight.category}
              title={insight.title}
              date={insight.date}
            />
          ))}
        </div>
      </SectionContainer>
    </section>
  );
}
