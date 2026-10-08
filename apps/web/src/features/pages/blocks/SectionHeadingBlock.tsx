import type { z } from "zod";
import type { SectionHeadingSchema } from "@compro/types";
import { Block } from "./Block";
import { BlockHeading } from "./Heading";

type Props = z.output<typeof SectionHeadingSchema>;

export function SectionHeadingBlock({ id, tagline, title, intro }: Props) {
  return (
    <Block id={id} className="py-10">
      <BlockHeading tagline={tagline} title={title} intro={intro} />
    </Block>
  );
}
