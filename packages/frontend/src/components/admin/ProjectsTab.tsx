/*
 * FILE SUMMARY — src/components/admin/ProjectsTab.tsx
 *
 * Projects tab panel in the admin dashboard. Displays a searchable card grid
 * of all projects visible to the admin.
 *
 * ProjectsTab({ projects, projectsLoading, projectSearch, onSearchChange,
 *   onDeleteProject }) — Renders:
 *   - A <SearchInput> for filtering projects by name (controlled via
 *     `projectSearch` / `onSearchChange` props, debounced upstream).
 *   - A project count badge.
 *   - While `projectsLoading`: a grid of 6 pulsing skeleton cards.
 *   - When the filtered list is empty: a centred empty-state message.
 *   - Otherwise: a responsive grid of project cards, each showing the project
 *     name, owner ID, camera count, creation date, and two action buttons:
 *     - "View" (placeholder, not yet routed).
 *     - "Delete" — calls `onDeleteProject(id, name)` to open the confirmation
 *       modal in AdminDashboard.
 */
import type { AdminProject } from '../../api/admin'
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
        <span className="text-sm text-slate-500">
          {projectsLoading
            ? '…'
            : `${projects.length} project${projects.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      {projectsLoading ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-slate-800 rounded-xl p-5 border border-slate-700 h-[140px] animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 text-slate-600 text-sm">
          {projectSearch ? 'No projects match your search.' : 'No projects found.'}
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-slate-800 rounded-xl p-5 border border-slate-700 hover:border-slate-600 flex flex-col gap-3 transition-colors"
            >
              <div>
                <h3 className="text-[15px] font-semibold text-slate-100 m-0 mb-1 overflow-hidden text-ellipsis whitespace-nowrap">
                  {project.name}
                </h3>
                <p className="text-xs text-slate-500 m-0">Owner: {project.owner_id}</p>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xl font-bold text-purple-500">{project.camera_count}</span>
                  <span className="text-[11px] text-slate-500">cameras</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-medium text-slate-400">
                    {formatDate(project.created_at)}
                  </span>
                  <span className="text-[11px] text-slate-500">created</span>
                </div>
              </div>

              <div className="flex gap-2 mt-auto">
                <button className="flex-1 h-[34px] bg-transparent text-sky-400 border border-sky-400/20 rounded-md text-[13px] cursor-pointer transition-colors hover:bg-sky-400/10">
                  View
                </button>
                <button
                  onClick={() => onDeleteProject(project.id, project.name)}
                  className="flex-1 h-[34px] bg-transparent text-red-500 border border-red-500/20 rounded-md text-[13px] cursor-pointer transition-colors hover:bg-red-500/10"
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
