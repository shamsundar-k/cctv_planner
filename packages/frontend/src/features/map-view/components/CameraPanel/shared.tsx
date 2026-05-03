import type React from 'react'

export function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide mb-0.5" style={{ color: 'var(--theme-text-secondary)' }}>{label}</p>
      <p className="text-xs truncate" style={{ color: 'var(--theme-text-primary)' }}>{value}</p>
    </div>
  )
}

export function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: 'var(--theme-text-secondary)' }}>{label}</p>
      {children}
    </div>
  )
}

export const inputStyle: React.CSSProperties = {
  background: 'color-mix(in srgb, var(--theme-surface) 20%, transparent)',
  border: '1px solid color-mix(in srgb, var(--theme-surface) 35%, transparent)',
  color: 'var(--theme-text-primary)',
}

export const inputCls = 'rounded-md text-xs px-2 py-1.5 w-full focus:outline-none'
