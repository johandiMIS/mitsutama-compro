import Image from "next/image";
import Link from "next/link";
import { SectionContainer } from "@/components/SectionContainer";
import { DesktopNav } from "./DesktopNav";
import { MobileNav } from "./MobileNav";
import { NavActions } from "./NavActions";

export function TopNav() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 shadow-[0_14px_28px_0_#00000014,0_-6px_12px_0_#00000008,0_2px_8px_0_#0000000F] backdrop-blur-[40px] dark:border-white/[.145]">
      <SectionContainer className="flex h-[64px] items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" className="shrink-0">
            <Image src="/logo.webp" alt="Company logo" width={612} height={127} className="h-[30.6px] w-[153px]" priority />
          </Link>
          <DesktopNav />
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden xs:flex">
            <NavActions />
          </div>
          <MobileNav />
        </div>
      </SectionContainer>
    </header>
  );
}
