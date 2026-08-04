import { SectionContainer } from "@/components/SectionContainer";

const PLACEHOLDER_SERVICES = [
  {
    title: "Service One",
    description: "Replace with a short description of this service and the value it provides.",
  },
  {
    title: "Service Two",
    description: "Replace with a short description of this service and the value it provides.",
  },
  {
    title: "Service Three",
    description: "Replace with a short description of this service and the value it provides.",
  },
];

export function Services() {
  return (
    <section
      id="services"
      className="w-full scroll-mt-16 py-20"
    >
      <SectionContainer className="flex flex-col items-center gap-10">
        <h2 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Our Services
        </h2>
        <div className="grid w-full max-w-4xl gap-6 sm:grid-cols-3">
          {PLACEHOLDER_SERVICES.map((service) => (
            <div
              key={service.title}
              className="flex flex-col gap-2 rounded-2xl border border-black/[.08] p-6 dark:border-white/[.145]"
            >
              <h3 className="text-lg font-medium text-black dark:text-zinc-50">
                {service.title}
              </h3>
              <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </SectionContainer>
    </section>
  );
}
