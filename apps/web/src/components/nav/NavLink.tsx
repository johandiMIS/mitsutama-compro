"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({
  href,
  children,
  onClick,
  onMouseEnter,
  inMobilePanel,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  onMouseEnter?: () => void;
  /** Set when the link sits in MobileNav's stacked panel rather than the desktop bar: it drops
   * the bar's tall hit area and swaps the inset top rule for an underline. Colours are identical
   * either way — the panel is `bg-background`, so it follows the theme like the bar does. */
  inMobilePanel?: boolean;
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
        inMobilePanel
          ? isActive
            ? "font-semibold text-brand-ink underline underline-offset-4"
            : "text-foreground transition-colors hover:text-brand-ink"
          : isActive
            ? "px-2 py-[22px] font-semibold text-brand-ink shadow-[inset_0_2px_0_0_var(--color-primary)]"
            : "px-2 py-[22px] text-foreground transition-colors hover:text-brand-ink"
      }
    >
      {children}
    </Link>
  );
}
