"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { adminApi } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/navigation", label: "Menu groups" },
  { href: "/admin/hero", label: "Hero images" },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    try {
      await adminApi.session.logout();
    } finally {
      router.replace("/admin/login");
    }
  }

  // The login screen has no session to show tabs for.
  if (pathname === "/admin/login") return null;

  return (
    <nav aria-label="Admin" className="flex items-center gap-5 text-sm">
      {TABS.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "font-semibold transition-colors hover:text-brand-ink",
              active ? "text-brand-ink" : "text-muted-ink",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={() => void signOut()}
        className="font-semibold text-muted-ink transition-colors hover:text-brand-ink"
      >
        Sign out
      </button>
    </nav>
  );
}
