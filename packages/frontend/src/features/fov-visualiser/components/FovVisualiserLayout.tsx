import CameraConfiguration from "./CameraConfiguration";
import CoverageResultsTable from "./CoverageResultsTable";
import SelectedCameraCard from "./SelectedCameraCard";
import ProjectionPanel from "./projections/ProjectionPanel";
import SideViewProjection from "./projections/SideViewProjection";
import TopViewProjection from "./projections/TopViewProjection";
import { useFovVisualiser } from "../hooks/useFovVisualiser";

export default function FovVisualiserLayout() {
  const visualiser = useFovVisualiser();
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

      <section className="grid min-w-0 gap-2.5" aria-label="Field of view projections">
        <ProjectionPanel
          title="Top view"
          description="Horizontal field of view showing the camera, boundary rays, target plane, scene width, and target distance in metres."
          xDomain={visualiser.projectionDomains?.x ?? null}
          yDomain={visualiser.projectionDomains?.topY ?? null}
          geometryKey={`top:${geometryKey}`}
          emptyMessage={projectionMessage}
          children={
            visualiser.projectionGeometry
              ? (context) => (
                  <TopViewProjection
                    context={context}
                    geometry={visualiser.projectionGeometry!}
                    installation={visualiser.installation}
                  />
                )
              : undefined
          }
        />
        <ProjectionPanel
          title="Side view"
          description="Vertical field of view showing mounting height, tilt, ray angles, ground coverage, dead zone, target plane, and target distance in metres."
          xDomain={visualiser.projectionDomains?.x ?? null}
          yDomain={visualiser.projectionDomains?.sideY ?? null}
          geometryKey={`side:${geometryKey}`}
          emptyMessage={projectionMessage}
          lockYDomain
          children={
            visualiser.projectionGeometry
              ? (context) => (
                  <SideViewProjection
                    context={context}
                    geometry={visualiser.projectionGeometry!}
                    installation={visualiser.installation}
                  />
                )
              : undefined
          }
        />
      </section>
    </div>
  );
}
