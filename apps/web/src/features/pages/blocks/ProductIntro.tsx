import type { z } from "zod";
import type { ProductIntroSchema } from "@compro/types";
import { cn } from "@/lib/utils";
import { Block } from "./Block";
import { BlockImage } from "./BlockImage";
import { BlockHeading } from "./Heading";

type Props = z.output<typeof ProductIntroSchema>;

export function ProductIntro({ id, tagline, title, paragraphs, image, imageSide }: Props) {
  return (
    <Block id={id} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div className={cn("flex flex-col gap-6", image && imageSide === "left" && "lg:order-2")}>
        <BlockHeading tagline={tagline} title={title} />
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="text-base leading-relaxed text-muted-ink">
            {paragraph}
          </p>
        ))}
      </div>
      {image ? <BlockImage image={image} fit="object-contain" /> : null}
    </Block>
  );
}
