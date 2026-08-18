import Link from "next/link";
import { PhoneIcon } from "../icons/PhoneIcon";
import { SearchIcon } from "../icons/SearchIcon";
import { UkFlagIcon } from "../icons/UkFlagIcon";

/** Shared square-button chrome — the mobile menu toggle reuses it so the header's three
 * buttons (language, search, toggle) read as one set. */
export const NAV_ICON_BUTTON =
  "flex h-9 w-9 items-center justify-center border border-black/20 bg-surface";

/** Language + search. Rendered in the header at every width. */
export function NavIconActions() {
  return (
    <>
      <button type="button" aria-label="Switch language" className={NAV_ICON_BUTTON}>
        <UkFlagIcon size={18} />
      </button>
      <button type="button" aria-label="Search" className={NAV_ICON_BUTTON}>
        <SearchIcon size={18} color="#171717" />
      </button>
    </>
  );
}

/** Sits in the header on desktop, at the foot of the panel on mobile. */
export function NavContactButton({ onClick }: { onClick?: () => void }) {
  return (
    <Link
      href="#contact"
      onClick={onClick}
      className="inline-flex h-11 items-center justify-center gap-2 bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-hover lg:h-9"
    >
      <PhoneIcon size={14} color="#ffffff" />
      Contact&nbsp;Us
    </Link>
  );
}

export function NavActions() {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <NavIconActions />
      <NavContactButton />
    </div>
  );
}
