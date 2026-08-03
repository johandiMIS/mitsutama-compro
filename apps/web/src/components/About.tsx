export function About() {
  return (
    <section
      id="about"
      className="flex w-full scroll-mt-16 flex-col items-center gap-4 border-t border-black/[.08] px-6 py-20 text-center dark:border-white/[.145]"
    >
      <h2 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
        About Us
      </h2>
      <p className="max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
        Replace this paragraph with a short company description — your mission, how long
        you&apos;ve been operating, and what makes you different from the rest.
      </p>
    </section>
  );
}
