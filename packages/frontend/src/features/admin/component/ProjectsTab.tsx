import type { AdminProject } from '../api/admin.types'
import SearchInput from './SearchInput'
import { formatDate } from './utils'

interface ProjectsTabProps {
  projects: AdminProject[]
  projectsLoading: boolean
  projectSearch: string
  onSearchChange: (v: string) => void
  onDeleteProject: (id: string, name: string) => void
}

export default function ProjectsTab({
  projects,
  projectsLoading,
  projectSearch,
  onSearchChange,
  onDeleteProject,
}: ProjectsTabProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <SearchInput
          value={projectSearch}
          onChange={onSearchChange}
          placeholder="Search by project name…"
        />
        <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
          {projectsLoading
            ? '…'
            : `${projects.length} project${projects.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      {projectsLoading ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl p-5 h-[140px] animate-pulse"
              style={{ background: 'color-mix(in srgb, var(--theme-bg-card) 80%, transparent)', border: '1px solid color-mix(in srgb, var(--theme-surface) 25%, transparent)' }}
            />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 text-sm" style={{ color: 'color-mix(in srgb, var(--theme-text-secondary) 40%, transparent)' }}>
          {projectSearch ? 'No projects match your search.' : 'No projects found.'}
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="rounded-xl p-5 flex flex-col gap-3 transition-all hover:-translate-y-0.5"
              style={{ background: 'color-mix(in srgb, var(--theme-bg-card) 80%, transparent)', border: '1px solid color-mix(in srgb, var(--theme-surface) 25%, transparent)' }}
            >
              <div>
                <h3 className="text-[15px] font-bold m-0 mb-1 overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: 'var(--theme-text-primary)' }}>
                  {project.name}
                </h3>
                <p className="text-xs m-0 font-mono" style={{ color: 'color-mix(in srgb, var(--theme-text-secondary) 60%, transparent)' }}>
                  Owner: {project.owner_id}
                </p>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xl font-extrabold" style={{ color: 'var(--theme-accent)' }}>{project.camera_count}</span>
                  <span className="text-[11px]" style={{ color: 'var(--theme-text-secondary)' }}>cameras</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-semibold" style={{ color: 'var(--theme-text-secondary)' }}>
                    {formatDate(project.created_at)}
                  </span>
                  <span className="text-[11px]" style={{ color: 'color-mix(in srgb, var(--theme-text-secondary) 60%, transparent)' }}>created</span>
                </div>
              </div>

              <div className="flex gap-2 mt-auto">
                <button
                  className="flex-1 h-[34px] bg-transparent rounded-lg text-[13px] cursor-pointer transition-colors font-semibold"
                  style={{ color: 'var(--theme-text-primary)', border: '1px solid color-mix(in srgb, var(--theme-surface) 30%, transparent)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'color-mix(in srgb, var(--theme-surface) 15%, transparent)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  View
                </button>
                <button
                  onClick={() => onDeleteProject(project.id, project.name)}
                  className="flex-1 h-[34px] bg-transparent rounded-lg text-[13px] cursor-pointer transition-colors font-semibold"
                  style={{ color: 'var(--theme-accent)', border: '1px solid color-mix(in srgb, var(--theme-accent) 30%, transparent)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'color-mix(in srgb, var(--theme-accent) 10%, transparent)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
