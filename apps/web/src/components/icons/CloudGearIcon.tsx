import { CloudGear } from "@gravity-ui/icons";
import type { IconProps } from "./icon-props";

export function CloudGearIcon({ size = 16, color = "currentColor" }: IconProps) {
  return <CloudGear width={size} height={size} style={{ color }} />;
}
