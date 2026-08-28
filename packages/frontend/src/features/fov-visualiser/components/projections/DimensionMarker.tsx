interface DimensionMarkerProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  markerId: string;
  color?: string;
  labelDx?: number;
  labelDy?: number;
  textAnchor?: "start" | "middle" | "end";
}

export default function DimensionMarker({
  x1,
  y1,
  x2,
  y2,
  label,
  markerId,
  color = "var(--app-primary)",
  labelDx = 0,
  labelDy = -7,
  textAnchor = "middle",
}: DimensionMarkerProps) {
  return (
    <g pointerEvents="none">
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={1.25}
        markerStart={`url(#${markerId})`}
        markerEnd={`url(#${markerId})`}
        vectorEffect="non-scaling-stroke"
      />
      <text
        x={(x1 + x2) / 2 + labelDx}
        y={(y1 + y2) / 2 + labelDy}
        textAnchor={textAnchor}
        fill={color}
        stroke="var(--app-background)"
        strokeWidth={4}
        paintOrder="stroke"
        fontSize={11}
        fontWeight={700}
      >
        {label}
      </text>
    </g>
  );
}
