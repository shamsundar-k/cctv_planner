// src/components/map/toolbar/ToolbarButton.tsx

import type { ReactNode } from 'react'

interface Props {
    icon: ReactNode
    label: string
    isActive: boolean
    onClick: () => void
}

export default function ToolbarButton({ icon, label, isActive, onClick }: Props) {
    return (
        <div className="relative group">
            <button
                onClick={onClick}
                className="w-8 h-8 flex items-center justify-center rounded-md cursor-pointer border transition-all"
                style={{
                    background: 'var(--theme-bg-card)',
                    borderColor: isActive
                        ? 'var(--theme-accent)'
                        : 'color-mix(in srgb, var(--theme-surface) 30%, transparent)',
                }}
                aria-label={label}
                aria-pressed={isActive}
            >
                <span style={{ color: isActive ? 'var(--theme-accent)' : 'var(--theme-text-secondary)' }}>
                    {icon}
                </span>
            </button>

            {/* Tooltip — only when panel is closed */}
            {!isActive && (
                <div
                    className="absolute right-[calc(100%+6px)] top-1/2 -translate-y-1/2 px-2 py-1 rounded text-[11px] whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                    style={{
                        background: 'color-mix(in srgb, var(--theme-bg-base) 90%, transparent)',
                        color: 'var(--theme-text-primary)',
                        border: '1px solid color-mix(in srgb, var(--theme-surface) 25%, transparent)',
                    }}
                >
                    {label}
                </div>
            )}
        </div>
    )
}