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
            color: activeTab === id ? 'var(--theme-text-primary)' : 'color-mix(in srgb, var(--theme-text-secondary) 70%, transparent)',
            borderBottomColor: activeTab === id ? 'var(--theme-accent)' : 'transparent',
            textDecoration: activeTab === id ? 'underline' : 'none',
            textDecorationColor: 'var(--theme-accent)',
            textUnderlineOffset: '6px',
            textDecorationThickness: '2px',
          }}
          onMouseEnter={e => { if (activeTab !== id) e.currentTarget.style.color = 'var(--theme-text-primary)' }}
          onMouseLeave={e => { if (activeTab !== id) e.currentTarget.style.color = 'color-mix(in srgb, var(--theme-text-secondary) 70%, transparent)' }}
        >
          {label}
          {id === 'invites' && inviteCount > 0 && (
            <span
              className="ml-2 px-1.5 py-0.5 text-[11px] font-bold rounded-full"
              style={{
                background: activeTab === id
                  ? 'var(--theme-accent)'
                  : 'color-mix(in srgb, var(--theme-accent) 15%, transparent)',
                color: activeTab === id ? 'var(--theme-accent-text)' : 'var(--theme-accent)',
              }}
            >
              {inviteCount}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
