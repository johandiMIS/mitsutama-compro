import Link from "next/link";
import type { NavMenuGroup, NavMenuItem } from "./nav-links";

/** Tailwind needs the column count as a literal class, so the supported widths are enumerated. */
const GRID_COLUMNS: Record<number, string> = {
  2: "grid grid-cols-2 gap-x-8",
  3: "grid grid-cols-3 gap-x-8",
};

/**
 * Spread groups over `columns`, keeping each group whole.
 * With no more groups than columns each gets its own column (Services: two groups, two columns);
 * beyond that, columns are filled to the average height (Products: five groups over three).
 */
function balanceIntoColumns(groups: NavMenuGroup[], columns: number): NavMenuGroup[][] {
  if (groups.length <= columns) return groups.map((group) => [group]);

  const weightOf = (group: NavMenuGroup) => group.items.length + 1; // +1 for the heading row
  const target = groups.reduce((sum, group) => sum + weightOf(group), 0) / columns;
  const result: NavMenuGroup[][] = Array.from({ length: columns }, () => []);

  let column = 0;
  let filled = 0;
  for (const group of groups) {
    if (filled >= target && column < columns - 1) {
      column += 1;
      filled = 0;
    }
    result[column].push(group);
    filled += weightOf(group);
  }
  return result;
}

function chunk<T>(items: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, i) =>
    items.slice(i * size, (i + 1) * size),
  );
}

function GroupHeading({ children }: { children: string }) {
  return (
    <p className="text-xs uppercase tracking-[0.08em] text-muted-ink">{children}</p>
  );
}

function ItemList({ items, onNavigate }: { items: NavMenuItem[]; onNavigate?: () => void }) {
  return (
    <ul className="flex flex-col gap-[14px]">
      {/* Keyed by index: the supplied menu content repeats one label. */}
      {items.map((item, index) => (
        <li key={`${item.label}-${index}`}>
          <Link
            href={item.href}
            onClick={onNavigate}
            className="text-[13px] font-semibold text-foreground transition-colors hover:text-brand-ink"
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function NavMegaMenu({
  groups,
  columns,
  onNavigate,
}: {
  groups: NavMenuGroup[];
  columns: number;
  onNavigate?: () => void;
}) {
  const grid = GRID_COLUMNS[columns] ?? GRID_COLUMNS[3];

  // A lone group keeps one heading above the whole block and flows its items down the columns,
  // rather than repeating the heading per column.
  if (groups.length === 1) {
    const [group] = groups;
    return (
      <div className="flex flex-col gap-4">
        <GroupHeading>{group.title}</GroupHeading>
        <div className={grid}>
          {chunk(group.items, Math.ceil(group.items.length / columns)).map((items, index) => (
            <ItemList key={index} items={items} onNavigate={onNavigate} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={grid}>
      {balanceIntoColumns(groups, columns).map((columnGroups, index) => (
        <div key={index} className="flex flex-col gap-7">
          {columnGroups.map((group) => (
            <div key={group.title} className="flex flex-col gap-4">
              <GroupHeading>{group.title}</GroupHeading>
              <ItemList items={group.items} onNavigate={onNavigate} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
