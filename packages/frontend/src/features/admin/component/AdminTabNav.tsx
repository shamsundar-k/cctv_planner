import type { Tab } from './types'

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'users', label: 'Users' },
  { id: 'projects', label: 'Projects' },
  { id: 'invites', label: 'Active Invites' },
]

interface AdminTabNavProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  inviteCount: number
}

export default function AdminTabNav({ activeTab, onTabChange, inviteCount }: AdminTabNavProps) {
  return (
    <div
      className="flex mb-7 overflow-x-auto border-b"
      style={{ borderColor: 'color-mix(in srgb, var(--theme-surface) 20%, transparent)' }}
    >
      {TABS.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className="px-5 py-2.5 text-sm font-semibold bg-transparent border-none cursor-pointer whitespace-nowrap transition-all border-b-2 -mb-px"
          style={{
            color: activeTab === id ? 'var(--theme-accent-text)' : 'color-mix(in srgb, var(--theme-text-secondary) 70%, transparent)',
            borderBottomColor: activeTab === id ? 'var(--theme-accent)' : 'transparent',
          }}
          onMouseEnter={e => { if (activeTab !== id) e.currentTarget.style.color = 'var(--theme-text-primary)' }}
          onMouseLeave={e => { if (activeTab !== id) e.currentTarget.style.color = 'color-mix(in srgb, var(--theme-text-secondary) 70%, transparent)' }}
        >
          {label}
          {id === 'invites' && inviteCount > 0 && (
            <span
              className="ml-2 px-1.5 py-0.5 text-[11px] font-bold rounded-full"
              style={{ background: 'color-mix(in srgb, var(--theme-accent) 20%, transparent)', color: 'var(--theme-accent-text)' }}
            >
              {inviteCount}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
