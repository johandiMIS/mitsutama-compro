import Image from "next/image";
import Link from "next/link";
import { SectionContainer } from "@/components/SectionContainer";
import { DesktopNav } from "./DesktopNav";
import { MobileNav } from "./MobileNav";
import { NavActions } from "./NavActions";

export function TopNav() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 shadow-[0_14px_28px_0_#00000014,0_-6px_12px_0_#00000008,0_2px_8px_0_#0000000F] backdrop-blur-[40px] dark:border-b dark:border-white/[.145] dark:shadow-none">
      <SectionContainer className="flex h-[64px] items-center justify-between">
        <div className="flex items-center gap-10">
          {/* The wordmark is near-black ink, so it needs a real light-inked twin on dark. Both
              are rendered and one is hidden per theme; `logo-dark.png` is the file used *in* dark
              mode (i.e. the light-inked one), at the same dimensions as the original. */}
          <Link href="/" className="shrink-0">
            <Image
              src="/logo.png"
              alt="Mitsutama Indo Teknik"
              width={612}
              height={123}
              className="h-[31px] w-auto dark:hidden"
              priority
            />
            <Image
              src="/logo-dark.png"
              alt=""
              aria-hidden="true"
              width={612}
              height={123}
              className="hidden h-[31px] w-auto dark:block"
              priority
            />
          </Link>
          <DesktopNav />
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex">
            <NavActions />
          </div>
          <MobileNav />
        </div>
      </SectionContainer>
    </header>
  );
}
