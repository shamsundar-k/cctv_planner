import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Circle,
  Crosshair,
  Map,
  Radio,
  Ruler,
  ShieldAlert,
  Signal,
} from "lucide-react";
import { useMemo } from "react";
import { themeOptions } from "../styles/theme";
import { useTheme } from "../styles/useTheme";

const statusCards = [
  {
    label: "Online",
    value: "28",
    tone: "success",
    icon: CheckCircle2,
  },
  {
    label: "Warnings",
    value: "3",
    tone: "warning",
    icon: AlertTriangle,
  },
  {
    label: "Offline",
    value: "1",
    tone: "error",
    icon: ShieldAlert,
  },
  {
    label: "Measured",
    value: "486 m",
    tone: "info",
    icon: Ruler,
  },
] as const;

const tokenGroups = [
  {
    label: "Action",
    tokens: [
      { name: "Primary", className: "bg-primary text-primary-foreground" },
      { name: "Secondary", className: "bg-secondary text-secondary-foreground" },
      { name: "Disabled", className: "bg-disabled text-disabled-foreground" },
    ],
  },
  {
    label: "Map Objects",
    tokens: [
      {
        name: "Camera",
        className: "bg-camera-marker text-camera-marker-foreground",
      },
      {
        name: "Selected",
        className: "bg-selected-camera text-selected-camera-foreground",
      },
      {
        name: "Reference",
        className: "bg-reference-point text-reference-point-foreground",
      },
      {
        name: "Distance",
        className: "bg-distance-line text-distance-line-foreground",
      },
    ],
  },
  {
    label: "Status",
    tokens: [
      { name: "Success", className: "bg-success text-success-foreground" },
      { name: "Warning", className: "bg-warning text-warning-foreground" },
      { name: "Error", className: "bg-error text-error-foreground" },
      { name: "Info", className: "bg-info text-info-foreground" },
    ],
  },
] as const;

const statusToneClasses = {
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  error: "bg-error text-error-foreground",
  info: "bg-info text-info-foreground",
} as const;

function cssVar(name: string) {
  return `var(${name})`;
}

