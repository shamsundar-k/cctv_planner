import { useState } from "react";
import CameraConfiguration from "./CameraConfiguration";
import CoverageResultsTable from "./CoverageResultsTable";
import SelectedCameraCard from "./SelectedCameraCard";
import ProjectionPanel from "./projections/ProjectionPanel";
import SideViewProjection from "./projections/SideViewProjection";
import TopViewProjection from "./projections/TopViewProjection";
import { useFovVisualiser } from "../hooks/useFovVisualiser";

type ProjectionView = "top" | "side" | "split";

const PROJECTION_TABS: Array<{ id: ProjectionView; label: string }> = [
  { id: "top", label: "Top view" },
  { id: "side", label: "Side view" },
  { id: "split", label: "Split" },
];

export default function FovVisualiserLayout() {
  const visualiser = useFovVisualiser();
  const [activeView, setActiveView] = useState<ProjectionView>("top");
  const geometryKey = [
    visualiser.selectedModelId,
    visualiser.installation.mountingHeight,
    visualiser.installation.targetDistance,
    visualiser.installation.targetHeight,
  ].join(":");
  const projectionMessage = visualiser.isLoading
    ? "Loading camera models…"
    : visualiser.isGeometryInvalid
      ? "Adjust the camera or target height to produce valid ground coverage."
      : "Select a camera model to display this projection.";
  const projectionGeometry = visualiser.projectionGeometry;

  const topProjection = (workspaceSize: "single" | "split") => (
    <ProjectionPanel
      title="Top view"
      description="Horizontal field of view showing the camera, boundary rays, target plane, scene width, and target distance in metres."
      xDomain={visualiser.projectionDomains?.topX ?? null}
      yDomain={visualiser.projectionDomains?.topY ?? null}
      contentBounds={visualiser.projectionDomains?.topContentBounds ?? null}
      geometryKey={`top:${geometryKey}`}
      emptyMessage={projectionMessage}
      workspaceSize={workspaceSize}
      children={
        projectionGeometry
          ? (context) => (
              <TopViewProjection
                context={context}
                geometry={projectionGeometry}
                installation={visualiser.installation}
              />
            )
          : undefined
      }
    />
  );

  const sideProjection = (workspaceSize: "single" | "split") => (
    <ProjectionPanel
      title="Side view"
      description="Vertical field of view showing mounting height, tilt, ray angles, ground coverage, target plane, and target distance in metres."
      xDomain={visualiser.projectionDomains?.sideX ?? null}
      yDomain={visualiser.projectionDomains?.sideY ?? null}
      contentBounds={visualiser.projectionDomains?.sideContentBounds ?? null}
      geometryKey={`side:${geometryKey}`}
      emptyMessage={projectionMessage}
      lockYDomain
      workspaceSize={workspaceSize}
      children={
        projectionGeometry
          ? (context) => (
              <SideViewProjection
                context={context}
                geometry={projectionGeometry}
                installation={visualiser.installation}
              />
            )
          : undefined
      }
    />
  );

  return (
    <div className="grid items-start gap-2.5 xl:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="grid gap-2.5" aria-label="Field of view settings">
        <SelectedCameraCard
          cameras={visualiser.availableCameras}
          manufacturers={visualiser.manufacturers}
          selectedManufacturer={visualiser.selectedManufacturer}
          selectedModelId={visualiser.selectedModelId}
          selectedModel={visualiser.selectedModel}
          isLoading={visualiser.isLoading}
          isError={visualiser.isError}
          isEmpty={visualiser.isEmpty}
          onManufacturerChange={visualiser.onManufacturerChange}
          onModelChange={visualiser.onModelChange}
          onRetry={() => void visualiser.retry()}
        />
        <CameraConfiguration
          values={visualiser.installation}
          focalBounds={visualiser.focalBounds}
          focalDisabled={!visualiser.selectedModel}
          focalFixed={
            visualiser.focalBounds.min === visualiser.focalBounds.max &&
            visualiser.selectedModel != null
          }
          onChange={visualiser.onInstallationChange}
        />
        <CoverageResultsTable
          results={visualiser.coverageResults}
          hasSelection={visualiser.selectedModel != null}
          isGeometryInvalid={visualiser.isGeometryInvalid}
        />
      </aside>

      <section className="min-w-0" aria-label="Field of view projections">
        <div className="mb-2.5 flex items-center rounded-xl border border-panel-border bg-panel p-1.5 shadow-sm">
          <div
            className="flex items-center rounded-lg bg-background p-1"
            role="tablist"
            aria-label="Projection view"
          >
            {PROJECTION_TABS.map((tab) => {
              const isActive = activeView === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`h-8 rounded-md px-3 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-text-secondary hover:bg-divider/60 hover:text-text-primary"
                  }`}
                  onClick={() => setActiveView(tab.id)}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div role="tabpanel">
          {activeView === "top" && topProjection("single")}
          {activeView === "side" && sideProjection("single")}
          {activeView === "split" && (
            <div className="grid gap-2.5 2xl:grid-cols-2">
              {topProjection("split")}
              {sideProjection("split")}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
