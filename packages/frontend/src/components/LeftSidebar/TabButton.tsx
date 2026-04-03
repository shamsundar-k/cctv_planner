import type { TabButtonProps } from './types'

export default function TabButton({ id, label, icon: Icon, active, onClick }: TabButtonProps) {
  return (
    <button
      onClick={() => onClick(id)}
      className="flex items-center gap-2.5 h-9 px-3 rounded-lg border-none cursor-pointer text-sm font-semibold transition-all whitespace-nowrap overflow-hidden"
      style={{
        background: active ? 'var(--theme-accent)' : 'transparent',
        color: active ? 'var(--theme-text-primary)' : 'var(--theme-text-secondary)',
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'color-mix(in srgb, var(--theme-surface) 15%, transparent)'; e.currentTarget.style.color = 'var(--theme-text-primary)' } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--theme-text-secondary)' } }}
    >
      <span
        className="shrink-0 rounded-full w-1.5 h-1.5"
        style={{ background: active ? 'var(--theme-text-primary)' : 'var(--theme-text-secondary)' }}
      />
      <Icon size={16} className="shrink-0" />
      <span>{label}</span>
    </button>
  )
}

