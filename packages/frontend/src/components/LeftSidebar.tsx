import { useState } from 'react'
import { useAllCameraModels } from '../api/camerasModels'
import ModelSelectorPanel from './LeftSidebar/Modelselectorpanel'
import type { LeftSidebarProps } from './LeftSidebar/types'
import type { CameraModel } from '../api/cameramodel.types'

type TabId = 'models' | 'cameras'

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

export default function LeftSidebar({ projectId: _projectId }: LeftSidebarProps) {
  const [activeTab, setActiveTab] = useState<TabId | null>(null)
  const { data: allModels = [], isLoading: modelsLoading } = useAllCameraModels()

  const handlePlaceCamera = (model: CameraModel) => {
    console.log('Place camera:', model)
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
          {activeTab === 'cameras' && <div className="flex-1" />}
        </div>
      )}
    </div>
  )
}
