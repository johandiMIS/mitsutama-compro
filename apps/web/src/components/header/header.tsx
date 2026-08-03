import Link from "next/link";
import { PhoneIcon } from "../icons/PhoneIcon";
import { UserIcon } from "../icons/UserIcon";

export function Header() {
  return (
    <div className="w-full bg-zinc-900 text-white">
      <div className="mx-auto flex h-10 w-full max-w-[1920px] items-center justify-between px-6 text-sm sm:px-10 lg:px-16">
        <a href="tel:+10000000000" className="flex items-center gap-2 hover:opacity-80">
          <PhoneIcon />
          <span className="hidden sm:inline">[Phone Number]</span>
        </a>
        <Link href="/login" className="flex items-center gap-2 hover:opacity-80">
          <UserIcon />
          <span>Login</span>
        </Link>
      </div>
    </div>
  );
}
