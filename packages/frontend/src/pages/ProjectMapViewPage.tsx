import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import type { Map as LeafletMap } from 'leaflet'
import { useProject } from '../api/projects'
import MapNavbar from '../components/map/MapNavbar'
import LeftSidebar from '../components/map/LeftSidebar'
import MapCanvas from '../components/map/MapCanvas'
import CameraLayer from '../components/map/CameraLayer'
import BottomToolbar from '../components/map/BottomToolbar'
import CameraPropertiesPanel from '../components/map/CameraPropertiesPanel'
import { useMapViewStore } from '../store/mapViewSlice'

export default function ProjectMapViewPage() {
  const { id = '' } = useParams<{ id: string }>()
  const { data: project, isLoading, isError } = useProject(id)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [leafletMap, setLeafletMap] = useState<LeafletMap | null>(null)

  const activeTool = useMapViewStore((s) => s.activeTool)
  const setSelectedCamera = useMapViewStore((s) => s.setSelectedCamera)

  // Deselect camera when clicking map background
  useEffect(() => {
    if (!leafletMap) return
    const handler = () => {
      if (activeTool === 'select' || activeTool === 'pan') {
        setSelectedCamera(null)
      }
    }
    leafletMap.on('click', handler)
    return () => {
      leafletMap.off('click', handler)
    }
  }, [leafletMap, activeTool, setSelectedCamera])

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
        <LeftSidebar
          projectId={id}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        />
        <MapCanvas
          centerLat={project.center_lat}
          centerLng={project.center_lng}
          defaultZoom={project.default_zoom}
          onMapReady={setLeafletMap}
        />
        <CameraLayer projectId={id} map={leafletMap} />
        <CameraPropertiesPanel projectId={id} />
      </div>

      {/* Bottom toolbar */}
      <BottomToolbar />
    </div>
  )
}
