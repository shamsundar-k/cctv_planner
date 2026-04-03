import { useEffect } from 'react'
import { useParams } from 'react-router'
import { useProject } from '../api/projects'
import { useCameraInstanceStore } from '../store/cameraInstanceStore'
import MapNavbar from '../components/map/MapNavbar'
import LeftSidebar from '../components/LeftSidebar/LeftSidebar'
import Map from '../components/map/Map'


export default function ProjectMapViewPagenew() {
  const { id = '' } = useParams<{ id: string }>()
  const loadCameras = useCameraInstanceStore((s) => s.loadCameras)

  useEffect(() => {
    if (id) loadCameras(id)
  }, [id, loadCameras])
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

  const centerLat = project.center_lat ?? 51.5;
  const centerLng = project.center_lng ?? -0.09;
  const defaultZoom = project.default_zoom ?? 13;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-900">
      {/* Navbar */}
      <MapNavbar projectId={id} projectName={project.name} />

      {/* Workspace */}
      <div className="flex-1 flex overflow-hidden">
        <LeftSidebar projectId={id} />
        <Map zoom={defaultZoom} center={[centerLat, centerLng]}>

        </Map>

      </div>

    </div>
  )
}
