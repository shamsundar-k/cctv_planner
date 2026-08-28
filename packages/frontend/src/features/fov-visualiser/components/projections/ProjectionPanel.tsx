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
import type {
  ProjectionContentBounds,
  ProjectionDomain,
} from "../../types";
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
  contentBounds?: ProjectionContentBounds | null;
  lockYDomain?: boolean;
  workspaceSize?: "single" | "split";
  fullscreenControls?: ReactNode;
  children?: (context: ProjectionRenderContext) => ReactNode;
}

const FALLBACK_X_DOMAIN: ProjectionDomain = [-0.5, 10];
const FALLBACK_Y_DOMAIN: ProjectionDomain = [-5, 5];
const HEADER_HEIGHT = 40;
const DOMAIN_GROWTH_STEP_METRES = 5;

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

function fitDomainsToAspect(
  availableWidth: number,
  availableHeight: number,
  xDomain: ProjectionDomain,
  yDomain: ProjectionDomain,
) {
  const xSpan = Math.max(Math.abs(xDomain[1] - xDomain[0]), Number.EPSILON);
  const ySpan = Math.max(Math.abs(yDomain[1] - yDomain[0]), Number.EPSILON);
  const panelAspectRatio = availableWidth / availableHeight;
  const domainAspectRatio = xSpan / ySpan;
  let adjustedXDomain: ProjectionDomain = xDomain;
  let adjustedYDomain: ProjectionDomain = yDomain;

  if (panelAspectRatio > domainAspectRatio) {
    const expandedXSpan = ySpan * panelAspectRatio;
    adjustedXDomain = [xDomain[0], xDomain[0] + expandedXSpan];
  } else if (panelAspectRatio < domainAspectRatio) {
    const expandedYSpan = xSpan / panelAspectRatio;

    if (yDomain[0] === 0) {
      adjustedYDomain = [0, expandedYSpan];
    } else {
      const yCentre = (yDomain[0] + yDomain[1]) / 2;
      adjustedYDomain = [
        yCentre - expandedYSpan / 2,
        yCentre + expandedYSpan / 2,
      ];
    }
  }

  return { adjustedXDomain, adjustedYDomain };
}

function growUpperBoundary(value: number): number {
  return (
    Math.ceil((value - 1e-9) / DOMAIN_GROWTH_STEP_METRES) *
    DOMAIN_GROWTH_STEP_METRES
  );
}

function getPlotLayout(
  width: number,
  plotHeight: number,
  xDomain: ProjectionDomain,
  yDomain: ProjectionDomain,
  contentBounds?: ProjectionContentBounds | null,
) {
  const baseMargins: ProjectionMargins = {
    top: 14,
    right: 20,
    bottom: 34,
    left: 42,
  };
  const availableWidth = Math.max(
    width - baseMargins.left - baseMargins.right,
    1,
  );
  const availableHeight = Math.max(
    plotHeight - baseMargins.top - baseMargins.bottom,
    1,
  );

  const initialLayout = fitDomainsToAspect(
    availableWidth,
    availableHeight,
    xDomain,
    yDomain,
  );
  let requestedXDomain = xDomain;
  let requestedYDomain = yDomain;

  if (contentBounds) {
    const [, visibleXMax] = initialLayout.adjustedXDomain;
    const [visibleYMin, visibleYMax] = initialLayout.adjustedYDomain;

    if (contentBounds.x[1] > visibleXMax) {
      requestedXDomain = [
        xDomain[0],
        growUpperBoundary(contentBounds.x[1]),
      ];
    }

    if (yDomain[0] === 0 && contentBounds.y[1] > visibleYMax) {
      requestedYDomain = [0, growUpperBoundary(contentBounds.y[1])];
    } else if (
      yDomain[0] !== 0 &&
      (contentBounds.y[0] < visibleYMin || contentBounds.y[1] > visibleYMax)
    ) {
      const requiredHalfExtent = Math.max(
        Math.abs(contentBounds.y[0]),
        Math.abs(contentBounds.y[1]),
      );
      const grownHalfExtent = growUpperBoundary(requiredHalfExtent);
      requestedYDomain = [-grownHalfExtent, grownHalfExtent];
    }
  }

  const { adjustedXDomain, adjustedYDomain } = fitDomainsToAspect(
    availableWidth,
    availableHeight,
    requestedXDomain,
    requestedYDomain,
  );

  return {
    margins: baseMargins,
    innerWidth: availableWidth,
    innerHeight: availableHeight,
    adjustedXDomain,
    adjustedYDomain,
  };
}

export default function ProjectionPanel({
  title,
  description,
  xDomain,
  yDomain,
  geometryKey,
  emptyMessage,
  contentBounds,
  lockYDomain = false,
  workspaceSize = "split",
  fullscreenControls,
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
            : workspaceSize === "single"
              ? "h-[calc(100vh-9rem)] min-h-[560px] max-h-[900px]"
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
            const activeXDomain = xDomain ?? FALLBACK_X_DOMAIN;
            const activeYDomain = yDomain ?? FALLBACK_Y_DOMAIN;
            const {
              margins,
              innerWidth,
              innerHeight,
              adjustedXDomain,
              adjustedYDomain,
            } = getPlotLayout(
              width,
              plotHeight,
              activeXDomain,
              activeYDomain,
              contentBounds,
            );
            const baseXScale = scaleLinear<number>({
              domain: adjustedXDomain,
              range: [0, innerWidth],
            });
            const baseYScale = scaleLinear<number>({
              domain: adjustedYDomain,
              range: [innerHeight, 0],
            });

            return (
            <Zoom<SVGSVGElement>
              key={`${geometryKey}:${workspaceSize}`}
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
                        onReset={zoom.reset}
                      />
                    </header>

                    {isFullscreen && fullscreenControls && (
                      <div className="mb-2 shrink-0 rounded-lg border border-panel-border bg-background px-3 py-2">
                        {fullscreenControls}
                      </div>
                    )}

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
