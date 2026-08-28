import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ParentSize } from "@visx/responsive";
import { scaleLinear } from "@visx/scale";
import { Zoom } from "@visx/zoom";
import type { ProjectionDomain } from "../../types";
import ProjectionGrid from "./ProjectionGrid";
import ProjectionToolbar from "./ProjectionToolbar";

export interface ProjectionMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ProjectionRenderContext {
  width: number;
  height: number;
  margins: ProjectionMargins;
  innerWidth: number;
  innerHeight: number;
  xScale: ReturnType<typeof scaleLinear<number>>;
  yScale: ReturnType<typeof scaleLinear<number>>;
  clipPathId: string;
}

interface ProjectionPanelProps {
  title: string;
  description: string;
  xDomain: ProjectionDomain | null;
  yDomain: ProjectionDomain | null;
  geometryKey: string;
  emptyMessage: string;
  lockYDomain?: boolean;
  children?: (context: ProjectionRenderContext) => ReactNode;
}

const FALLBACK_X_DOMAIN: ProjectionDomain = [-0.5, 10];
const FALLBACK_Y_DOMAIN: ProjectionDomain = [-5, 5];
const HEADER_HEIGHT = 40;

interface ZoomTransformReader {
  applyInverseToPoint: (point: { x: number; y: number }) => {
    x: number;
    y: number;
  };
}

function visibleScale(
  baseScale: ReturnType<typeof scaleLinear<number>>,
  rangeEnd: number,
  screenOffset: number,
  zoom: ZoomTransformReader,
  axis: "x" | "y",
) {
  const startPoint = zoom.applyInverseToPoint({
    x: axis === "x" ? screenOffset : 0,
    y: axis === "y" ? screenOffset : 0,
  });
  const endPoint = zoom.applyInverseToPoint({
    x: axis === "x" ? screenOffset + rangeEnd : 0,
    y: axis === "y" ? screenOffset + rangeEnd : 0,
  });
  const startPixel = (axis === "x" ? startPoint.x : startPoint.y) - screenOffset;
  const endPixel = (axis === "x" ? endPoint.x : endPoint.y) - screenOffset;

  return scaleLinear<number>({
    domain: [baseScale.invert(startPixel), baseScale.invert(endPixel)],
    range: [0, rangeEnd],
  });
}

