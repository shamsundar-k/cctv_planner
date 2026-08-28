import { Focus, MoveHorizontal, Ruler, ScanLine } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { INSTALLATION_BOUNDS } from "../hooks/useFovVisualiser";
import type {
  InstallationField,
  InstallationValues,
  NumericBounds,
} from "../types";

interface CameraConfigurationProps {
  values: InstallationValues;
  focalBounds: NumericBounds;
  focalDisabled: boolean;
  focalFixed: boolean;
  onChange: (field: InstallationField, value: number) => void;
}

interface ConfigurationRow {
  field: InstallationField;
  label: string;
  unit: string;
  icon: LucideIcon;
}

const configurationRows: ConfigurationRow[] = [
  { field: "focalLength", label: "Focal length", unit: "mm", icon: Focus },
  { field: "mountingHeight", label: "Mounting height", unit: "m", icon: Ruler },
  {
    field: "targetDistance",
    label: "Target distance",
    unit: "m",
    icon: MoveHorizontal,
  },
  { field: "targetHeight", label: "Target height", unit: "m", icon: ScanLine },
];

function restoreInvalidInput(
  event: React.FocusEvent<HTMLInputElement>,
  value: number,
) {
  if (!Number.isFinite(event.currentTarget.valueAsNumber)) {
    event.currentTarget.value = String(value);
  }
}

export default function CameraConfiguration({
  values,
  focalBounds,
  focalDisabled,
  focalFixed,
  onChange,
}: CameraConfigurationProps) {
  return (
    <section className="rounded-xl border border-panel-border bg-panel p-3.5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-panel-foreground">Configure</h2>
        {focalFixed && (
          <span className="rounded bg-divider px-1.5 py-0.5 text-[9px] font-semibold uppercase text-text-muted">
            Fixed lens
          </span>
        )}
      </div>

      <div className="mt-3 space-y-4">
        {configurationRows.map(({ field, label, unit, icon: Icon }) => {
          const bounds =
            field === "focalLength" ? focalBounds : INSTALLATION_BOUNDS[field];
          const disabled =
            field === "focalLength" && (focalDisabled || focalFixed);
          const inputId = `fov-${field}`;

          return (
            <div
              key={field}
              className="grid grid-cols-[28px_minmax(0,1fr)] gap-2.5"
            >
              <span
                className="mt-0.5 flex size-7 items-center justify-center rounded-md border border-panel-border text-primary"
                aria-hidden="true"
              >
                <Icon size={14} />
              </span>

              <div className="min-w-0">
                <label
                  htmlFor={`${inputId}-number`}
                  className="text-xs text-text-secondary"
                >
                  {label}
                </label>
                <div className="mt-1.5 flex items-center gap-2">
                  <input
                    id={`${inputId}-range`}
                    type="range"
                    aria-label={`${label} slider`}
                    min={bounds.min}
                    max={bounds.max}
                    step={bounds.step}
                    value={values[field]}
                    disabled={disabled}
                    onChange={(event) =>
                      onChange(field, event.currentTarget.valueAsNumber)
                    }
                    className="h-1 min-w-0 flex-1 cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-45"
                  />
                  <span className="flex w-[76px] shrink-0 items-center gap-1.5">
                    <input
                      id={`${inputId}-number`}
                      type="number"
                      min={bounds.min}
                      max={bounds.max}
                      step={bounds.step}
                      value={values[field]}
                      disabled={disabled}
                      onChange={(event) => {
                        const nextValue = event.currentTarget.valueAsNumber;
                        if (Number.isFinite(nextValue)) {
                          onChange(field, nextValue);
                        }
                      }}
                      onBlur={(event) =>
                        restoreInvalidInput(event, values[field])
                      }
                      className="h-8 min-w-0 flex-1 rounded-md border border-panel-border bg-background px-1.5 text-right text-xs font-medium text-text-primary outline-none transition-colors hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground"
                    />
                    <span className="text-[10px] text-text-muted">
                      {unit}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
