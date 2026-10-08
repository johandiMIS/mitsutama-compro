import type { z } from "zod";
import type { RichTextSchema } from "@compro/types";
import { Block } from "./Block";
import { Markdown } from "./markdown";

type Props = z.output<typeof RichTextSchema>;

export function RichTextBlock({ id, body }: Props) {
  return (
    <Block id={id} className="py-8">
      <div className="max-w-3xl">
        <Markdown source={body} />
      </div>
    </Block>
  );
}
