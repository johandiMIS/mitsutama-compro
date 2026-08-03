"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
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
          : "text-black transition-colors hover:text-primary dark:text-zinc-50"
      }
    >
      {children}
    </Link>
  );
}
