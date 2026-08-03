import Link from "next/link";
import { SearchIcon } from "../icons/SearchIcon";
import { UkFlagIcon } from "../icons/UkFlagIcon";

export function NavActions() {
  return (
    <div className="hidden items-center gap-3 lg:flex">
      <button
        type="button"
        aria-label="Switch language"
        className="flex h-10 w-10 items-center justify-center bg-surface"
      >
        <UkFlagIcon size={18} />
      </button>
      <button
        type="button"
        aria-label="Search"
        className="flex h-10 w-10 items-center justify-center bg-surface"
      >
        <SearchIcon size={18} color="#171717" />
      </button>
      <Link
        href="#contact"
        className="flex h-10 items-center justify-center bg-primary px-6 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
      >
        Contact Us
      </Link>
    </div>
  );
}
