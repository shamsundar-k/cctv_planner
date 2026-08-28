import type {
  DoriBoundary,
  DoriLevel,
  DoriOverlayGeometry,
  DoriRegion,
  ProjectionDomain,
} from "../types";

export interface DoriDefinition {
  readonly level: DoriLevel;
  readonly label: string;
  readonly abbreviation: string;
  readonly threshold: number;
}

export const DORI_DISTANCE_CAP_METRES = 500;

export const DORI_DEFINITIONS: readonly DoriDefinition[] = Object.freeze([
  { level: "identify", label: "Identification", abbreviation: "I", threshold: 250 },
  { level: "recognize", label: "Recognition", abbreviation: "R", threshold: 125 },
  { level: "observe", label: "Observation", abbreviation: "O", threshold: 62.5 },
  { level: "detect", label: "Detection", abbreviation: "D", threshold: 25 },
]);

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function deriveDoriOverlayGeometry(
  horizontalResolution: number | null | undefined,
  horizontalFov: number | null | undefined,
): DoriOverlayGeometry | null {
  if (
    horizontalResolution == null ||
    horizontalFov == null ||
    !Number.isFinite(horizontalResolution) ||
    !Number.isFinite(horizontalFov) ||
    horizontalResolution <= 0 ||
    horizontalFov <= 0 ||
    horizontalFov >= 180
  ) {
    return null;
  }

  const halfAngleTangent = Math.tan(toRadians(horizontalFov / 2));
  if (!Number.isFinite(halfAngleTangent) || halfAngleTangent <= 0) {
    return null;
  }

  const boundaries: DoriBoundary[] = DORI_DEFINITIONS.map((definition) => ({
    level: definition.level,
    threshold: definition.threshold,
    maximumDistance:
      horizontalResolution / (2 * definition.threshold * halfAngleTangent),
  }));

  if (
    boundaries.some(
      (boundary) =>
        !Number.isFinite(boundary.maximumDistance) ||
        boundary.maximumDistance <= 0,
    )
  ) {
    return null;
  }

  const detectionBoundary = boundaries.at(-1);
  if (!detectionBoundary) return null;

  const maxDrawableDistance = Math.min(
    detectionBoundary.maximumDistance,
    DORI_DISTANCE_CAP_METRES,
  );
  const regions: DoriRegion[] = [];
  let startDistance = 0;

  for (const boundary of boundaries) {
    const endDistance = Math.min(
      boundary.maximumDistance,
      maxDrawableDistance,
    );

    if (endDistance > startDistance) {
      regions.push({
        level: boundary.level,
        threshold: boundary.threshold,
        startDistance,
        endDistance,
      });
    }

    startDistance = endDistance;
    if (startDistance >= maxDrawableDistance) break;
  }

  return {
    boundaries,
    regions,
    maxDrawableDistance,
  };
}

export function clipDoriRegionToDomain(
  region: DoriRegion,
  xDomain: ProjectionDomain,
): DoriRegion | null {
  const domainMinimum = Math.max(0, Math.min(...xDomain));
  const domainMaximum = Math.max(...xDomain);
  const startDistance = Math.max(region.startDistance, domainMinimum);
  const endDistance = Math.min(region.endDistance, domainMaximum);

  return endDistance > startDistance
    ? { ...region, startDistance, endDistance }
    : null;
}

export function clipDoriRegionsToDomain(
  regions: readonly DoriRegion[],
  xDomain: ProjectionDomain,
): DoriRegion[] {
  return regions.flatMap((region) => {
    const clippedRegion = clipDoriRegionToDomain(region, xDomain);
    return clippedRegion ? [clippedRegion] : [];
  });
}
