import { ChevronDown } from "lucide-react";

export function NavDropdownTrigger({
  label,
  onLightSurface,
}: {
  label: string;
  /** Set when the trigger sits on a fixed light background (e.g. MobileNav's gray panel) —
   * see NavLink's onLightSurface for why. */
  onLightSurface?: boolean;
}) {
  return (
    <button
      type="button"
      aria-haspopup="true"
      aria-expanded="false"
      className={
        onLightSurface
          ? "flex items-center gap-1 text-black transition-colors hover:text-primary"
          : "flex items-center gap-1 px-2 py-[22px] text-black transition-colors hover:text-primary dark:text-zinc-50"
      }
    >
      {label}
      <ChevronDown className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
