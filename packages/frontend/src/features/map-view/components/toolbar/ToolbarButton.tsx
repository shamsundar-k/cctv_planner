import type { ReactNode } from 'react'

interface Props {
  icon: ReactNode
  label: string
  isActive: boolean
  onClick: () => void
}

export default function ToolbarButton({ icon, label, isActive, onClick }: Props) {
  return (
    <div className="group relative">
      <button
        type="button"
        onClick={onClick}
        className={`flex size-9 items-center justify-center rounded-lg border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
          isActive
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-panel-border bg-panel text-text-secondary hover:border-primary/50 hover:bg-background hover:text-text-primary'
        }`}
        aria-label={label}
        aria-pressed={isActive}
      >
        {icon}
      </button>

      {!isActive && (
        <div className="pointer-events-none absolute right-[calc(100%+6px)] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md border border-panel-border bg-panel px-2 py-1 text-[11px] font-medium text-text-primary opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          {label}
        </div>
      )}
    </div>
  )
}
