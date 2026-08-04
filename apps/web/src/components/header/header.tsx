import Link from "next/link";
import { SectionContainer } from "@/components/SectionContainer";
import { ArrowRightToSquareIcon } from "../icons/ArrowRightToSquareIcon";
import { PhoneIcon } from "../icons/PhoneIcon";

export function Header() {
    return (
        <div className="w-full bg-zinc-900 text-white">
            <SectionContainer className="flex h-8 items-center justify-end gap-3 text-sm">
                <a href="tel:+10000000000" className="flex items-center gap-2 hover:opacity-80">
                    <PhoneIcon />
                    <span>021-5927050</span>
                </a>
                <p>|</p>
                <Link href="/login" className="flex items-center gap-2 hover:opacity-80">
                    <ArrowRightToSquareIcon />
                    <span>Login</span>
                </Link>
            </SectionContainer>
        </div>
    );
}