export default function UITest() {
  const { theme, setTheme } = useTheme();
  const currentTheme = useMemo(
    () => themeOptions.find((item) => item.id === theme)?.label ?? theme,
    [theme],
  );

  return (
    <main className="min-h-screen bg-background p-4 text-foreground sm:p-6 lg:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-lg border border-panel-border bg-panel p-5 text-panel-foreground shadow-sm">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-text-muted">
                  <Radio className="h-4 w-4 text-primary" />
                  CCTV theme system
                </div>
                <h1 className="text-3xl font-semibold tracking-normal text-text-primary sm:text-4xl">
                  Surveillance workspace preview
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
                  A compact view for validating camera planning surfaces,
                  controls, map markers, coverage overlays, alerts, and text
                  hierarchy against the shared CCTV theme tokens.
                </p>
              </div>

              <div className="rounded-md border border-panel-border bg-background p-3">
                <p className="mb-2 text-xs font-semibold uppercase text-text-muted">
                  Active theme
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
                  {themeOptions.map((item) => {
                    const selected = item.id === theme;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setTheme(item.id)}
                        aria-pressed={selected}
                        className={`min-h-10 rounded-md border px-3 text-left text-sm font-medium transition-colors ${
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-panel-border bg-panel text-text-secondary hover:border-primary hover:text-text-primary"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <aside className="rounded-lg border border-panel-border bg-panel p-5 text-panel-foreground shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-text-muted">Theme</p>
                <p className="text-2xl font-semibold text-text-primary">
                  {currentTheme}
                </p>
              </div>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-camera-marker text-camera-marker-foreground">
                <Camera className="h-6 w-6" />
              </span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Metric label="Coverage" value="82%" />
              <Metric label="Blind zones" value="4" />
              <Metric label="IR range" value="36 m" />
              <Metric label="Health" value="96%" />
            </div>
          </aside>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statusCards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.label}
                className="rounded-lg border border-panel-border bg-panel p-4 text-panel-foreground shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-text-muted">{card.label}</p>
                    <p className="mt-1 text-3xl font-semibold text-text-primary">
                      {card.value}
                    </p>
                  </div>
                  <span
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-md ${statusToneClasses[card.tone]}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
              </article>
            );
          })}
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="overflow-hidden rounded-lg border border-panel-border bg-panel text-panel-foreground shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-divider px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Map className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">
                    Map Layer Preview
                  </h2>
                  <p className="text-sm text-text-muted">
                    Object, overlay, and measurement tokens
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="inline-flex min-h-10 items-center gap-2 rounded-md bg-secondary px-3 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary-hover"
              >
                <Signal className="h-4 w-4" />
                Live
              </button>
            </div>

            <div className="relative min-h-[520px] bg-background">
              <div
                className="absolute inset-0 opacity-60"
                style={{
                  backgroundImage:
                    "linear-gradient(var(--app-divider) 1px, transparent 1px), linear-gradient(90deg, var(--app-divider) 1px, transparent 1px)",
                  backgroundSize: "56px 56px",
                }}
              />

              <div
                className="absolute left-[14%] top-[18%] h-52 w-72 rounded-full border-2"
                style={{
                  backgroundColor: cssVar("--app-fov-fill"),
                  borderColor: cssVar("--app-fov-border"),
                  transform: "rotate(-20deg)",
                }}
              />
              <div
                className="absolute bottom-[16%] right-[18%] h-44 w-64 rounded-full border-2"
                style={{
                  backgroundColor: cssVar("--app-ir-fill"),
                  borderColor: cssVar("--app-ir-border"),
                  transform: "rotate(28deg)",
                }}
              />
              <div
                className="absolute right-[10%] top-[20%] h-40 w-48 rounded-full border-2"
                style={{
                  backgroundColor: cssVar("--app-blind-zone-fill"),
                  borderColor: cssVar("--app-blind-zone-border"),
                }}
              />

              <CameraPin className="left-[17%] top-[31%]" label="C1" />
              <CameraPin className="left-[46%] top-[45%]" label="C2" selected />
              <CameraPin className="right-[16%] top-[32%]" label="C3" warning />
              <CameraPin className="bottom-[22%] right-[28%]" label="C4" />

              <div className="absolute left-[25%] top-[54%] h-0.5 w-[44%] rotate-6 bg-distance-line" />
              <div className="absolute left-[41%] top-[53%] rounded bg-measurement-text px-2 py-1 text-xs font-semibold text-measurement-text-foreground">
                52.4 m
              </div>

              <div className="absolute bottom-4 left-4 right-4 grid gap-3 rounded-md border border-panel-border bg-panel/95 p-3 text-sm shadow-sm backdrop-blur md:grid-cols-3">
                <LegendItem
                  label="FOV"
                  color="var(--app-fov-border)"
                  fill="var(--app-fov-fill)"
                />
                <LegendItem
                  label="IR coverage"
                  color="var(--app-ir-border)"
                  fill="var(--app-ir-fill)"
                />
                <LegendItem
                  label="Blind zone"
                  color="var(--app-blind-zone-border)"
                  fill="var(--app-blind-zone-fill)"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <section className="rounded-lg border border-panel-border bg-panel p-5 text-panel-foreground shadow-sm">
              <h2 className="text-lg font-semibold text-text-primary">
                Controls
              </h2>
              <div className="mt-4 space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-text-secondary">
                    Camera name
                  </span>
                  <input
                    type="text"
                    defaultValue="Gatehouse PTZ-04"
                    className="mt-2 min-h-11 w-full rounded-md border border-panel-border bg-background px-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-subtle focus:border-primary"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-text-secondary">
                    Lens angle
                  </span>
                  <input
                    type="range"
                    defaultValue="68"
                    className="mt-3 w-full accent-primary"
                  />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
                  >
                    <Crosshair className="h-4 w-4" />
                    Place
                  </button>
                  <button
                    type="button"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-secondary px-4 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary-hover"
                  >
                    <Ruler className="h-4 w-4" />
                    Measure
                  </button>
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-panel-border bg-panel p-5 text-panel-foreground shadow-sm">
              <h2 className="text-lg font-semibold text-text-primary">
                Token Swatches
              </h2>
              <div className="mt-4 space-y-5">
                {tokenGroups.map((group) => (
                  <div key={group.label}>
                    <p className="mb-2 text-sm font-medium text-text-muted">
                      {group.label}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {group.tokens.map((token) => (
                        <span
                          key={token.name}
                          className={`inline-flex min-h-9 items-center rounded-md px-3 text-sm font-semibold ${token.className}`}
                        >
                          {token.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-panel-border bg-background p-3">
      <p className="text-xs font-medium uppercase text-text-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold text-text-primary">{value}</p>
    </div>
  );
}

function CameraPin({
  className,
  label,
  selected,
  warning,
}: {
  className: string;
  label: string;
  selected?: boolean;
  warning?: boolean;
}) {
  const tone = warning
    ? "bg-warning text-warning-foreground"
    : selected
      ? "bg-selected-camera text-selected-camera-foreground"
      : "bg-camera-marker text-camera-marker-foreground";

  return (
    <div className={`absolute ${className}`}>
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full border-2 border-panel shadow-lg ${tone}`}
      >
        <Camera className="h-5 w-5" />
      </div>
      <div className="mt-1 rounded bg-panel px-2 py-0.5 text-center text-xs font-semibold text-text-primary shadow-sm">
        {label}
      </div>
    </div>
  );
}

function LegendItem({
  label,
  color,
  fill,
}: {
  label: string;
  color: string;
  fill: string;
}) {
  return (
    <div className="flex items-center gap-2 text-text-secondary">
      <Circle
        className="h-4 w-4"
        fill={fill}
        stroke={color}
        strokeWidth={3}
      />
      <span className="font-medium">{label}</span>
    </div>
  );
}
