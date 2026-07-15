import type { Tab } from './types'

const TABS: { id: Tab; label: string }[] = [
  { id: 'users', label: 'Users' },
  { id: 'cameras', label: 'Camera Specs' },
  { id: 'invites', label: 'Invites' },
]

interface AdminTabNavProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  inviteCount: number
}

export default function AdminTabNav({ activeTab, onTabChange, inviteCount }: AdminTabNavProps) {
  return (
    <div className="mb-7 flex overflow-x-auto border-b border-panel-border">
      {TABS.map(({ id, label }) => {
        const isActive = activeTab === id
        return (
          <button
            type="button"
            key={id}
            onClick={() => onTabChange(id)}
            className={`-mb-px whitespace-nowrap border-x-0 border-t-0 border-b-2 bg-transparent px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              isActive
                ? 'border-primary text-text-primary'
                : 'border-transparent text-text-secondary hover:border-panel-border hover:text-text-primary'
            }`}
          >
            {label}
            {id === 'invites' && inviteCount > 0 && (
              <span className={`ml-2 rounded-full px-1.5 py-0.5 text-[11px] font-bold ${isActive ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'}`}>
                {inviteCount}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
