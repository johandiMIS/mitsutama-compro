import Link from "next/link";
import { SearchIcon } from "../icons/SearchIcon";
import { UkFlagIcon } from "../icons/UkFlagIcon";

export function NavActions() {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <button
        type="button"
        aria-label="Switch language"
        className="flex h-9 w-9 items-center justify-center bg-surface"
      >
        <UkFlagIcon size={18} />
      </button>
      <button
        type="button"
        aria-label="Search"
        className="flex h-9 w-9 items-center justify-center bg-surface"
      >
        <SearchIcon size={18} color="#171717" />
      </button>
      <Link
        href="#contact"
        className="flex h-9 items-center justify-center bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary-hover sm:px-6"
      >
        Contact<span className="hidden sm:inline">&nbsp;Us</span>
      </Link>
    </div>
  );
}
