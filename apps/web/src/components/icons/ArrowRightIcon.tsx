import { ArrowRight } from "@gravity-ui/icons";
import type { IconProps } from "./icon-props";

export function ArrowRightIcon({ size = 16, color = "currentColor" }: IconProps) {
  return <ArrowRight width={size} height={size} style={{ color }} />;
}
