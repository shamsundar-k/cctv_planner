import { useState } from 'react'
import { useAllCameraModels } from '../../../../api/camerasModels'
import { useCameraPlacementStore } from '../../../../store/cameraPlacementSlice'
import type { CameraModel } from '../../../../api/cameramodel.types'
import ModelSelectorPanel from '../../../camera-selector/component/ModelSelectorPanel'
import CamerasTab from './CamerasTab'

type TabId = 'models' | 'cameras'

interface LeftSidebarProps {
  projectId: string
}

function RailTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      title={label}
      className="w-full py-5 px-2 rounded-lg border-none cursor-pointer select-none text-[10px] font-extrabold tracking-widest uppercase flex items-center justify-center gap-1.5"
      style={{
        writingMode: 'vertical-lr',
        transform: hovered ? 'rotate(180deg) scaleY(1.08)' : 'rotate(180deg) scaleY(1)',
        transition: 'transform 150ms ease',
        background: active ? 'var(--theme-accent)' : 'transparent',
        color: active ? 'var(--theme-text-primary)' : 'var(--theme-text-secondary)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span
        className="rounded-full shrink-0"
        style={{
          width: 5,
          height: 5,
          background: active ? 'var(--theme-text-primary)' : 'var(--theme-text-secondary)',
        }}
      />
      {label}
    </button>
  )
}

export default function LeftSidebar({ projectId }: LeftSidebarProps) {
  const [activeTab, setActiveTab] = useState<TabId | null>(null)
  const { data: allModels = [], isLoading: modelsLoading } = useAllCameraModels()
  const { setMode, setSelectedCameraId, setSelectedModel } = useCameraPlacementStore()

  const handlePlaceCamera = (model: CameraModel) => {
    console.log("Selected model", model)
    setSelectedModel({ manufacturer: model.manufacturer, model: model.model_number })
    setSelectedCameraId(model.id)
    setMode('PLACING')
  }

  return (
    <div className="relative shrink-0 h-full" style={{ width: 36 }}>
      {/* Rail */}
      <div
        className="flex flex-col gap-5 pt-1 h-full"
        style={{
          width: 36,
          background: 'var(--theme-bg-card)',
          borderRight: '1px solid color-mix(in srgb, var(--theme-surface) 20%, transparent)',
        }}
      >
        {(['models', 'cameras'] as TabId[]).map(tab => (
          <RailTab
            key={tab}
            label={tab}
            active={activeTab === tab}
            onClick={() => setActiveTab(prev => (prev === tab ? null : tab))}
          />
        ))}
      </div>

      {/* Floating panel — overlays the map */}
      {activeTab && (
        <div
          className="absolute top-0 flex flex-col overflow-hidden shadow-2xl"
          style={{
            left: 36,
            width: 236,
            height: '100%',
            zIndex: 1000,
            background: 'var(--theme-bg-card)',
            borderRight: '1px solid color-mix(in srgb, var(--theme-surface) 20%, transparent)',
          }}
        >
          {activeTab === 'models' && (
            <ModelSelectorPanel
              models={allModels}
              isLoading={modelsLoading}
              onPlaceCamera={handlePlaceCamera}
            />
          )}
          {activeTab === 'cameras' && <CamerasTab projectId={projectId} />}
        </div>
      )}
    </div>
  )
}
