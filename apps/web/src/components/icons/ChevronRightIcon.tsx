import { ChevronRight } from "@gravity-ui/icons";
import type { IconProps } from "./icon-props";

export function ChevronRightIcon({ size = 16, color = "currentColor" }: IconProps) {
  return <ChevronRight width={size} height={size} style={{ color }} />;
}
