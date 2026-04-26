import { useState } from 'react'
import ModelSelectorPanel from '../../features/camera-selector/component/ModelSelectorPanel'
import CamerasTab from './CamerasTab'

type TabId = 'models' | 'cameras'

interface LeftSidebarProps {
  projectId: string
}

function RailTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`w-full py-5 px-2 rounded-lg border-none cursor-pointer select-none text-[10px] font-extrabold tracking-widest uppercase flex items-center justify-center gap-1.5 [writing-mode:vertical-lr] rotate-180 hover:scale-y-[1.08] transition-transform duration-150 ease-in-out ${active ? 'bg-accent text-primary' : 'bg-transparent text-muted'}`}
    >
      <span className={`size-1.25 rounded-full shrink-0 ${active ? 'bg-primary' : 'bg-muted'}`} />
      {label}
    </button>
  )
}

export default function LeftSidebar({ projectId }: LeftSidebarProps) {
  const [activeTab, setActiveTab] = useState<TabId | null>(null)

  return (
    <div className="relative shrink-0 h-full w-9">
      <div className="flex flex-col gap-5 pt-1 h-full w-9 bg-card border-r border-surface/20">
        {(['models', 'cameras'] as TabId[]).map(tab => (
          <RailTab
            key={tab}
            label={tab}
            active={activeTab === tab}
            onClick={() => setActiveTab(prev => (prev === tab ? null : tab))}
          />
        ))}
      </div>

      {activeTab && (
        <div className="absolute top-0 left-9 flex flex-col overflow-hidden shadow-2xl w-76 h-full z-1000 bg-card border-r border-surface/20">
          {activeTab === 'models' && <ModelSelectorPanel onClose={() => setActiveTab(null)} />}
          {activeTab === 'cameras' && <CamerasTab projectId={projectId} />}
        </div>
      )}
    </div>
  )
}