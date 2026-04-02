/*
 * FILE SUMMARY — src/components/project/ProjectCard.tsx
 *
 * Individual project card displayed in the dashboard grid.
 *
 * ProjectCard({ project, onDelete }) — Memoised card component (React.memo)
 *   that renders all relevant information for a single project:
 *   - Project name with a "···" overflow menu button.
 *   - Camera count and zone count metadata.
 *   - Map centre coordinates (shown only when center_lat/center_lng are set).
 *   - Project description (or "No description" italic placeholder).
 *   - Relative timestamps for created_at and updated_at.
 *   - Three action buttons: "Open" (navigates to /projects/:id), "Manage"
 *     (navigates to /project/manage/:id), and "Delete" (calls `onDelete`).
 *
 * The overflow menu (···) offers "Archive Project" (disabled placeholder) and
 * "Delete Project" (calls `onDelete` and closes menu). Clicking outside the
 * menu closes it via a mousedown listener.
 *
 * formatRelativeTime(dateStr) — Internal helper; converts an ISO date string
 *   to a human-readable relative time string (e.g. "3 minutes ago", "2 days
 *   ago", "just now").
 *
 * formatCoord(val, type) — Internal helper; formats a latitude or longitude
 *   number as "DD.DDDD° N/S/E/W" for display in the location row.
 */
import { memo, useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router'
import type { Project } from '../../api/projects.types'

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
  onDelete: (project: Project) => void
}

function ProjectCard({ project, onDelete }: ProjectCardProps) {
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
    <div
      className="rounded-xl p-6 flex flex-col gap-2.5 shadow-md hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:-translate-y-1 transition-all duration-200 cursor-default backdrop-blur-sm"
      style={{ background: 'color-mix(in srgb, var(--theme-bg-card) 70%, transparent)', border: '1px solid color-mix(in srgb, var(--theme-surface) 25%, transparent)' }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <h3
          className="text-lg font-bold m-0 overflow-hidden text-ellipsis whitespace-nowrap flex-1"
          style={{ color: 'var(--theme-text-primary)' }}
          title={project.name}
        >
          {project.name}
        </h3>

        {/* More menu (···) */}
        <div ref={menuRef} className="relative shrink-0">
          <button
            aria-label="More options"
            onClick={() => setMenuOpen((o) => !o)}
            className="bg-transparent border-none cursor-pointer text-lg px-1 leading-none rounded transition-colors"
            style={{ color: 'color-mix(in srgb, var(--theme-text-secondary) 70%, transparent)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'color-mix(in srgb, var(--theme-surface) 20%, transparent)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            ···
          </button>
          {menuOpen && (
            <div
              className="absolute top-[calc(100%+4px)] right-0 rounded-xl shadow-2xl min-w-[160px] z-10 py-1 overflow-hidden"
              style={{ background: 'var(--theme-bg-card)', border: '1px solid color-mix(in srgb, var(--theme-surface) 30%, transparent)' }}
            >
              <button
                className="block w-full text-left bg-transparent border-none px-3.5 py-2.5 text-sm cursor-not-allowed opacity-40"
                style={{ color: 'var(--theme-text-secondary)' }}
                disabled
                title="Archive coming soon"
              >
                Archive Project
              </button>
              <div className="my-1" style={{ borderTop: '1px solid color-mix(in srgb, var(--theme-surface) 20%, transparent)' }} />
              <button
                className="block w-full text-left bg-transparent border-none px-3.5 py-2.5 text-sm cursor-pointer transition-colors"
                style={{ color: 'var(--theme-accent)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'color-mix(in srgb, var(--theme-accent) 10%, transparent)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                onClick={() => { setMenuOpen(false); onDelete(project) }}
              >
                Delete Project
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Metadata row: cameras + zones */}
      <div className="flex items-center gap-3 text-[13px]" style={{ color: 'color-mix(in srgb, var(--theme-text-secondary) 80%, transparent)' }}>
        <span>📷 {project.camera_count} camera{project.camera_count !== 1 ? 's' : ''}</span>
        <span style={{ color: 'color-mix(in srgb, var(--theme-surface) 40%, transparent)' }}>|</span>
        <span>📝 {project.zone_count} zone{project.zone_count !== 1 ? 's' : ''}</span>
      </div>

      {/* Location row */}
      {hasLocation && (
        <div className="text-[13px] text-[#9E9A5A]/70">
          📍 {formatCoord(project.center_lat!, 'lat')}, {formatCoord(project.center_lng!, 'lng')}
        </div>
      )}

      {/* Description */}
      {project.description ? (
        <p className="text-sm text-[#CADBBD]/60 m-0 leading-relaxed line-clamp-2 grow">
          {project.description}
        </p>
      ) : (
        <p className="text-sm text-[#8C6E9E]/40 m-0 italic grow">No description</p>
      )}

      {/* Timestamps */}
      <div className="flex flex-col gap-0.5">
        <span className="text-xs" style={{ color: 'color-mix(in srgb, var(--theme-text-secondary) 60%, transparent)' }}>Created: {formatRelativeTime(project.created_at)}</span>
        <span className="text-xs" style={{ color: 'color-mix(in srgb, var(--theme-text-secondary) 60%, transparent)' }}>Modified: {formatRelativeTime(project.updated_at)}</span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => navigate(`/projects/${project.id}`)}
          className="flex-1 h-[34px] border-none rounded-lg text-sm font-bold cursor-pointer transition-all shadow-md"
          style={{ background: 'var(--theme-accent)', color: 'var(--theme-accent-text)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--theme-accent-hover)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--theme-bg-base)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--theme-accent)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--theme-accent-text)' }}
        >
          Open
        </button>
        <button
          onClick={() => navigate(`/project/manage/${project.id}`)}
          className="flex-1 h-[34px] rounded-lg text-sm font-semibold cursor-pointer transition-colors"
          style={{ background: 'color-mix(in srgb, var(--theme-surface) 15%, transparent)', color: 'color-mix(in srgb, var(--theme-text-primary) 80%, transparent)', border: '1px solid color-mix(in srgb, var(--theme-surface) 30%, transparent)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'color-mix(in srgb, var(--theme-surface) 30%, transparent)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'color-mix(in srgb, var(--theme-surface) 15%, transparent)')}
        >
          Manage
        </button>
        <button
          onClick={() => onDelete(project)}
          className="flex-1 h-[34px] bg-transparent rounded-lg text-sm font-semibold cursor-pointer transition-colors"
          style={{ color: 'var(--theme-accent)', border: '1px solid color-mix(in srgb, var(--theme-accent) 40%, transparent)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'color-mix(in srgb, var(--theme-accent) 10%, transparent)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          Delete
        </button>
      </div>
    </div>
  )
}

export default memo(ProjectCard)
