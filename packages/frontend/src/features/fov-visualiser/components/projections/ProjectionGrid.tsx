import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridColumns, GridRows } from "@visx/grid";
import type { ProjectionRenderContext } from "./ProjectionPanel";

const GRID_INTERVAL_METRES = 5;

function getGridTickValues(
  scale: ProjectionRenderContext["xScale"],
): number[] {
  const [domainStart, domainEnd] = scale.domain().map(Number);
  const minimum = Math.min(domainStart, domainEnd);
  const maximum = Math.max(domainStart, domainEnd);
  const firstTick =
    Math.ceil(minimum / GRID_INTERVAL_METRES) * GRID_INTERVAL_METRES;
  const lastTick =
    Math.floor(maximum / GRID_INTERVAL_METRES) * GRID_INTERVAL_METRES;
  const tickValues: number[] = [];

  for (
    let value = firstTick;
    value <= lastTick + Number.EPSILON;
    value += GRID_INTERVAL_METRES
  ) {
    tickValues.push(value);
  }

  return tickValues;
}

function formatTick(value: number): string {
  const absolute = Math.abs(value);
  if (absolute < 0.0001) return "0";
  if (absolute >= 100) return value.toFixed(0);
  if (absolute >= 10) return value.toFixed(1).replace(/\.0$/, "");
  return value.toFixed(1).replace(/\.0$/, "");
}

export default function ProjectionGrid({
  width,
  height,
  margins,
  innerWidth,
  innerHeight,
  xScale,
  yScale,
}: ProjectionRenderContext) {
  const xTickValues = getGridTickValues(xScale);
  const yTickValues = getGridTickValues(yScale);
  const tickLabel = {
    fill: "var(--app-text-muted)",
    fontSize: 10,
  } as const;

  return (
    <>
      <GridColumns
        left={margins.left}
        top={margins.top}
        scale={xScale}
        height={innerHeight}
        tickValues={xTickValues}
        stroke="var(--app-divider)"
        strokeWidth={1}
        pointerEvents="none"
      />
      <GridRows
        left={margins.left}
        top={margins.top}
        scale={yScale}
        width={innerWidth}
        tickValues={yTickValues}
        stroke="var(--app-divider)"
        strokeWidth={1}
        pointerEvents="none"
      />
      <AxisBottom
        left={margins.left}
        top={margins.top + innerHeight}
        scale={xScale}
        tickValues={xTickValues}
        tickFormat={(value) => formatTick(Number(value))}
        stroke="var(--app-text-subtle)"
        tickStroke="var(--app-text-subtle)"
        tickLabelProps={() => ({ ...tickLabel, textAnchor: "middle" })}
      />
      <AxisLeft
        left={margins.left}
        top={margins.top}
        scale={yScale}
        tickValues={yTickValues}
        tickFormat={(value) => formatTick(Number(value))}
        stroke="var(--app-text-subtle)"
        tickStroke="var(--app-text-subtle)"
        tickLabelProps={() => ({ ...tickLabel, textAnchor: "end", dx: -3 })}
      />
      <text
        x={width - 8}
        y={height - 6}
        textAnchor="end"
        fill="var(--app-text-muted)"
        fontSize={10}
      >
        m
      </text>
      <text
        x={8}
        y={12}
        fill="var(--app-text-muted)"
        fontSize={10}
      >
        m
      </text>
    </>
  );
}
