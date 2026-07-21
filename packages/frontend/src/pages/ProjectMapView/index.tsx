import { useMapView } from '@/features/map-view/hooks/useMapView'
import CollapsibleSidebar from '@/features/navigation/component/CollapsibleSidebar'
import { COLLAPSED_SIDEBAR_WIDTH } from '@/features/navigation/sidebarLayout'
import Map from '@/features/map-view/components/map/Map'
import BaseTile from '@/features/map-view/components/map/BaseTile'
import MapModeOverlay from '@/features/map-view/components/map/MapModeOverlay'
import { MapActionsToolbar } from '@/features/map-view/components/map-actions'
import CameraPanel from '@/features/map-view/components/CameraPanel'
import MapLayersControl from '@/features/map-view/components/toolbar/MapLayersControl'
import CameraLayer from '@/features/map-view/components/layers/CameraLayer'
import FovLayer from '@/features/map-view/components/layers/FovLayer'

export default function ProjectMapView() {
  const { id, project, isLoading, isError, center, defaultZoom } = useMapView()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-sm text-text-muted">
        Loading project...
      </div>
    )
  }

  if (isError || !project) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-sm text-error">
        Failed to load project.
      </div>
    )
  }

  return (
    <div className="relative flex h-screen overflow-hidden bg-background">
      <div
        className="relative z-[2500] h-full shrink-0"
        style={{ width: COLLAPSED_SIDEBAR_WIDTH }}
      >
        <CollapsibleSidebar projectId={id} projectName={project.name} />
      </div>
      <div className="min-w-0 flex-1">
        <Map zoom={defaultZoom} center={center}>
          <BaseTile />
          <FovLayer />
          <CameraLayer />
          <MapLayersControl />
          <MapActionsToolbar />
          <MapModeOverlay />
        </Map>
      </div>
      <CameraPanel projectId={id} />
    </div>
  )
}
