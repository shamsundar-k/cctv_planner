import { useMapView } from '../features/map-view/hooks/useMapView'
import MapNavbar from '../features/map-view/components/MapNavbar/MapNavbar'
import LeftSidebar from '../features/map-view/components/LeftSidebar/LeftSidebar'
import Map from '../features/map-view/components/map/Map'
import CameraLayer from '../features/map-view/components/map/CameraLayer'
import FovLayer from '../features/map-view/components/map/FovLayer'
import CameraPropertiesPanel from '../features/map-view/components/map/CameraPropertiesPanel'

export default function ProjectMapViewPage() {
  const { id, project, isLoading, isError, center, defaultZoom } = useMapView()

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900 text-slate-400 text-sm">
        Loading project…
      </div>
    )
  }

  if (isError || !project) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900 text-red-400 text-sm">
        Failed to load project.
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-900">
      <MapNavbar projectId={id} projectName={project.name} />

      <div className="flex-1 flex overflow-hidden">
        <LeftSidebar projectId={id} />
        <Map zoom={defaultZoom} center={center} />
        <CameraLayer projectId={id} />
        <FovLayer projectId={id} />
        <CameraPropertiesPanel projectId={id} />
      </div>
    </div>
  )
}
