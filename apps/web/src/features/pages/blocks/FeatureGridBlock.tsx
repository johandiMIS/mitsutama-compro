import type { z } from "zod";
import type { FeatureGridSchema } from "@compro/types";
import { Block } from "./Block";

type Props = z.output<typeof FeatureGridSchema>;

export function FeatureGridBlock({ id, items }: Props) {
  return (
    <Block id={id} className="py-10">
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <li
            key={index}
            className="flex flex-col gap-2 rounded-lg border border-black/[.08] p-6 dark:border-white/[.145]"
          >
            <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
            <p className="text-sm leading-relaxed text-muted-ink">{item.text}</p>
          </li>
        ))}
      </ul>
    </Block>
  );
}
