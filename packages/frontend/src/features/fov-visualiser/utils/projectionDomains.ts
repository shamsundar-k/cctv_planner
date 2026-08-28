import type {
  InstallationValues,
  ProjectionDomains,
  ProjectionGeometry,
} from "../types";

const DEFAULT_HORIZONTAL_RANGE_METRES = 50;
const DEFAULT_TOP_VIEW_HALF_RANGE_METRES = 40;
const CAMERA_MARGIN_METRES = 1;
const SIDE_VIEW_VERTICAL_RANGE_METRES = 15;

export function deriveProjectionDomains(
  geometries: ProjectionGeometry[],
  installation: InstallationValues,
): ProjectionDomains {
  const deadZone = Math.max(
    ...geometries.map(({ calculation }) => calculation.d_near ?? 0),
  );
  const horizontalExtent = Math.max(
    DEFAULT_HORIZONTAL_RANGE_METRES,
    installation.targetDistance,
    deadZone,
  );
  const overflowPadding =
    horizontalExtent > DEFAULT_HORIZONTAL_RANGE_METRES
      ? Math.max(horizontalExtent * 0.05, CAMERA_MARGIN_METRES)
      : 0;
  const x: [number, number] = [
    -CAMERA_MARGIN_METRES,
    horizontalExtent + overflowPadding,
  ];

  const halfSceneWidth = Math.max(
    ...geometries.map(
      ({ calculation }) => (calculation.w_target ?? 0) / 2,
    ),
    0.5,
  );
  const topViewHalfExtent = Math.max(
    DEFAULT_TOP_VIEW_HALF_RANGE_METRES,
    Math.ceil((halfSceneWidth * 1.1) / 5) * 5,
  );
  const topY: [number, number] = [-topViewHalfExtent, topViewHalfExtent];

  const sideY: [number, number] = [0, SIDE_VIEW_VERTICAL_RANGE_METRES];

  return { x, topY, sideY };
}
