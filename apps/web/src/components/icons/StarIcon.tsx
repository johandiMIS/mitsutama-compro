import { Star } from "@gravity-ui/icons";
import type { IconProps } from "./icon-props";

export function StarIcon({ size = 16, color = "currentColor" }: IconProps) {
  return <Star width={size} height={size} style={{ color }} />;
}
