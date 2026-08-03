import type { IconProps } from "./icon-props";

export function MenuIcon({ size = 22, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7H20M4 12H20M4 17H20" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
