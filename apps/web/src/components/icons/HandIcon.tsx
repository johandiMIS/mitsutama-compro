import { HandStop } from "@gravity-ui/icons";
import type { IconProps } from "./icon-props";

export function HandIcon({ size = 16, color = "currentColor" }: IconProps) {
  return <HandStop width={size} height={size} style={{ color }} />;
}
