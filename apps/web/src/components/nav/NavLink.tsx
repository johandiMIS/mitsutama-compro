"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({
  href,
  children,
  onClick,
  onLightSurface,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  /** Set when the link sits on a fixed light background (e.g. MobileNav's gray panel) —
   * omits `dark:text-zinc-50`, which would otherwise fire from the OS's prefers-color-scheme
   * regardless of this panel's own fixed (non-theme-following) background. */
  onLightSurface?: boolean;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={
        isActive
          ? "font-medium text-primary underline underline-offset-4"
          : onLightSurface
            ? "text-black transition-colors hover:text-primary"
            : "text-black transition-colors hover:text-primary dark:text-zinc-50"
      }
    >
      {children}
    </Link>
  );
}
