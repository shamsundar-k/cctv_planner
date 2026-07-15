import type { ReactNode } from 'react'

export function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-0.5 text-[10px] uppercase text-text-secondary">{label}</p>
      <p className="truncate text-xs text-text-primary">{value}</p>
    </div>
  )
}

export function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-[10px] uppercase text-text-secondary">{label}</p>
      {children}
    </div>
  )
}

export const inputCls =
  'w-full rounded-md border border-panel-border bg-background px-2 py-1.5 text-xs text-text-primary outline-none transition-colors hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/15'
