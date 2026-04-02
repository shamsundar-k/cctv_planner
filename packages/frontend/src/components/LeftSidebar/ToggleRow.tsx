import type { ToggleRowProps } from './types'

export default function ToggleRow({ label, checked, onChange }: ToggleRowProps) {
  return (
    <label
      className="flex items-center justify-between gap-2 h-8 px-1 rounded cursor-pointer group transition-colors"
      style={{}}
      onMouseEnter={e => (e.currentTarget.style.background = 'color-mix(in srgb, var(--theme-surface) 15%, transparent)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <span className="text-xs select-none" style={{ color: 'var(--theme-text-secondary)' }}>{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative w-8 h-4 rounded-full border-none cursor-pointer transition-colors shrink-0"
        style={{ background: checked ? 'var(--theme-accent)' : 'color-mix(in srgb, var(--theme-surface) 40%, transparent)' }}
      >
        <span
          className="absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform"
          style={{ transform: checked ? 'translateX(16px)' : 'translateX(0)' }}
        />
      </button>
    </label>
  )
}

