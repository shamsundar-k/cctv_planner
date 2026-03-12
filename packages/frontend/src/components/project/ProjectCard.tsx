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
  const [hovered, setHovered] = useState(false)
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

  const cardStyle: React.CSSProperties = {
    background: '#ffffff',
    border: '1px solid #e0e0e0',
    borderRadius: 8,
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    boxShadow: hovered
      ? '0 10px 15px rgba(0,0,0,0.15)'
      : '0 4px 6px rgba(0,0,0,0.1)',
    transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
    transition: 'all 200ms ease',
    cursor: 'default',
  }

  const hasLocation = project.center_lat !== null && project.center_lng !== null

  return (
    <div
      style={cardStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <h3
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: '#1a1a1a',
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
          }}
          title={project.name}
        >
          {project.name}
        </h3>

        {/* More menu (···) */}
        <div ref={menuRef} style={{ position: 'relative', flexShrink: 0 }}>
          <button
            aria-label="More options"
            onClick={() => setMenuOpen((o) => !o)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 18,
              color: '#666',
              padding: '0 4px',
              lineHeight: 1,
              borderRadius: 4,
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#f5f5f5')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'none')}
          >
            ···
          </button>
          {menuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                right: 0,
                background: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: 6,
                boxShadow: '0 10px 15px rgba(0,0,0,0.15)',
                minWidth: 160,
                zIndex: 10,
              }}
            >
              <button
                style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '10px 14px', fontSize: 14, color: '#1a1a1a', cursor: 'pointer' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#f5f5f5')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'none')}
                onClick={() => { setMenuOpen(false); onEdit(project) }}
              >
                Edit Project
              </button>
              <button
                style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '10px 14px', fontSize: 14, color: '#666666', cursor: 'not-allowed', opacity: 0.6 }}
                disabled
                title="Archive coming soon"
              >
                Archive Project
              </button>
              <div style={{ borderTop: '1px solid #f0f0f0', margin: '4px 0' }} />
              <button
                style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '10px 14px', fontSize: 14, color: '#dd0000', cursor: 'pointer' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#fff5f5')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'none')}
                onClick={() => { setMenuOpen(false); onDelete(project) }}
              >
                Delete Project
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Metadata row: cameras + zones */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#666666' }}>
        <span title={`${project.camera_count} camera${project.camera_count !== 1 ? 's' : ''}`}>
          📷 {project.camera_count} camera{project.camera_count !== 1 ? 's' : ''}
        </span>
        <span style={{ color: '#d0d0d0' }}>|</span>
        <span title={`${project.zone_count} zone${project.zone_count !== 1 ? 's' : ''}`}>
          📝 {project.zone_count} zone{project.zone_count !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Location row */}
      {hasLocation && (
        <div style={{ fontSize: 13, color: '#666666' }}>
          📍 {formatCoord(project.center_lat!, 'lat')}, {formatCoord(project.center_lng!, 'lng')}
        </div>
      )}

      {/* Description */}
      {project.description ? (
        <p
          style={{
            fontSize: 14,
            color: '#666666',
            margin: 0,
            lineHeight: 1.6,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flexGrow: 1,
          }}
        >
          {project.description}
        </p>
      ) : (
        <p style={{ fontSize: 14, color: '#999999', margin: 0, fontStyle: 'italic', flexGrow: 1 }}>
          No description
        </p>
      )}

      {/* Timestamps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 12, color: '#777777' }}>
          Created: {formatRelativeTime(project.created_at)}
        </span>
        <span style={{ fontSize: 12, color: '#777777' }}>
          Modified: {formatRelativeTime(project.updated_at)}
        </span>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
        <button
          onClick={() => navigate(`/projects/${project.id}`)}
          style={{
            flex: 1,
            height: 34,
            background: '#0066cc',
            color: '#ffffff',
            border: 'none',
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#0052a3')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = '#0066cc')}
        >
          Open
        </button>
        <button
          onClick={() => onEdit(project)}
          style={{
            flex: 1,
            height: 34,
            background: '#ffffff',
            color: '#1a1a1a',
            border: '1px solid #d0d0d0',
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#f5f5f5')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = '#ffffff')}
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(project)}
          style={{
            flex: 1,
            height: 34,
            background: '#ffffff',
            color: '#dd0000',
            border: '1px solid #dd0000',
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#fff0f0')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = '#ffffff')}
        >
          Delete
        </button>
      </div>
    </div>
  )
}

export default memo(ProjectCard)
