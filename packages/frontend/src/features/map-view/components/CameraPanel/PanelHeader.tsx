import { X } from 'lucide-react'
import type { CameraSaveStatus } from '@/store/cameraStore/types'

interface PanelHeaderProps {
  saveStatus: CameraSaveStatus | null
  onClose: () => void
}

export default function PanelHeader({ saveStatus, onClose }: PanelHeaderProps) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-panel-border px-4 py-3">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-bold text-text-primary">Camera Properties</h2>
        {saveStatus === 'failed' && <span className="text-[10px] font-medium text-error">Save failed</span>}
        {saveStatus === 'saving' && <span className="text-[10px] font-medium text-primary">Saving...</span>}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="rounded-md p-1 text-text-secondary transition-colors hover:bg-background hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        aria-label="Close camera properties"
      >
        <X size={14} aria-hidden />
      </button>
    </div>
  )
}
