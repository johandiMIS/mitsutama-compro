import { Bulb } from "@gravity-ui/icons";
import type { IconProps } from "./icon-props";

export function LightbulbIcon({ size = 16, color = "currentColor" }: IconProps) {
  return <Bulb width={size} height={size} style={{ color }} />;
}
