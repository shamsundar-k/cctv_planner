import { useMapView } from "@/features/map-view/hooks/useMapView";
import MapNavbar from "@/features/map-view/components/MapNavbar/MapNavbar";
import CollapsibleSidebar from "@/features/navigation/component/CollapsibleSidebar";
import Map from "@/features/map-view/components/map/Map";
import BaseTile from "@/features/map-view/components/map/BaseTile";
import MapModeOverlay from "@/features/map-view/components/map/MapModeOverlay";
import { MapActionsToolbar } from "@/features/map-view/components/map-actions";
// import CameraLayer from "@/features/map-view/components/layers/CameraLayer";
// import FovLayer from "@/features/map-view/components/layers/FovLayer";
import CameraPanel from "@/features/map-view/components/CameraPanel";
// import LeftSidebar from './LeftSidebar'
// import { useLayerVisibilityStore } from "@/store/layerVisibilityStore";
import MapLayersControl from "@/features/map-view/components/toolbar/MapLayersControl";

export default function ProjectMapView() {
  const { id, project, isLoading, isError, center, defaultZoom } = useMapView();
  // const cameraLayerVisible = useLayerVisibilityStore((s) => s.visible.cameras);

  // const fovLayerVisible = useLayerVisibilityStore(
  //   (s) => s.visible.fov || s.visible.ir,
  // );

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background text-text-muted text-sm">
        Loading project…
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="h-screen flex items-center justify-center bg-background text-error text-sm">
        Failed to load project.
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <MapNavbar projectId={id} projectName={project.name} />

      <div className="flex-1 flex overflow-hidden relative">
        <CollapsibleSidebar projectId={id} />
        <div className="min-w-0 flex-1">
          <Map zoom={defaultZoom} center={center}>
            <BaseTile />
            <MapLayersControl />
            <MapActionsToolbar />
            <MapModeOverlay />
            {/*{cameraLayerVisible && <CameraLayer projectId={id} />}*/}
            {/*{fovLayerVisible && <FovLayer />}*/}
          </Map>
        </div>
        <CameraPanel projectId={id} />
      </div>
    </div>
  );
}
