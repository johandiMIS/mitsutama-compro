import { About } from "@/components/About";
import { ContactCta } from "@/components/ContactCta";
import { Hero } from "@/components/Hero";
import { Partners } from "@/components/Partners";
import { Services } from "@/components/Services";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center bg-background">
      <Hero />
      <Partners />
      <About />
      <Services />
      <ContactCta />
    </div>
  );
}
