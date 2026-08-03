import type { IconProps } from "./icon-props";

export function SearchIcon({ size = 18, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke={color} strokeWidth="1.8" />
      <path d="M21 21l-4.3-4.3" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
