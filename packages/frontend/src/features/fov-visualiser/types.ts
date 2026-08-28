import type { FovCartesian } from "@/lib/fovCalculations";

export interface InstallationValues {
  focalLength: number;
  mountingHeight: number;
  targetDistance: number;
  targetHeight: number;
}

export type InstallationField = keyof InstallationValues;

export interface NumericBounds {
  min: number;
  max: number;
  step: number;
}

export interface CoverageResults {
  horizontalFov: number;
  verticalFov: number;
  sceneWidth: number;
  sceneHeight: number;
  deadZone: number;
}

export interface VerticalTargetGeometry {
  topHeight: number;
  bottomHeight: number;
  sceneHeight: number;
  bottomRayAngle: number;
}

export interface ProjectionGeometry {
  calculation: FovCartesian;
  verticalTarget: VerticalTargetGeometry;
}

export type ProjectionDomain = [number, number];

export interface ProjectionContentBounds {
  x: ProjectionDomain;
  y: ProjectionDomain;
}

export interface ProjectionDomains {
  topX: ProjectionDomain;
  sideX: ProjectionDomain;
  topY: ProjectionDomain;
  sideY: ProjectionDomain;
  topContentBounds: ProjectionContentBounds;
  sideContentBounds: ProjectionContentBounds;
}

export type DoriLevel = "identify" | "recognize" | "observe" | "detect";

export interface DoriBoundary {
  level: DoriLevel;
  threshold: number;
  maximumDistance: number;
}

export interface DoriRegion {
  level: DoriLevel;
  threshold: number;
  startDistance: number;
  endDistance: number;
}

export interface DoriOverlayGeometry {
  boundaries: readonly DoriBoundary[];
  regions: readonly DoriRegion[];
  maxDrawableDistance: number;
}
