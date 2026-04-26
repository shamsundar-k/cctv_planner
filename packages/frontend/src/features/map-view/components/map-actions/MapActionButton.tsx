import type { ReactNode } from 'react'

interface Props {
  icon: ReactNode
  label: string
  tooltip?: string
  isActive?: boolean
  disabled?: boolean
  onClick?: () => void
}

export default function MapActionButton({ icon, label, tooltip, isActive = false, disabled = false, onClick }: Props) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        disabled={disabled}
        className="w-8 h-8 flex items-center justify-center rounded-lg border transition-all"
        style={{
          background: isActive ? 'var(--theme-accent)' : 'var(--theme-bg-card)',
          borderColor: isActive
            ? 'var(--theme-accent)'
            : 'color-mix(in srgb, var(--theme-surface) 30%, transparent)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.4 : 1,
        }}
        aria-label={label}
        aria-pressed={isActive}
        aria-disabled={disabled}
      >
        <span
          style={{
            color: isActive ? 'var(--theme-accent-text)' : 'var(--theme-text-secondary)',
          }}
        >
          {icon}
        </span>
      </button>

      <div
        className="absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 px-2 py-1 rounded text-[11px] whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150"
        style={{
          background: 'color-mix(in srgb, var(--theme-bg-base) 90%, transparent)',
          color: 'var(--theme-text-primary)',
          border: '1px solid color-mix(in srgb, var(--theme-surface) 25%, transparent)',
        }}
      >
        {tooltip ?? label}
      </div>
    </div>
  )
}
