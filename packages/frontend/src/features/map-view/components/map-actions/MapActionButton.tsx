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
        className={[
          'w-8 h-8 flex items-center justify-center rounded-lg border transition-all',
          isActive ? 'bg-accent border-accent' : 'bg-card border-surface/30',
          disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
        ].join(' ')}
        aria-label={label}
        aria-pressed={isActive}
        aria-disabled={disabled}
      >
        <span className={isActive ? 'text-on-accent' : 'text-muted'}>
          {icon}
        </span>
      </button>

      <div className="absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 px-2 py-1 rounded text-[11px] whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-canvas/90 text-primary border border-surface/25">
        {tooltip ?? label}
      </div>
    </div>
  )
}
