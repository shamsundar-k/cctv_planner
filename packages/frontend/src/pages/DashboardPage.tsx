/*
 * FILE SUMMARY — src/pages/DashboardPage.tsx
 *
 * Main project dashboard page rendered at /. Lists all accessible projects
 * with filtering, sorting, searching, and create/delete capabilities.
 *
 * DashboardPage() — Composes the full dashboard layout:
 *   - <Navbar> at the top.
 *   - <ProjectToolbar> for create, search, filter, sort, and refresh.
 *   - An optional inline error message with a "Retry" button when the projects
 *     query fails.
 *   - <ProjectList> rendering the filtered/sorted project cards.
 *   - Conditionally renders <CreateProjectModal> or <DeleteProjectModal>
 *     based on the `modal` state.
 *
 * applyFiltersAndSort(projects, { searchQuery, filterType, sortBy,
 *   currentUserId }) — Pure helper function that:
 *   - Filters projects by a case-insensitive name search.
 *   - Applies "mine" filter (owner_id === currentUserId) when filterType is
 *     "mine". "archived" filtering is handled server-side (not implemented).
 *   - Sorts the result by one of six SortBy keys (modified desc/asc, name
 *     asc/desc, created desc/asc).
 *   Returns the filtered and sorted array. Memoised with useMemo.
 *
 * Modal state is a union type: { type: 'none' } | { type: 'create' } |
 * { type: 'delete'; project: Project }. Opening create or delete modals sets
 * the appropriate modal state; closing resets to 'none'.
 */
import { useMemo, useState } from 'react'
import { useAuthStore } from '../store/authSlice'
import { useProjectStore } from '../store/projectSlice'
import { useProjects } from '../api/projects'
import type { Project } from '../api/projects.types'
import Navbar from '../components/layout/Navbar'
import ProjectToolbar from '../components/project/ProjectToolbar'
import ProjectList from '../components/project/ProjectList'
import CreateProjectModal from '../components/project/CreateProjectModal'
import DeleteProjectModal from '../components/project/DeleteProjectModal'

function applyFiltersAndSort(
  projects: Project[],
  {
    searchQuery,
    filterType,
    sortBy,
    currentUserId,
  }: {
    searchQuery: string
    filterType: string
    sortBy: string
    currentUserId: string
  }
): Project[] {
  let result = [...projects]

  // Search filter
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase()
    result = result.filter((p) => p.name.toLowerCase().includes(q))
  }

  // Filter type (only 'mine' needs processing; 'archived' requires backend support)
  if (filterType === 'mine') {
    result = result.filter((p) => p.owner_id === currentUserId)
  }

  // Sort
  result.sort((a, b) => {
    switch (sortBy) {
      case 'modified_desc':
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      case 'modified_asc':
        return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
      case 'name_asc':
        return a.name.localeCompare(b.name)
      case 'name_desc':
        return b.name.localeCompare(a.name)
      case 'created_desc':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'created_asc':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      default:
        return 0
    }
  })

  return result
}

type ModalState =
  | { type: 'none' }
  | { type: 'create' }
  | { type: 'delete'; project: Project }

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const { filterType, sortBy, searchQuery } = useProjectStore()
  const { data: projects = [], isLoading, isError, isFetching, refetch, dataUpdatedAt } = useProjects()
  const [modal, setModal] = useState<ModalState>({ type: 'none' })

  const filtered = useMemo(
    () =>
      applyFiltersAndSort(projects, {
        searchQuery,
        filterType,
        sortBy,
        currentUserId: user?.id ?? '',
      }),
    [projects, searchQuery, filterType, sortBy, user?.id]
  )

  const isAdmin = user?.role === 'admin'
  const pageTitle = isAdmin ? 'All Projects' : 'My Projects'

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(135deg, var(--theme-bg-base) 0%, color-mix(in srgb, var(--theme-bg-card) 40%, var(--theme-bg-base)) 100%)` }}>
      <Navbar />

      <main className="max-w-[1600px] mx-auto px-10 py-10">
        <ProjectToolbar
          pageTitle={pageTitle}
          filteredCount={filtered.length}
          isAdmin={isAdmin}
          onCreateClick={() => setModal({ type: 'create' })}
          onRefresh={() => refetch()}
          isFetching={isFetching}
          dataUpdatedAt={dataUpdatedAt}
        />

        {isError && (
          <p className="text-sm text-red-300/80 mb-6 bg-red-900/20 border border-red-500/30 rounded-xl px-4 py-3">
            Failed to load projects.{' '}
            <button
              onClick={() => refetch()}
              className="text-[#CADBBD] hover:text-white cursor-pointer bg-transparent border-none text-sm p-0 font-semibold"
            >
              Retry
            </button>
          </p>
        )}

        <ProjectList
          projects={filtered}
          isLoading={isLoading}
          onDelete={(project) => setModal({ type: 'delete', project })}
          onCreateClick={() => setModal({ type: 'create' })}
        />
      </main>

      {modal.type === 'create' && (
        <CreateProjectModal onClose={() => setModal({ type: 'none' })} />
      )}
      {modal.type === 'delete' && (
        <DeleteProjectModal project={modal.project} onClose={() => setModal({ type: 'none' })} />
      )}
    </div>
  )
}
