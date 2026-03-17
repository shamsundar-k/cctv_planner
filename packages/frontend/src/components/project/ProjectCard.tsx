import { memo, useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router'
import type { Project } from '../../api/projects'

function formatRelativeTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diffMs / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} minute${mins !== 1 ? 's' : ''} ago`
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`
  if (weeks < 4) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`
  return `${months} month${months !== 1 ? 's' : ''} ago`
}

function formatCoord(val: number, type: 'lat' | 'lng'): string {
  const dir = type === 'lat' ? (val >= 0 ? 'N' : 'S') : val >= 0 ? 'E' : 'W'
  return `${Math.abs(val).toFixed(4)}° ${dir}`
}

interface ProjectCardProps {
  project: Project
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
}

function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const navigate = useNavigate()
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

  const hasLocation = project.center_lat !== null && project.center_lng !== null

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex flex-col gap-2.5 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-default">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <h3
          className="text-lg font-semibold text-slate-100 m-0 overflow-hidden text-ellipsis whitespace-nowrap flex-1"
          title={project.name}
        >
          {project.name}
        </h3>

        {/* More menu (···) */}
        <div ref={menuRef} className="relative shrink-0">
          <button
            aria-label="More options"
            onClick={() => setMenuOpen((o) => !o)}
            className="bg-transparent border-none cursor-pointer text-lg text-slate-400 hover:text-slate-200 px-1 leading-none rounded hover:bg-slate-700 transition-colors"
          >
            ···
          </button>
          {menuOpen && (
            <div className="absolute top-[calc(100%+4px)] right-0 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl min-w-[160px] z-10 py-1">
              <button
                className="block w-full text-left bg-transparent border-none px-3.5 py-2.5 text-sm text-slate-300 cursor-pointer hover:bg-slate-700 hover:text-slate-100 transition-colors"
                onClick={() => { setMenuOpen(false); onEdit(project) }}
              >
                Edit Project
              </button>
              <button
                className="block w-full text-left bg-transparent border-none px-3.5 py-2.5 text-sm text-slate-600 cursor-not-allowed opacity-60"
                disabled
                title="Archive coming soon"
              >
                Archive Project
              </button>
              <div className="border-t border-slate-700 my-1" />
              <button
                className="block w-full text-left bg-transparent border-none px-3.5 py-2.5 text-sm text-red-400 cursor-pointer hover:bg-slate-700 transition-colors"
                onClick={() => { setMenuOpen(false); onDelete(project) }}
              >
                Delete Project
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Metadata row: cameras + zones */}
      <div className="flex items-center gap-3 text-[13px] text-slate-400">
        <span title={`${project.camera_count} camera${project.camera_count !== 1 ? 's' : ''}`}>
          📷 {project.camera_count} camera{project.camera_count !== 1 ? 's' : ''}
        </span>
        <span className="text-slate-700">|</span>
        <span title={`${project.zone_count} zone${project.zone_count !== 1 ? 's' : ''}`}>
          📝 {project.zone_count} zone{project.zone_count !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Location row */}
      {hasLocation && (
        <div className="text-[13px] text-slate-400">
          📍 {formatCoord(project.center_lat!, 'lat')}, {formatCoord(project.center_lng!, 'lng')}
        </div>
      )}

      {/* Description */}
      {project.description ? (
        <p className="text-sm text-slate-400 m-0 leading-relaxed line-clamp-2 grow">
          {project.description}
        </p>
      ) : (
        <p className="text-sm text-slate-600 m-0 italic grow">No description</p>
      )}

      {/* Timestamps */}
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-slate-500">Created: {formatRelativeTime(project.created_at)}</span>
        <span className="text-xs text-slate-500">Modified: {formatRelativeTime(project.updated_at)}</span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => navigate(`/projects/${project.id}`)}
          className="flex-1 h-[34px] bg-blue-600 hover:bg-blue-700 text-white border-none rounded-md text-sm font-semibold cursor-pointer transition-colors"
        >
          Open
        </button>
        <button
          onClick={() => onEdit(project)}
          className="flex-1 h-[34px] bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 rounded-md text-sm font-semibold cursor-pointer transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(project)}
          className="flex-1 h-[34px] bg-transparent hover:bg-red-500/10 text-red-400 border border-red-500/50 rounded-md text-sm font-semibold cursor-pointer transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  )
}

export default memo(ProjectCard)
