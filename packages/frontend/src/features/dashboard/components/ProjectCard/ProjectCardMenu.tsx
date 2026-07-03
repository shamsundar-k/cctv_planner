import { useState, useRef, useEffect } from 'react'
import { MoreHorizontal } from 'lucide-react'
import type { ProjectRecord } from '../../../../types/projects.types'

interface ProjectCardMenuProps {
  project: ProjectRecord
  onDelete: (project: ProjectRecord) => void
}

export default function ProjectCardMenu({ project, onDelete }: ProjectCardMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  return (
    <div ref={menuRef} className="relative shrink-0">
      <button
        aria-label="More options"
        onClick={() => setMenuOpen((o) => !o)}
        className="flex size-7 items-center justify-center bg-transparent border-none cursor-pointer rounded transition-colors text-text-muted hover:bg-divider/60 hover:text-text-primary"
      >
        <MoreHorizontal size={18} aria-hidden="true" />
      </button>
      {menuOpen && (
        <div className="absolute top-[calc(100%+4px)] right-0 rounded-lg shadow-2xl min-w-[160px] z-10 py-1 overflow-hidden bg-panel border border-panel-border">
          <button
            className="block w-full text-left bg-transparent border-none px-3.5 py-2.5 text-sm cursor-pointer transition-colors text-error hover:bg-error/10"
            onClick={() => { setMenuOpen(false); onDelete(project) }}
          >
            Delete Project
          </button>
        </div>
      )}
    </div>
  )
}
