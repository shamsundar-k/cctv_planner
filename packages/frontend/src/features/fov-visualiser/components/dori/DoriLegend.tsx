import { DORI_DEFINITIONS } from "../../utils/doriGeometry";

export default function DoriLegend() {
  return (
    <ul
      className="flex flex-wrap items-center gap-x-3 gap-y-1"
      aria-label="DORI pixel density legend"
    >
      {DORI_DEFINITIONS.map((definition) => (
        <li
          key={definition.level}
          className="flex items-center gap-1.5 text-[11px] text-text-secondary"
        >
          <span
            className="h-2.5 w-2.5 rounded-sm border"
            style={{
              backgroundColor: `var(--app-dori-${definition.level}-fill)`,
              borderColor: `var(--app-dori-${definition.level}-border)`,
            }}
            aria-hidden="true"
          />
          <span>
            {definition.label} {definition.threshold} px/m
          </span>
        </li>
      ))}
    </ul>
  );
}
