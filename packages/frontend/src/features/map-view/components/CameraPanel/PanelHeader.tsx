import { X } from 'lucide-react'
import type { CameraSaveStatus } from '@/store/cameraStore/types'

interface PanelHeaderProps {
  saveStatus: CameraSaveStatus | null
  onClose: () => void
}

export default function PanelHeader({ saveStatus, onClose }: PanelHeaderProps) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3 border-b shrink-0"
      style={{ borderColor: 'color-mix(in srgb, var(--theme-surface) 20%, transparent)' }}
    >
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-bold" style={{ color: 'var(--theme-text-primary)' }}>Camera Properties</h2>
        {saveStatus === 'failed' && <span className="text-[10px] text-red-400 font-medium">Save failed</span>}
        {saveStatus === 'saving' && <span className="text-[10px] font-medium" style={{ color: 'var(--theme-accent)' }}>Saving…</span>}
      </div>
      <button
        onClick={onClose}
        className="transition-colors p-1 rounded"
        style={{ color: 'var(--theme-text-secondary)' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--theme-text-primary)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--theme-text-secondary)')}
        aria-label="Close panel"
      >
        <X size={14} />
      </button>
    </div>
  )
}
