import { useParams } from 'react-router'
import { useProject } from '../api/projects'
import { useSyncCameraInstancesToStore } from '../api/cameraInstances'
import MapNavbar from '../components/map/MapNavbar'
import LeftSidebar from '../components/map/LeftSidebar'
import MapCanvas from '../components/map/MapCanvas'
import BottomToolbar from '../components/BottomToolbar/BottomToolbar'
import CameraPropertiesPanel from '../components/map/CameraPropertiesPanel'
import Map from '../components/map/Map'
import BasemapSelector from '../components/map/BasemapSelector'

export default function ProjectMapViewPagenew() {
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
        <Map>

        </Map>

      </div>
      <BasemapSelector />
    </div>
  )
}
