import type { z } from "zod";
import type { TextImageSchema } from "@compro/types";
import { cn } from "@/lib/utils";
import { Block } from "./Block";
import { BlockImage } from "./BlockImage";
import { Markdown } from "./markdown";

type Props = z.output<typeof TextImageSchema>;

export function TextImageBlock({ id, title, body, image, imageSide }: Props) {
  return (
    <Block id={id} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div className={cn("flex flex-col gap-4", imageSide === "left" && "lg:order-2")}>
        {title ? (
          <h2 className="text-[31px] font-semibold tracking-tight text-foreground">{title}</h2>
        ) : null}
        <Markdown source={body} />
      </div>
      <BlockImage image={image} />
    </Block>
  );
}
