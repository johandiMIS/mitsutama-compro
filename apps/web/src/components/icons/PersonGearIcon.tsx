import { PersonGear } from "@gravity-ui/icons";
import type { IconProps } from "./icon-props";

export function PersonGearIcon({ size = 16, color = "currentColor" }: IconProps) {
  return <PersonGear width={size} height={size} style={{ color }} />;
}
