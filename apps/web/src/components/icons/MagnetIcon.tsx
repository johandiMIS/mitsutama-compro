import { Magnet } from "@gravity-ui/icons";
import type { IconProps } from "./icon-props";

export function MagnetIcon({ size = 16, color = "currentColor" }: IconProps) {
  return <Magnet width={size} height={size} style={{ color }} />;
}
