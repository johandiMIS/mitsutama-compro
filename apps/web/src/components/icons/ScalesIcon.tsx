import { ScalesBalanced } from "@gravity-ui/icons";
import type { IconProps } from "./icon-props";

export function ScalesIcon({ size = 16, color = "currentColor" }: IconProps) {
  return <ScalesBalanced width={size} height={size} style={{ color }} />;
}
