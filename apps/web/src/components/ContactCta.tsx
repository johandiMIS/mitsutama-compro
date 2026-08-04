import { SectionContainer } from "@/components/SectionContainer";

export function ContactCta() {
  return (
    <section
      id="contact"
      className="w-full scroll-mt-16 py-20"
    >
      <SectionContainer className="flex flex-col items-center gap-6 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Ready to work together?
        </h2>
        <p className="max-w-xl text-base text-zinc-600 dark:text-zinc-400">
          Replace this with a closing call-to-action, then swap the link below for a real contact
          page or form once one exists.
        </p>
        <a
          href="mailto:hello@example.com"
          className="flex h-12 items-center justify-center rounded-full bg-primary px-8 text-base font-medium text-white transition-colors hover:bg-primary-hover"
        >
          Contact Us
        </a>
      </SectionContainer>
    </section>
  );
}
