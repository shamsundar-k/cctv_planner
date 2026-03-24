import { useParams } from 'react-router'
import { useProject } from '../api/projects'
import { useSyncCameraInstancesToStore } from '../api/cameraInstances'
import MapNavbar from '../components/map/MapNavbar'
import LeftSidebar from '../components/map/LeftSidebar'
import MapCanvas from '../components/map/MapCanvas'
import CameraLayer from '../components/map/CameraLayer'
import FovLayer from '../components/map/FovLayer'
import BottomToolbar from '../components/map/BottomToolbar'
import CameraPropertiesPanel from '../components/map/CameraPropertiesPanel'

export default function ProjectMapViewPage() {
  const { id = '' } = useParams<{ id: string }>()
  // Sync React Query camera list → Zustand working-copy store once per page
  useSyncCameraInstancesToStore(id)
  const { data: project, isLoading, isError } = useProject(id)

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
      {/* Navbar */}
      <MapNavbar projectId={id} projectName={project.name} />

      {/* Workspace */}
      <div className="flex-1 flex overflow-hidden">
        <LeftSidebar projectId={id} />
        <MapCanvas
          centerLat={project.center_lat}
          centerLng={project.center_lng}
          defaultZoom={project.default_zoom}
        >
          <FovLayer    projectId={id} />
          <CameraLayer projectId={id} />
          <CameraPropertiesPanel projectId={id} />
        </MapCanvas>
      </div>

      {/* Bottom toolbar */}
      <BottomToolbar />
    </div>
  )
}
