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
    <div className="group relative">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`flex size-9 items-center justify-center rounded-lg border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
          isActive
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-panel-border bg-panel text-text-secondary hover:border-primary/50 hover:bg-background hover:text-text-primary'
        } disabled:cursor-not-allowed disabled:border-disabled disabled:bg-disabled disabled:text-disabled-foreground`}
        aria-label={label}
        aria-pressed={isActive}
      >
        {icon}
      </button>

      <div className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-panel-border bg-panel px-2 py-1 text-[11px] font-medium text-text-primary opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        {tooltip ?? label}
      </div>
    </div>
  )
}
