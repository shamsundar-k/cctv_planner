import { useState, useRef, useEffect } from 'react'
import type { Project } from '../../../api/projects.types'

interface ProjectCardMenuProps {
  project: Project
  onDelete: (project: Project) => void
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
        className="bg-transparent border-none cursor-pointer text-lg px-1 leading-none rounded transition-colors text-muted/70 hover:bg-surface/20"
      >
        ···
      </button>
      {menuOpen && (
        <div className="absolute top-[calc(100%+4px)] right-0 rounded-xl shadow-2xl min-w-[160px] z-10 py-1 overflow-hidden bg-card border border-surface/30">
          <button
            className="block w-full text-left bg-transparent border-none px-3.5 py-2.5 text-sm cursor-not-allowed opacity-40 text-muted"
            disabled
            title="Archive coming soon"
          >
            Archive Project
          </button>
          <div className="my-1 border-t border-surface/20" />
          <button
            className="block w-full text-left bg-transparent border-none px-3.5 py-2.5 text-sm cursor-pointer transition-colors text-accent hover:bg-accent/10"
            onClick={() => { setMenuOpen(false); onDelete(project) }}
          >
            Delete Project
          </button>
        </div>
      )}
    </div>
  )
}
