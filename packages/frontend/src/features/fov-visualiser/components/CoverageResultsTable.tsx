import type { CoverageResults } from "../types";

interface CoverageResultsTableProps {
  results: CoverageResults | null;
  hasSelection: boolean;
  isGeometryInvalid: boolean;
}

function format(value: number | undefined, unit: string): string {
  return value == null || !Number.isFinite(value)
    ? "—"
    : `${value.toFixed(1)} ${unit}`;
}

export default function CoverageResultsTable({
  results,
  hasSelection,
  isGeometryInvalid,
}: CoverageResultsTableProps) {
  const metrics = [
    { label: "Horizontal FOV", value: format(results?.horizontalFov, "°") },
    { label: "Vertical FOV", value: format(results?.verticalFov, "°") },
    { label: "Scene width", value: format(results?.sceneWidth, "m") },
    { label: "Scene height", value: format(results?.sceneHeight, "m") },
    { label: "Dead zone", value: format(results?.deadZone, "m") },
  ];

  return (
    <section className="rounded-xl border border-panel-border bg-panel p-3.5 shadow-sm">
      <h2 className="text-base font-semibold text-panel-foreground">
        Coverage results
      </h2>

      <div className="mt-2.5 overflow-hidden rounded-lg border border-panel-border">
        <table className="w-full border-collapse text-xs">
          <thead className="bg-background text-text-secondary">
            <tr>
              <th className="px-2.5 py-1.5 text-left font-medium">Metric</th>
              <th className="px-2.5 py-1.5 text-right font-medium">Value</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric) => (
              <tr key={metric.label} className="border-t border-divider">
                <td className="px-2.5 py-1.5 text-text-secondary">
                  {metric.label}
                </td>
                <td className="px-2.5 py-1.5 text-right font-semibold text-primary">
                  {metric.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p
        className={`mt-2 text-[10px] leading-4 ${isGeometryInvalid ? "text-error" : "text-text-muted"}`}
        role={isGeometryInvalid ? "alert" : undefined}
      >
        {isGeometryInvalid
          ? "The current camera and target heights do not produce ground coverage."
          : hasSelection
            ? "Results update as installation values change."
            : "Select a camera model to calculate coverage."}
      </p>
    </section>
  );
}
