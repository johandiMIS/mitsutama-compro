import { Persons } from "@gravity-ui/icons";
import type { IconProps } from "./icon-props";

export function PersonsIcon({ size = 16, color = "currentColor" }: IconProps) {
  return <Persons width={size} height={size} style={{ color }} />;
}
