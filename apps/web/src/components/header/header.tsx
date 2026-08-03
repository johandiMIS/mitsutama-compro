import Link from "next/link";
import { ArrowRightToSquareIcon } from "../icons/ArrowRightToSquareIcon";
import { PhoneIcon } from "../icons/PhoneIcon";

export function Header() {
    return (
        <div className="w-full bg-zinc-900 text-white">
            <div className="mx-auto flex h-8 w-full max-w-[1920px] items-center justify-end px-6 text-sm sm:px-10 lg:px-16 gap-3">
                <a href="tel:+10000000000" className="flex items-center gap-2 hover:opacity-80">
                    <PhoneIcon />
                    <span className="hidden sm:inline">021-5927050</span>
                </a>
                <p>|</p>
                <Link href="/login" className="flex items-center gap-2 hover:opacity-80">
                    <ArrowRightToSquareIcon />
                    <span>Login</span>
                </Link>
            </div>
        </div>
    );
}
