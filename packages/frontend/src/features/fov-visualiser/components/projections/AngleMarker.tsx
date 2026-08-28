import { Arc } from "@visx/shape";

interface AngleMarkerProps {
  x: number;
  y: number;
  radius: number;
  startAngle: number;
  endAngle: number;
  label: string;
  color?: string;
  labelRadius?: number;
  labelDx?: number;
  labelDy?: number;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export default function AngleMarker({
  x,
  y,
  radius,
  startAngle,
  endAngle,
  label,
  color = "var(--app-primary)",
  labelRadius = radius + 16,
  labelDx = 0,
  labelDy = 0,
}: AngleMarkerProps) {
  const middleAngle = (startAngle + endAngle) / 2;
  const labelX = Math.cos(toRadians(middleAngle)) * labelRadius;
  const labelY = Math.sin(toRadians(middleAngle)) * labelRadius;

  return (
    <g transform={`translate(${x} ${y})`} pointerEvents="none">
      <Arc
        innerRadius={Math.max(radius - 1, 0)}
        outerRadius={radius + 1}
        startAngle={toRadians(startAngle + 90)}
        endAngle={toRadians(endAngle + 90)}
        fill={color}
      />
      <text
        x={labelX + labelDx}
        y={labelY + labelDy}
        dy="0.35em"
        textAnchor="middle"
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
