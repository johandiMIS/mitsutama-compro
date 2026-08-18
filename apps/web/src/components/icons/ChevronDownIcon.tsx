import { ChevronDown } from "@gravity-ui/icons";
import type { IconProps } from "./icon-props";

export function ChevronDownIcon({ size = 16, color = "currentColor" }: IconProps) {
  return <ChevronDown width={size} height={size} style={{ color }} />;
}
