import { ChevronDownIcon } from "@/components/icons/ChevronDownIcon";

export function NavDropdownTrigger({
  label,
  open = false,
  panelId,
  onClick,
  onMouseEnter,
}: {
  label: string;
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
      className={`flex items-center gap-1 px-2 py-[22px] transition-colors ${
        open
          ? "text-brand-ink shadow-[inset_0_2px_0_0_var(--color-primary)]"
          : "text-foreground hover:text-brand-ink"
      }`}
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
