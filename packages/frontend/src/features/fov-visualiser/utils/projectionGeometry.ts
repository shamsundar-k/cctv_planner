import type { FovCartesian } from "@/lib/fovCalculations";
import type {
  InstallationValues,
  VerticalTargetGeometry,
} from "../types";

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function deriveVerticalTargetGeometry(
  calculation: FovCartesian,
  installation: InstallationValues,
): VerticalTargetGeometry | null {
  const bottomRayAngle = calculation.top_ray_angle + calculation.v_angle;
  const topHeight =
    installation.mountingHeight -
    installation.targetDistance * Math.tan(toRadians(calculation.top_ray_angle));
  const bottomHeight =
    installation.mountingHeight -
    installation.targetDistance * Math.tan(toRadians(bottomRayAngle));
  const sceneHeight = topHeight - bottomHeight;

  if (
    !Number.isFinite(topHeight) ||
    !Number.isFinite(bottomHeight) ||
    !Number.isFinite(sceneHeight) ||
    sceneHeight < 0
  ) {
    return null;
  }

  return {
    topHeight,
    bottomHeight,
    sceneHeight,
    bottomRayAngle,
  };
}
