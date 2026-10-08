import type { ReactNode } from "react";
import { LinkSchema } from "@compro/types";

/**
 * Renders the content Markdown subset — paragraphs, `-` lists, **bold**, *italic*,
 * [text](link) — straight to React elements. There is no HTML pass-through anywhere, so
 * content cannot inject markup, and links go through the same allowlist the API enforces.
 */
const INLINE = /\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const match of text.matchAll(INLINE)) {
    const index = match.index ?? 0;
    if (index > last) nodes.push(text.slice(last, index));
    const [, bold, italic, label, href] = match;
    if (bold !== undefined) {
      nodes.push(<strong key={key++}>{renderInline(bold)}</strong>);
    } else if (italic !== undefined) {
      nodes.push(<em key={key++}>{renderInline(italic)}</em>);
    } else if (LinkSchema.safeParse(href).success) {
      const external = href.startsWith("https://");
      nodes.push(
        <a
          key={key++}
          href={href}
          className="text-brand-ink underline underline-offset-2 hover:no-underline"
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {label}
        </a>,
      );
    } else {
      nodes.push(label); // unsafe or malformed link: keep the words, drop the link
    }
    last = index + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function Markdown({ source }: { source: string }) {
  const blocks = source
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <div className="flex flex-col gap-4 text-base leading-relaxed text-muted-ink">
      {blocks.map((block, index) => {
        const lines = block.split("\n");
        if (lines.every((line) => /^[-*]\s+/.test(line))) {
          return (
            <ul key={index} className="list-disc space-y-1 pl-5">
              {lines.map((line, i) => (
                <li key={i}>{renderInline(line.replace(/^[-*]\s+/, ""))}</li>
              ))}
            </ul>
          );
        }
        return <p key={index}>{renderInline(lines.join(" "))}</p>;
      })}
    </div>
  );
}
