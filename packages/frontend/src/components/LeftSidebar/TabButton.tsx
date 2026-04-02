import type { TabButtonProps } from './types'

export default function TabButton({ id, label, icon: Icon, active, collapsed, onClick }: TabButtonProps) {
  return (
    <button
      onClick={() => onClick(id)}
      title={collapsed ? label : undefined}
      className="flex items-center gap-2.5 h-9 px-2 rounded-md border-none cursor-pointer text-sm font-medium transition-all whitespace-nowrap overflow-hidden"
      style={{
        background: active ? 'color-mix(in srgb, var(--theme-surface) 25%, transparent)' : 'transparent',
        color: active ? 'var(--theme-text-primary)' : 'color-mix(in srgb, var(--theme-text-secondary) 80%, transparent)',
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'color-mix(in srgb, var(--theme-surface) 15%, transparent)'; e.currentTarget.style.color = 'var(--theme-text-primary)' } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'color-mix(in srgb, var(--theme-text-secondary) 80%, transparent)' } }}
    >
      <Icon size={16} className="shrink-0" />
      {!collapsed && <span>{label}</span>}
    </button>
  )
}

