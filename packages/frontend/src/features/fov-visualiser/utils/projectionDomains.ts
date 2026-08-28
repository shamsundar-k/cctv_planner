import type {
  DoriOverlayGeometry,
  InstallationValues,
  ProjectionDomains,
  ProjectionGeometry,
} from "../types";

const DEFAULT_HORIZONTAL_RANGE_METRES = 50;
const DEFAULT_TOP_VIEW_HALF_RANGE_METRES = 40;
const TOP_VIEW_CAMERA_MARGIN_METRES = 10;
const SIDE_VIEW_CAMERA_MARGIN_METRES = 10;
const SIDE_VIEW_VERTICAL_RANGE_METRES = 15;

export function deriveProjectionDomains(
  geometries: ProjectionGeometry[],
  installation: InstallationValues,
  doriGeometry: DoriOverlayGeometry | null = null,
): ProjectionDomains {
  const topX: [number, number] = [
    -TOP_VIEW_CAMERA_MARGIN_METRES,
    DEFAULT_HORIZONTAL_RANGE_METRES,
  ];
  const sideX: [number, number] = [
    -SIDE_VIEW_CAMERA_MARGIN_METRES,
    DEFAULT_HORIZONTAL_RANGE_METRES,
  ];

  const halfSceneWidth = Math.max(
    ...geometries.map(
      ({ calculation }) => (calculation.w_target ?? 0) / 2,
    ),
    0.5,
  );
  const sideMaximumDistance = Math.max(
    installation.targetDistance,
    doriGeometry?.maxDrawableDistance ?? 0,
  );
  const topY: [number, number] = [
    -DEFAULT_TOP_VIEW_HALF_RANGE_METRES,
    DEFAULT_TOP_VIEW_HALF_RANGE_METRES,
  ];

  const sideY: [number, number] = [0, SIDE_VIEW_VERTICAL_RANGE_METRES];
  const sideContentTop = Math.max(
    installation.mountingHeight,
    ...geometries.map(({ verticalTarget }) => verticalTarget.topHeight),
  );

  return {
    topX,
    sideX,
    topY,
    sideY,
    topContentBounds: {
      x: [0, installation.targetDistance],
      y: [-halfSceneWidth, halfSceneWidth],
    },
    sideContentBounds: {
      x: [0, sideMaximumDistance],
      y: [0, sideContentTop],
    },
  };
}
