import { useId } from "react";
import type {
  InstallationValues,
  ProjectionGeometry,
} from "../../types";
import AngleMarker from "./AngleMarker";
import DimensionMarker from "./DimensionMarker";
import type { ProjectionRenderContext } from "./ProjectionPanel";

interface TopViewProjectionProps {
  context: ProjectionRenderContext;
  geometry: ProjectionGeometry;
  installation: InstallationValues;
}

export default function TopViewProjection({
  context,
  geometry,
  installation,
}: TopViewProjectionProps) {
  const rawId = useId();
  const markerId = `top-dimension-${rawId.replaceAll(":", "")}`;
  const { calculation } = geometry;
  const sceneWidth = calculation.w_target;

  if (sceneWidth == null) return null;

  const cameraX = context.xScale(0);
  const cameraY = context.yScale(0);
  const targetX = context.xScale(installation.targetDistance);
  const upperY = context.yScale(sceneWidth / 2);
  const lowerY = context.yScale(-sceneWidth / 2);
  const dimensionX = Math.min(context.innerWidth - 10, targetX + 28);
  const angleRadius = Math.min(
    46,
    Math.max(22, Math.abs(targetX - cameraX) * 0.28),
  );

  return (
    <g>
      <defs>
        <marker
          id={markerId}
          markerWidth="7"
          markerHeight="7"
          refX="3.5"
          refY="3.5"
          orient="auto-start-reverse"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L7,3.5 L0,7 Z" fill="var(--app-primary)" />
        </marker>
      </defs>

      <polygon
        points={`${cameraX},${cameraY} ${targetX},${upperY} ${targetX},${lowerY}`}
        fill="var(--app-fov-fill)"
        stroke="none"
      />
      <line
        x1={cameraX}
        y1={cameraY}
        x2={targetX}
        y2={upperY}
        stroke="var(--app-fov-border)"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
      <line
        x1={cameraX}
        y1={cameraY}
        x2={targetX}
        y2={lowerY}
        stroke="var(--app-fov-border)"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
      <line
        x1={cameraX}
        y1={cameraY}
        x2={targetX}
        y2={cameraY}
        stroke="var(--app-fov-border)"
        strokeWidth={1.25}
        strokeDasharray="6 5"
        vectorEffect="non-scaling-stroke"
      />
      <line
        x1={targetX}
        y1={upperY}
        x2={targetX}
        y2={lowerY}
        stroke="var(--app-distance-line)"
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
      />

      <AngleMarker
        x={cameraX}
        y={cameraY}
        radius={angleRadius}
        startAngle={-calculation.h_angle / 2}
        endAngle={calculation.h_angle / 2}
        label={`${calculation.h_angle.toFixed(1)}°`}
      />
      <DimensionMarker
        x1={dimensionX}
        y1={upperY}
        x2={dimensionX}
        y2={lowerY}
        label={`${sceneWidth.toFixed(1)} m`}
        markerId={markerId}
        labelDx={8}
        labelDy={3}
        textAnchor="start"
      />

      <text
        x={(cameraX + targetX) / 2}
        y={cameraY - 8}
        textAnchor="middle"
        fill="var(--app-primary)"
        stroke="var(--app-background)"
        strokeWidth={4}
        paintOrder="stroke"
        fontSize={10}
        fontWeight={600}
      >
        Target {installation.targetDistance.toFixed(1)} m
      </text>

      <g transform={`translate(${cameraX} ${cameraY})`}>
        <line
          x1={-22}
          y1={0}
          x2={-16}
          y2={0}
          stroke="var(--app-text-secondary)"
          strokeWidth={4}
          vectorEffect="non-scaling-stroke"
        />
        <rect
          x={-16}
          y={-7}
          width={22}
          height={14}
          rx={4}
          fill="var(--app-text-secondary)"
          stroke="var(--app-text-primary)"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
        <circle
          cx={6}
          cy={0}
          r={5}
          fill="var(--app-panel)"
          stroke="var(--app-text-primary)"
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
        />
      </g>
    </g>
  );
}
