import { useId } from "react";
import type { DoriOverlayGeometry } from "../../types";
import {
  DORI_DEFINITIONS,
  clipDoriRegionsToDomain,
} from "../../utils/doriGeometry";
import type { ProjectionRenderContext } from "./ProjectionPanel";

interface TopViewDoriOverlayProps {
  context: ProjectionRenderContext;
  geometry: DoriOverlayGeometry;
  horizontalFov: number;
  maximumDistance: number;
}

export default function TopViewDoriOverlay({
  context,
  geometry,
  horizontalFov,
  maximumDistance,
}: TopViewDoriOverlayProps) {
  const rawId = useId();
  const coneClipId = `top-dori-cone-${rawId.replaceAll(":", "")}`;
  const halfAngleTangent = Math.tan((horizontalFov * Math.PI) / 360);
  const xDomain = context.xScale.domain().map(Number);
  const overlayEndDistance = Math.min(
    geometry.maxDrawableDistance,
    maximumDistance,
  );
  const clippedDomain: [number, number] = [
    Math.min(...xDomain),
    Math.min(Math.max(...xDomain), overlayEndDistance),
  ];
  const regions = clipDoriRegionsToDomain(geometry.regions, clippedDomain);
  const cameraX = context.xScale(0);
  const cameraY = context.yScale(0);
  const coneEndDistance = overlayEndDistance;
  const coneEndX = context.xScale(coneEndDistance);
  const coneHalfWidth = coneEndDistance * halfAngleTangent;

  return (
    <g pointerEvents="none">
      <defs>
        <clipPath id={coneClipId}>
          <polygon
            points={`${cameraX},${cameraY} ${coneEndX},${context.yScale(coneHalfWidth)} ${coneEndX},${context.yScale(-coneHalfWidth)}`}
          />
        </clipPath>
      </defs>
      <g clipPath={`url(#${coneClipId})`}>
        {regions.map((region) => {
          const definition = DORI_DEFINITIONS.find(
            ({ level }) => level === region.level,
          );
          const calculatedRegion = geometry.regions.find(
            ({ level }) => level === region.level,
          );
          const endsAtCalculatedBoundary =
            calculatedRegion != null &&
            Math.abs(region.endDistance - calculatedRegion.endDistance) < 1e-9;
          const startX = context.xScale(region.startDistance);
          const endX = context.xScale(region.endDistance);
          const startHalfWidth = region.startDistance * halfAngleTangent;
          const endHalfWidth = region.endDistance * halfAngleTangent;
          const bandWidth = Math.abs(endX - startX);

          return (
            <g key={region.level}>
              <polygon
                points={`${startX},${context.yScale(startHalfWidth)} ${endX},${context.yScale(endHalfWidth)} ${endX},${context.yScale(-endHalfWidth)} ${startX},${context.yScale(-startHalfWidth)}`}
                fill={`var(--app-dori-${region.level}-fill)`}
              />
              {endsAtCalculatedBoundary && (
                <line
                  x1={endX}
                  y1={context.yScale(endHalfWidth)}
                  x2={endX}
                  y2={context.yScale(-endHalfWidth)}
                  stroke={`var(--app-dori-${region.level}-border)`}
                  strokeWidth={1.25}
                  strokeDasharray="4 3"
                  vectorEffect="non-scaling-stroke"
                />
              )}
              {definition && bandWidth >= 34 && (
                <text
                  x={(startX + endX) / 2}
                  y={cameraY - 5}
                  textAnchor="middle"
                  fill="var(--app-text-primary)"
                  stroke="var(--app-background)"
                  strokeWidth={3}
                  paintOrder="stroke"
                  fontSize={9}
                  fontWeight={700}
                >
                  {bandWidth >= 76 ? definition.label : definition.abbreviation}
                </text>
              )}
            </g>
          );
        })}
      </g>
    </g>
  );
}
