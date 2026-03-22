import { useState } from 'react'
import { useParams } from 'react-router'
import { useProject } from '../api/projects'
import MapNavbar from '../components/map/MapNavbar'
import LeftSidebar from '../components/map/LeftSidebar'
import MapCanvas from '../components/map/MapCanvas'
import BottomToolbar from '../components/map/BottomToolbar'
import RightEditPanel from '../components/map/RightEditPanel'

export default function ProjectMapViewPage() {
  const { id = '' } = useParams<{ id: string }>()
  const { data: project, isLoading, isError } = useProject(id)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

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
        />
        <RightEditPanel />
      </div>

      {/* Bottom toolbar */}
      <BottomToolbar />
    </div>
  )
}