export default function ProjectionPanel({
  title,
  description,
  xDomain,
  yDomain,
  geometryKey,
  emptyMessage,
  lockYDomain = false,
  children,
}: ProjectionPanelProps) {
  const panelRef = useRef<HTMLElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const rawId = useId();
  const clipPathId = `projection-clip-${rawId.replaceAll(":", "")}`;
  const isInteractive = xDomain != null && yDomain != null && children != null;

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === panelRef.current);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!panelRef.current) return;
    if (document.fullscreenElement === panelRef.current) {
      await document.exitFullscreen();
    } else {
      await panelRef.current.requestFullscreen();
    }
  }, []);

  return (
    <section
      ref={panelRef}
      className="min-w-0 rounded-xl border border-panel-border bg-panel p-2.5 shadow-sm sm:p-3"
    >
      <div
        className={
          isFullscreen
            ? "h-[calc(100vh-32px)]"
            : "h-[390px] sm:h-[420px] xl:h-[440px]"
        }
      >
        <ParentSize
          className="h-full"
          debounceTime={10}
          initialSize={{ width: 800, height: 420 }}
        >
          {({ width, height }) => {
          const plotHeight = Math.max(height - HEADER_HEIGHT, 240);
          const margins: ProjectionMargins = {
            top: 14,
            right: 20,
            bottom: 34,
            left: 42,
          };
          const innerWidth = Math.max(width - margins.left - margins.right, 1);
          const innerHeight = Math.max(
            plotHeight - margins.top - margins.bottom,
            1,
          );
          const activeXDomain = xDomain ?? FALLBACK_X_DOMAIN;
          const activeYDomain = yDomain ?? FALLBACK_Y_DOMAIN;
          const baseXScale = scaleLinear<number>({
            domain: activeXDomain,
            range: [0, innerWidth],
          });
          const baseYScale = scaleLinear<number>({
            domain: activeYDomain,
            range: [innerHeight, 0],
          });

          return (
            <Zoom<SVGSVGElement>
              key={geometryKey}
              width={width}
              height={plotHeight}
              scaleXMin={0.5}
              scaleXMax={12}
              scaleYMin={0.5}
              scaleYMax={12}
            >
              {(zoom) => {
                const xScale = visibleScale(
                  baseXScale,
                  innerWidth,
                  margins.left,
                  zoom,
                  "x",
                );
                const yScale = lockYDomain
                  ? baseYScale
                  : visibleScale(
                      baseYScale,
                      innerHeight,
                      margins.top,
                      zoom,
                      "y",
                    );
                const context: ProjectionRenderContext = {
                  width,
                  height: plotHeight,
                  margins,
                  innerWidth,
                  innerHeight,
                  xScale,
                  yScale,
                  clipPathId,
                };

                return (
                  <div className="flex h-full min-h-0 flex-col">
                    <header className="flex h-10 shrink-0 items-center justify-between gap-3">
                      <h2 className="text-base font-semibold text-panel-foreground">
                        {title}
                      </h2>
                      <ProjectionToolbar
                        disabled={!isInteractive}
                        isFullscreen={isFullscreen}
                        onZoomOut={() =>
                          zoom.scale({ scaleX: 0.8, scaleY: 0.8 })
                        }
                        onZoomIn={() =>
                          zoom.scale({ scaleX: 1.25, scaleY: 1.25 })
                        }
                        onFullscreen={() => void toggleFullscreen()}
                        onFit={zoom.reset}
                      />
                    </header>

                    <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-panel-border bg-background">
                      <svg
                        ref={zoom.containerRef}
                        width={width}
                        height={plotHeight}
                        role="img"
                        aria-label={title}
                        tabIndex={isInteractive ? 0 : -1}
                        className={
                          isInteractive
                            ? "block cursor-grab outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary active:cursor-grabbing"
                            : "block"
                        }
                        style={{ touchAction: "none" }}
                        onWheel={
                          isInteractive
                            ? (event) => {
                                event.preventDefault();
                                zoom.handleWheel(event);
                              }
                            : undefined
                        }
                        onMouseDown={isInteractive ? zoom.dragStart : undefined}
                        onMouseMove={isInteractive ? zoom.dragMove : undefined}
                        onMouseUp={isInteractive ? zoom.dragEnd : undefined}
                        onMouseLeave={isInteractive ? zoom.dragEnd : undefined}
                        onKeyDown={
                          isInteractive
                            ? (event) => {
                                if (event.key === "+" || event.key === "=") {
                                  event.preventDefault();
                                  zoom.scale({ scaleX: 1.25, scaleY: 1.25 });
                                } else if (event.key === "-") {
                                  event.preventDefault();
                                  zoom.scale({ scaleX: 0.8, scaleY: 0.8 });
                                } else if (event.key === "ArrowLeft") {
                                  event.preventDefault();
                                  zoom.translate({ translateX: 20, translateY: 0 });
                                } else if (event.key === "ArrowRight") {
                                  event.preventDefault();
                                  zoom.translate({ translateX: -20, translateY: 0 });
                                } else if (
                                  event.key === "ArrowUp" &&
                                  !lockYDomain
                                ) {
                                  event.preventDefault();
                                  zoom.translate({ translateX: 0, translateY: 20 });
                                } else if (
                                  event.key === "ArrowDown" &&
                                  !lockYDomain
                                ) {
                                  event.preventDefault();
                                  zoom.translate({ translateX: 0, translateY: -20 });
                                } else if (event.key === "0") {
                                  event.preventDefault();
                                  zoom.reset();
                                }
                              }
                            : undefined
                        }
                      >
                        <title>{title}</title>
                        <desc>{description}</desc>
                        <rect
                          width={width}
                          height={plotHeight}
                          fill="var(--app-background)"
                        />
                        <defs>
                          <clipPath id={clipPathId}>
                            <rect width={innerWidth} height={innerHeight} />
                          </clipPath>
                        </defs>
                        <ProjectionGrid {...context} />
                        {isInteractive ? (
                          <g
                            transform={`translate(${margins.left} ${margins.top})`}
                            clipPath={`url(#${clipPathId})`}
                          >
                            {children(context)}
                          </g>
                        ) : (
                          <text
                            x={width / 2}
                            y={plotHeight / 2}
                            textAnchor="middle"
                            fill="var(--app-text-muted)"
                            fontSize={13}
                          >
                            {emptyMessage}
                          </text>
                        )}
                      </svg>
                    </div>
                  </div>
                );
              }}
            </Zoom>
          );
          }}
        </ParentSize>
      </div>
    </section>
  );
}
