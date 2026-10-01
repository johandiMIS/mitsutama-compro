import type { Metadata } from "next";
import Link from "next/link";

/**
 * The admin panel is a separate shell from the marketing site: no TopNav, no Footer,
 * and explicitly noindex'd so it never turns up in search results.
 */
export const metadata: Metadata = {
  title: "Admin · Mitsutama",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-black/[.08] dark:border-white/[.145]">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/admin/hero" className="text-base font-semibold">
            Mitsutama <span className="text-brand-ink">Admin</span>
          </Link>
          <Link
            href="/"
            className="text-sm font-semibold text-muted-ink transition-colors hover:text-brand-ink"
          >
            View site
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
