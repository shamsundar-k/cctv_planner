import { useState } from 'react'
import { Video, Layers, LayoutGrid } from 'lucide-react'
import { useMapViewStore } from '../../store/mapViewSlice'
import TabButton from './sidebar/TabButton'
import CamerasTab from './sidebar/CamerasTab'
import LayersTab from './sidebar/LayersTab'
import ModelsTab from './sidebar/ModelsTab'
import type { TabId, LeftSidebarProps } from './sidebar/types'

export default function LeftSidebar({ projectId }: LeftSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [manualTab, setManualTab] = useState<TabId>('cameras')
  const activeTool = useMapViewStore((s) => s.activeTool)

  // When Place Camera is active, always show Models tab; otherwise use manual selection
  const activeTab: TabId = activeTool === 'place-camera' ? 'models' : manualTab

  return (
    <aside
      className="shrink-0 bg-slate-800 border-r border-slate-700 flex flex-col relative transition-[width] duration-200"
      style={{ width: collapsed ? 44 : 236 }}
    >
      {/* Tab buttons */}
      <div className="flex flex-col pt-2 gap-0.5 px-1">
        <TabButton id="cameras" label="Cameras" icon={Video}       active={activeTab === 'cameras'} collapsed={collapsed} onClick={setManualTab} />
        <TabButton id="layers"  label="Layers"  icon={Layers}      active={activeTab === 'layers'}  collapsed={collapsed} onClick={setManualTab} />
        <TabButton id="models"  label="Models"  icon={LayoutGrid}  active={activeTab === 'models'}  collapsed={collapsed} onClick={setManualTab} />
      </div>

      {/* Tab content area */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto px-2 py-3">
          {activeTab === 'cameras' && <CamerasTab projectId={projectId} />}
          {activeTab === 'layers' && <LayersTab />}
          {activeTab === 'models' && <ModelsTab projectId={projectId} />}
        </div>
      )}

      {/* Collapse toggle button — pinned to bottom */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-700 border border-slate-600 text-slate-400 hover:text-slate-100 hover:bg-slate-600 flex items-center justify-center cursor-pointer transition-colors z-10"
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          aria-hidden="true"
          style={{ transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
        >
          <path d="M6.5 2L3.5 5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </aside>
  )
}
