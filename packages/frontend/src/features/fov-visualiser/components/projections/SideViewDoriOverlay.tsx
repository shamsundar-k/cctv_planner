import { useId } from "react";
import type {
  DoriOverlayGeometry,
  ProjectionGeometry,
} from "../../types";
import {
  DORI_DEFINITIONS,
  clipDoriRegionsToDomain,
} from "../../utils/doriGeometry";
import type { ProjectionRenderContext } from "./ProjectionPanel";

interface SideViewDoriOverlayProps {
  context: ProjectionRenderContext;
  doriGeometry: DoriOverlayGeometry;
  projectionGeometry: ProjectionGeometry;
  mountingHeight: number;
}

function rayHeight(
  cameraHeight: number,
  distance: number,
  angle: number,
): number {
  return cameraHeight - distance * Math.tan((angle * Math.PI) / 180);
}

export default function SideViewDoriOverlay({
  context,
  doriGeometry,
  projectionGeometry,
  mountingHeight,
}: SideViewDoriOverlayProps) {
  const rawId = useId();
  const stableId = rawId.replaceAll(":", "");
  const coneClipId = `side-dori-cone-${stableId}`;
  const groundClipId = `side-dori-ground-${stableId}`;
  const { calculation, verticalTarget } = projectionGeometry;
  const cameraX = context.xScale(0);
  const cameraY = context.yScale(mountingHeight);
  const groundY = context.yScale(0);
  const coneEndDistance = doriGeometry.maxDrawableDistance;
  const coneEndX = context.xScale(coneEndDistance);
  const topRayEndY = context.yScale(
    rayHeight(mountingHeight, coneEndDistance, calculation.top_ray_angle),
  );
  const bottomRayEndY = context.yScale(
    rayHeight(
      mountingHeight,
      coneEndDistance,
      verticalTarget.bottomRayAngle,
    ),
  );
  const regions = clipDoriRegionsToDomain(
    doriGeometry.regions,
    context.xScale.domain() as [number, number],
  );

  return (
    <g pointerEvents="none">
      <defs>
        <clipPath id={coneClipId}>
          <polygon
            points={`${cameraX},${cameraY} ${coneEndX},${topRayEndY} ${coneEndX},${bottomRayEndY}`}
          />
        </clipPath>
        <clipPath id={groundClipId}>
          <rect
            x={0}
            y={0}
            width={context.innerWidth}
            height={Math.max(0, Math.min(groundY, context.innerHeight))}
          />
        </clipPath>
      </defs>
      <g clipPath={`url(#${groundClipId})`}>
        <g clipPath={`url(#${coneClipId})`}>
          {regions.map((region) => {
            const definition = DORI_DEFINITIONS.find(
              ({ level }) => level === region.level,
            );
            const startX = context.xScale(region.startDistance);
            const endX = context.xScale(region.endDistance);
            const bandWidth = Math.abs(endX - startX);

            return (
              <g key={region.level}>
                <rect
                  x={Math.min(startX, endX)}
                  y={0}
                  width={bandWidth}
                  height={context.innerHeight}
                  fill={`var(--app-dori-${region.level}-fill)`}
                />
                <line
                  x1={endX}
                  y1={0}
                  x2={endX}
                  y2={context.innerHeight}
                  stroke={`var(--app-dori-${region.level}-border)`}
                  strokeWidth={1.25}
                  strokeDasharray="4 3"
                  vectorEffect="non-scaling-stroke"
                />
                {definition && bandWidth >= 34 && (
                  <text
                    x={(startX + endX) / 2}
                    y={Math.max(12, Math.min(groundY - 6, cameraY + 26))}
                    textAnchor="middle"
                    fill="var(--app-text-primary)"
                    stroke="var(--app-background)"
                    strokeWidth={3}
                    paintOrder="stroke"
                    fontSize={9}
                    fontWeight={700}
                  >
                    {bandWidth >= 76
                      ? definition.label
                      : definition.abbreviation}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </g>
    </g>
  );
}
