import Image from "next/image";
import Link from "next/link";
import { SectionContainer } from "@/components/SectionContainer";
import { DesktopNav } from "./DesktopNav";
import { MobileNav } from "./MobileNav";
import { NavActions } from "./NavActions";

export function TopNav() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur dark:border-white/[.145]">
      <SectionContainer className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" className="shrink-0">
            <Image src="/logo.webp" alt="Company logo" width={611} height={128} className="h-10 w-auto" priority />
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
