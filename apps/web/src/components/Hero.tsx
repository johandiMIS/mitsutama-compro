export function Hero() {
  return (
    <section className="flex w-full flex-col items-center gap-6 px-6 py-24 text-center sm:py-32">
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-black sm:text-5xl dark:text-zinc-50">
        [Company Name]
      </h1>
      <p className="max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
        Replace this with your company&apos;s tagline — a short line describing what you do and
        who you do it for.
      </p>
      <a
        href="mailto:hello@example.com"
        className="mt-2 flex h-12 items-center justify-center rounded-full bg-primary px-8 text-base font-medium text-white transition-colors hover:bg-primary-hover"
      >
        Get in Touch
      </a>
    </section>
  );
}
