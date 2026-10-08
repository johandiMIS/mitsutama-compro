import type { z } from "zod";
import type { SpecTableSchema } from "@compro/types";
import { Block } from "./Block";

type Props = z.output<typeof SpecTableSchema>;

export function SpecTableBlock({ id, title, rows }: Props) {
  return (
    <Block id={id} className="py-10">
      {title ? (
        <h2 className="mb-6 text-[31px] font-semibold tracking-tight text-foreground">{title}</h2>
      ) : null}
      <div className="overflow-x-auto rounded-lg border border-black/[.08] dark:border-white/[.145]">
        <table className="w-full text-left text-sm">
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={index}
                className="border-b border-black/[.08] last:border-b-0 dark:border-white/[.145]"
              >
                <th scope="row" className="w-1/3 bg-surface/50 px-4 py-3 font-semibold text-foreground">
                  {row.label}
                </th>
                <td className="px-4 py-3 text-muted-ink">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Block>
  );
}
