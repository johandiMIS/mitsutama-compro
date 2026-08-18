"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({
  href,
  children,
  onClick,
  onMouseEnter,
  onLightSurface,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  onMouseEnter?: () => void;
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
      onMouseEnter={onMouseEnter}
      aria-current={isActive ? "page" : undefined}
      className={
        onLightSurface
          ? isActive
            ? "font-semibold text-primary underline underline-offset-4"
            : "text-black transition-colors hover:text-primary"
          : isActive
            ? "px-2 py-[22px] font-semibold text-primary shadow-[inset_0_2px_0_0_var(--color-primary)]"
            : "px-2 py-[22px] text-black transition-colors hover:text-primary dark:text-zinc-50"
      }
    >
      {children}
    </Link>
  );
}
