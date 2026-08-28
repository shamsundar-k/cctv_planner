import { Maximize2, Minimize2, ZoomIn, ZoomOut } from "lucide-react";

interface ProjectionToolbarProps {
  disabled: boolean;
  isFullscreen: boolean;
  onZoomOut: () => void;
  onZoomIn: () => void;
  onFullscreen: () => void;
  onReset: () => void;
}

const iconButtonClass =
  "flex size-8 items-center justify-center border-r border-panel-border text-text-secondary transition-colors last:border-r-0 enabled:hover:bg-divider/60 enabled:hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary";

export default function ProjectionToolbar({
  disabled,
  isFullscreen,
  onZoomOut,
  onZoomIn,
  onFullscreen,
  onReset,
}: ProjectionToolbarProps) {
  return (
    <div className="flex items-center gap-2" aria-label="Projection controls">
      <div className="flex overflow-hidden rounded-lg border border-panel-border bg-panel">
        <button
          type="button"
          className={iconButtonClass}
          disabled={disabled}
          onClick={onZoomOut}
          aria-label="Zoom out"
          title="Zoom out"
        >
          <ZoomOut size={15} aria-hidden="true" />
        </button>
        <button
          type="button"
          className={iconButtonClass}
          disabled={disabled}
          onClick={onZoomIn}
          aria-label="Zoom in"
          title="Zoom in"
        >
          <ZoomIn size={15} aria-hidden="true" />
        </button>
      </div>

      <button
        type="button"
        className="flex size-8 items-center justify-center rounded-lg border border-panel-border bg-panel text-text-secondary transition-colors enabled:hover:bg-divider/60 enabled:hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        disabled={disabled}
        onClick={onFullscreen}
        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      >
        {isFullscreen ? (
          <Minimize2 size={15} aria-hidden="true" />
        ) : (
          <Maximize2 size={15} aria-hidden="true" />
        )}
      </button>

      <button
        type="button"
        className="h-8 rounded-lg border border-panel-border bg-panel px-3 text-sm font-medium text-text-secondary transition-colors enabled:hover:bg-divider/60 enabled:hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        disabled={disabled}
        onClick={onReset}
      >
        Reset
      </button>
    </div>
  );
}
