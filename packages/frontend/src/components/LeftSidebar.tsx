import { useState } from 'react'
import { Video, Layers, LayoutGrid } from 'lucide-react'
import { useMapViewStore } from '../store/mapViewSlice'
import { useCameraLayerStore } from '../store/cameraLayerSlice'
import { useAllCameraModels } from '../api/camerasModels'
import TabButton from './LeftSidebar/TabButton'

import LayersTab from './LeftSidebar/LayersTab'
import ModelSelectorPanel from './LeftSidebar/Modelselectorpanel'
import type { TabId, LeftSidebarProps } from './LeftSidebar/types'
import type { CameraModel } from '../api/cameramodel.types'

export default function LeftSidebar({ projectId: _projectId }: LeftSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [manualTab, setManualTab] = useState<TabId>('cameras')
  const activeTool = useMapViewStore((s) => s.activeTool)
  const selectedCameraId = useCameraLayerStore((s) => s.selectedCameraId)
  const { data: allModels = [], isLoading: modelsLoading } = useAllCameraModels()

  const handlePlaceCamera = (model: CameraModel) => {
    console.log('Place camera:', model)
  }

  // When Place Camera is active, always show Models tab.
  // When a camera is selected, show Cameras tab (to reveal the list).
  // Otherwise use manual selection.
  const activeTab: TabId =
    activeTool === 'place-camera' ? 'models' : selectedCameraId ? 'cameras' : manualTab

  return (
    <aside
      className="shrink-0 bg-slate-800 border-r border-slate-700 flex flex-col relative transition-[width] duration-200"
      style={{ width: collapsed ? 44 : 236 }}
    >
      {/* Tab buttons */}
      <div className="flex flex-col pt-2 gap-0.5 px-1">
        <TabButton id="cameras" label="Cameras" icon={Video} active={activeTab === 'cameras'} collapsed={collapsed} onClick={setManualTab} />
        <TabButton id="layers" label="Layers" icon={Layers} active={activeTab === 'layers'} collapsed={collapsed} onClick={setManualTab} />
        <TabButton id="models" label="Models" icon={LayoutGrid} active={activeTab === 'models'} collapsed={collapsed} onClick={setManualTab} />
      </div>

      {/* Tab content area */}
      {!collapsed && (
        <>
          {activeTab === 'layers' && (
            <div className="flex-1 overflow-y-auto px-2 py-3">
              <LayersTab />
            </div>
          )}
          {activeTab === 'models' && (
            <div className="flex-1 overflow-hidden">
              <ModelSelectorPanel
                models={allModels}
                isLoading={modelsLoading}
                onPlaceCamera={handlePlaceCamera}
              />
            </div>
          )}
        </>
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
