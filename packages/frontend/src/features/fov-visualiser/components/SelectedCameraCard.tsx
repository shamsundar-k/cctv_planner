import { Camera, RefreshCw, TriangleAlert } from "lucide-react";
import { CameraSpecImage } from "@/features/camera-model";
import { deriveAspectRatioFromResolution } from "@/lib/aspectRatio";
import type { CameraSpecRecord } from "@/types/camera";

interface SelectedCameraCardProps {
  cameras: CameraSpecRecord[];
  manufacturers: string[];
  selectedManufacturer: string;
  selectedModelId: string;
  selectedModel: CameraSpecRecord | null;
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  onManufacturerChange: (manufacturer: string) => void;
  onModelChange: (modelId: string) => void;
  onRetry: () => void;
}

function LoadingState() {
  return (
    <div
      className="mt-3 grid grid-cols-[92px_minmax(0,1fr)] gap-3"
      aria-label="Loading camera models"
    >
      <div className="h-24 animate-pulse rounded-lg bg-divider" />
      <div className="space-y-2">
        <div className="h-9 animate-pulse rounded-lg bg-divider" />
        <div className="h-9 animate-pulse rounded-lg bg-divider" />
      </div>
    </div>
  );
}

function StatusMessage({
  isError,
  onRetry,
}: {
  isError: boolean;
  onRetry: () => void;
}) {
  return (
    <div
      className="mt-3 rounded-lg border border-panel-border bg-background p-3 text-xs text-text-secondary"
      role={isError ? "alert" : undefined}
    >
      <div className="flex items-start gap-2">
        {isError ? (
          <TriangleAlert
            size={16}
            className="mt-0.5 shrink-0 text-error"
            aria-hidden="true"
          />
        ) : (
          <Camera
            size={16}
            className="mt-0.5 shrink-0 text-text-muted"
            aria-hidden="true"
          />
        )}
        <p>
          {isError
            ? "Camera models could not be loaded."
            : "No bullet-camera models are available."}
        </p>
      </div>
      {isError && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 inline-flex h-8 items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-2.5 font-semibold text-primary transition-colors hover:bg-primary/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <RefreshCw size={13} aria-hidden="true" />
          Retry
        </button>
      )}
    </div>
  );
}

function formatFocalRange(camera: CameraSpecRecord): string {
  const { min, max } = camera.lens_spec.focal_length;
  return min === max ? `${min} mm` : `${min}–${max} mm`;
}

export default function SelectedCameraCard({
  cameras,
  manufacturers,
  selectedManufacturer,
  selectedModelId,
  selectedModel,
  isLoading,
  isError,
  isEmpty,
  onManufacturerChange,
  onModelChange,
  onRetry,
}: SelectedCameraCardProps) {
  const resolution = selectedModel?.sensor_spec.resolution;
  const aspectRatio = resolution
    ? deriveAspectRatioFromResolution(
        resolution.horizontal,
        resolution.vertical,
      )
    : null;

  return (
    <section className="rounded-xl border border-panel-border bg-panel p-3.5 shadow-sm">
      <h2 className="text-base font-semibold text-panel-foreground">
        Selected camera
      </h2>

      {isLoading ? (
        <LoadingState />
      ) : isError || isEmpty ? (
        <StatusMessage isError={isError} onRetry={onRetry} />
      ) : (
        <>
          <div className="mt-3 grid grid-cols-[92px_minmax(0,1fr)] items-end gap-3">
            {selectedModel ? (
              <CameraSpecImage
                camera={selectedModel}
                className="h-24 rounded-lg"
              />
            ) : (
              <div className="flex h-24 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-panel-border bg-background px-2 text-center text-text-muted">
                <Camera size={24} strokeWidth={1.5} aria-hidden="true" />
                <span className="text-[10px]">Choose a model</span>
              </div>
            )}

            <div className="min-w-0 space-y-2">
              <label className="block">
                <span className="mb-1 block text-[10px] font-semibold text-text-muted">
                  Manufacturer
                </span>
                <select
                  value={selectedManufacturer}
                  onChange={(event) =>
                    onManufacturerChange(event.target.value)
                  }
                  className="h-8 w-full cursor-pointer rounded-md border border-panel-border bg-background px-2 text-[11px] font-medium text-text-primary outline-none transition-colors hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/15"
                >
                  <option value="">All manufacturers</option>
                  {manufacturers.map((manufacturer) => (
                    <option key={manufacturer} value={manufacturer}>
                      {manufacturer}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-[10px] font-semibold text-text-muted">
                  Model
                </span>
                <select
                  value={selectedModelId}
                  onChange={(event) => onModelChange(event.target.value)}
                  disabled={cameras.length === 0}
                  className="h-8 w-full cursor-pointer rounded-md border border-panel-border bg-background px-2 text-[11px] font-medium text-text-primary outline-none transition-colors hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground"
                >
                  <option value="">Select a model</option>
                  {cameras.map((camera) => (
                    <option key={camera.id} value={camera.id}>
                      {camera.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {selectedModel ? (
            <div className="mt-3">
              <p
                className="truncate text-xs font-semibold text-text-primary"
                title={selectedModel.name}
              >
                {selectedModel.manufacturer} · {selectedModel.model}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {resolution && (
                  <SpecChip
                    label={`${resolution.horizontal}×${resolution.vertical}`}
                  />
                )}
                {selectedModel.sensor_spec.megapixel != null && (
                  <SpecChip
                    label={`${selectedModel.sensor_spec.megapixel} MP`}
                  />
                )}
                {selectedModel.sensor_spec.sensor_size && (
                  <SpecChip label={selectedModel.sensor_spec.sensor_size} />
                )}
                {aspectRatio && <SpecChip label={aspectRatio} />}
                <SpecChip label="Bullet" />
                <SpecChip label={formatFocalRange(selectedModel)} />
              </div>
            </div>
          ) : (
            <p className="mt-3 text-xs leading-5 text-text-muted">
              Choose a bullet camera to view its specifications and calculate
              coverage.
            </p>
          )}
        </>
      )}
    </section>
  );
}

function SpecChip({ label }: { label: string }) {
  return (
    <span className="rounded-md border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
      {label}
    </span>
  );
}
