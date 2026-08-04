import { GearBranches } from "@gravity-ui/icons";
import type { IconProps } from "./icon-props";

export function GearBranchesIcon({ size = 16, color = "currentColor" }: IconProps) {
  return <GearBranches width={size} height={size} style={{ color }} />;
}
