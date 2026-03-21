import { useState } from 'react'

type TabId = 'cameras' | 'layers' | 'models'

interface LeftSidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
}

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  {
    id: 'cameras',
    label: 'Cameras',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="2" y="7" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M16 10l5-3v10l-5-3V10z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="9" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: 'layers',
    label: 'Layers',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'models',
    label: 'Models',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
]

export default function LeftSidebar({ collapsed, onToggleCollapse }: LeftSidebarProps) {
  const [activeTab, setActiveTab] = useState<TabId>('cameras')

  return (
    <aside
      className="shrink-0 bg-slate-800 border-r border-slate-700 flex flex-col relative transition-[width] duration-200"
      style={{ width: collapsed ? 44 : 236 }}
    >
      {/* Tab buttons */}
      <div className="flex flex-col pt-2 gap-0.5 px-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            title={collapsed ? tab.label : undefined}
            className={`flex items-center gap-2.5 h-9 px-2 rounded-md border-none cursor-pointer text-sm font-medium transition-colors whitespace-nowrap overflow-hidden ${
              activeTab === tab.id
                ? 'bg-slate-700 text-slate-100'
                : 'bg-transparent text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
            }`}
          >
            <span className="shrink-0">{tab.icon}</span>
            {!collapsed && <span>{tab.label}</span>}
          </button>
        ))}
      </div>

      {/* Tab content area — stubbed */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto px-2 py-3">
          <p className="text-xs text-slate-500 italic">
            {activeTab === 'cameras' && 'Camera list — coming in Milestone 3'}
            {activeTab === 'layers' && 'Layer toggles — coming in Milestone 3'}
            {activeTab === 'models' && 'Camera models — coming in Milestone 3'}
          </p>
        </div>
      )}

      {/* Collapse toggle button — pinned to bottom */}
      <button
        onClick={onToggleCollapse}
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
