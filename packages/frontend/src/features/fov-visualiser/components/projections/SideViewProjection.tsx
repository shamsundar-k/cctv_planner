import { useId } from "react";
import type {
  InstallationValues,
  ProjectionGeometry,
} from "../../types";
import AngleMarker from "./AngleMarker";
import DimensionMarker from "./DimensionMarker";
import type { ProjectionRenderContext } from "./ProjectionPanel";

interface SideViewProjectionProps {
  context: ProjectionRenderContext;
  geometry: ProjectionGeometry;
  installation: InstallationValues;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function rayHeight(
  cameraHeight: number,
  distance: number,
  angle: number,
): number {
  return cameraHeight - distance * Math.tan(toRadians(angle));
}

export default function SideViewProjection({
  context,
  geometry,
  installation,
}: SideViewProjectionProps) {
  const rawId = useId();
  const markerId = `side-dimension-${rawId.replaceAll(":", "")}`;
  const hatchId = `ground-hatch-${rawId.replaceAll(":", "")}`;
  const { calculation, verticalTarget } = geometry;
  const xDomain = context.xScale.domain();
  const visibleEndDistance = Number(xDomain[1]);
  const cameraX = context.xScale(0);
  const cameraY = context.yScale(installation.mountingHeight);
  const groundY = context.yScale(0);
  const targetX = context.xScale(installation.targetDistance);
  const targetTopY = context.yScale(verticalTarget.topHeight);
  const targetBottomY = context.yScale(verticalTarget.bottomHeight);
  const rayEndX = context.xScale(visibleEndDistance);
  const topRayEndY = context.yScale(
    rayHeight(
      installation.mountingHeight,
      visibleEndDistance,
      calculation.top_ray_angle,
    ),
  );
  const bottomRayEndY = context.yScale(
    rayHeight(
      installation.mountingHeight,
      visibleEndDistance,
      verticalTarget.bottomRayAngle,
    ),
  );
  const centerRayEndY = context.yScale(
    rayHeight(
      installation.mountingHeight,
      visibleEndDistance,
      calculation.tilt_angle,
    ),
  );
  const sceneDimensionX = targetX;
  const mountingDimensionX = Math.max(10, cameraX - 28);
  const angleRadius = Math.min(
    42,
    Math.max(22, Math.abs(targetX - cameraX) * 0.2),
  );
  const statusLabel =
    calculation.status === "valid_dfar_capped"
      ? "Far range capped at 500 m"
      : calculation.status === "valid_partial_target"
        ? "Partial target coverage"
        : null;

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
        <pattern
          id={hatchId}
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="6"
            stroke="var(--app-text-subtle)"
            strokeWidth="1"
          />
        </pattern>
      </defs>

      <polygon
        points={`${cameraX},${cameraY} ${targetX},${targetTopY} ${targetX},${targetBottomY}`}
        fill="var(--app-fov-fill)"
        stroke="none"
      />
      <line
        x1={cameraX}
        y1={cameraY}
        x2={rayEndX}
        y2={topRayEndY}
        stroke="var(--app-fov-border)"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
      <line
        x1={cameraX}
        y1={cameraY}
        x2={rayEndX}
        y2={bottomRayEndY}
        stroke="var(--app-fov-border)"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
      <line
        x1={cameraX}
        y1={cameraY}
        x2={rayEndX}
        y2={centerRayEndY}
        stroke="var(--app-fov-border)"
        strokeWidth={1.25}
        strokeDasharray="6 5"
        vectorEffect="non-scaling-stroke"
      />
      <line
        x1={cameraX}
        y1={cameraY}
        x2={rayEndX}
        y2={cameraY}
        stroke="var(--app-text-muted)"
        strokeWidth={1}
        strokeDasharray="6 5"
        vectorEffect="non-scaling-stroke"
      />

      <rect
        x={Math.max(0, context.xScale(0))}
        y={groundY}
        width={Math.max(context.innerWidth - Math.max(0, context.xScale(0)), 0)}
        height={8}
        fill={`url(#${hatchId})`}
      />
      <line
        x1={Math.max(0, context.xScale(0))}
        y1={groundY}
        x2={context.innerWidth}
        y2={groundY}
        stroke="var(--app-text-secondary)"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
      <line
        x1={targetX}
        y1={targetTopY}
        x2={targetX}
        y2={targetBottomY}
        stroke="var(--app-distance-line)"
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
      />

      <AngleMarker
        x={cameraX}
        y={cameraY}
        radius={angleRadius}
        startAngle={Math.min(0, calculation.tilt_angle)}
        endAngle={Math.max(0, calculation.tilt_angle)}
        label={`Tilt ${calculation.tilt_angle.toFixed(1)}°`}
        labelRadius={angleRadius + 20}
        labelDx={16}
        labelDy={-20}
      />
      <AngleMarker
        x={cameraX}
        y={cameraY}
        radius={angleRadius + 14}
        startAngle={calculation.top_ray_angle}
        endAngle={verticalTarget.bottomRayAngle}
        label={`${calculation.v_angle.toFixed(1)}°`}
        labelRadius={angleRadius + 34}
        labelDx={18}
        labelDy={-4}
      />

      <DimensionMarker
        x1={mountingDimensionX}
        y1={cameraY}
        x2={mountingDimensionX}
        y2={groundY}
        label={`${installation.mountingHeight.toFixed(1)} m`}
        markerId={markerId}
        labelDx={-8}
        labelDy={3}
        textAnchor="end"
      />
      <DimensionMarker
        x1={sceneDimensionX}
        y1={targetTopY}
        x2={sceneDimensionX}
        y2={targetBottomY}
        label={`${verticalTarget.sceneHeight.toFixed(1)} m`}
        markerId={markerId}
        labelDx={8}
        labelDy={3}
        textAnchor="start"
      />
      <line
        x1={cameraX - 12}
        y1={groundY}
        x2={cameraX - 12}
        y2={cameraY}
        stroke="var(--app-text-secondary)"
        strokeWidth={4}
        vectorEffect="non-scaling-stroke"
      />
      <g
        transform={`translate(${cameraX} ${cameraY}) rotate(${calculation.tilt_angle})`}
      >
        <line
          x1={-18}
          y1={0}
          x2={-10}
          y2={0}
          stroke="var(--app-text-secondary)"
          strokeWidth={4}
          vectorEffect="non-scaling-stroke"
        />
        <rect
          x={-10}
          y={-7}
          width={24}
          height={14}
          rx={4}
          fill="var(--app-text-secondary)"
          stroke="var(--app-text-primary)"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
        <circle
          cx={14}
          cy={0}
          r={5}
          fill="var(--app-panel)"
          stroke="var(--app-text-primary)"
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
        />
      </g>

      {statusLabel && (
        <text
          x={context.innerWidth - 8}
          y={16}
          textAnchor="end"
          fill="var(--app-warning)"
          stroke="var(--app-background)"
          strokeWidth={4}
          paintOrder="stroke"
          fontSize={10}
          fontWeight={700}
        >
          {statusLabel}
        </text>
      )}
    </g>
  );
}
