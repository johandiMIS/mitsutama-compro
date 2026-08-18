import { Check } from "@gravity-ui/icons";
import type { IconProps } from "./icon-props";

export function CheckIcon({ size = 16, color = "currentColor" }: IconProps) {
  return <Check width={size} height={size} style={{ color }} />;
}
