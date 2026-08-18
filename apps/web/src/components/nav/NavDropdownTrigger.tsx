import { ChevronDownIcon } from "@/components/icons/ChevronDownIcon";

export function NavDropdownTrigger({
  label,
  onLightSurface,
  open = false,
  panelId,
  onClick,
  onMouseEnter,
}: {
  label: string;
  /** Set when the trigger sits on a fixed light background (e.g. MobileNav's gray panel) —
   * see NavLink's onLightSurface for why. */
  onLightSurface?: boolean;
  /** Desktop only: whether this trigger's mega-menu is showing. */
  open?: boolean;
  panelId?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
}) {
  return (
    <button
      type="button"
      aria-haspopup="true"
      aria-expanded={open}
      aria-controls={panelId}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={
        onLightSurface
          ? "flex items-center gap-1 text-black transition-colors hover:text-primary"
          : `flex items-center gap-1 px-2 py-[22px] transition-colors ${
              open
                ? "text-primary shadow-[inset_0_2px_0_0_var(--color-primary)]"
                : "text-black hover:text-primary dark:text-zinc-50"
            }`
      }
    >
      {label}
      {/* IconProps carries no className, so the flip lives on a wrapper. */}
      <span
        aria-hidden="true"
        className={`inline-flex transition-transform ${open ? "rotate-180" : ""}`}
      >
        <ChevronDownIcon />
      </span>
    </button>
  );
}
