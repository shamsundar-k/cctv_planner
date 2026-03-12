import { useMemo, useState } from 'react'
import { useAuthStore } from '../store/authSlice'
import { useProjectStore } from '../store/projectSlice'
import { useProjects, type Project } from '../api/projects'
import Navbar from '../components/layout/Navbar'
import ProjectToolbar from '../components/project/ProjectToolbar'
import ProjectList from '../components/project/ProjectList'
import CreateProjectModal from '../components/project/CreateProjectModal'
import EditProjectModal from '../components/project/EditProjectModal'
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
  | { type: 'edit'; project: Project }
  | { type: 'delete'; project: Project }

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const { filterType, sortBy, searchQuery } = useProjectStore()
  const { data: projects = [], isLoading, isError, isFetching, refetch } = useProjects()
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
    <div className="min-h-screen bg-[#f5f5f5]">
      <Navbar />

      <main style={{ maxWidth: 1600, margin: '0 auto', padding: '40px' }}>
        <ProjectToolbar
          pageTitle={pageTitle}
          filteredCount={filtered.length}
          isAdmin={isAdmin}
          onCreateClick={() => setModal({ type: 'create' })}
          onRefresh={() => refetch()}
          isFetching={isFetching}
        />

        {isError && (
          <p style={{ color: '#dd0000', fontSize: 14, marginBottom: 24 }}>
            Failed to load projects.{' '}
            <button
              onClick={() => refetch()}
              style={{ color: '#0066cc', cursor: 'pointer', background: 'none', border: 'none', fontSize: 14, padding: 0 }}
            >
              Retry
            </button>
          </p>
        )}

        <ProjectList
          projects={filtered}
          isLoading={isLoading}
          onEdit={(project) => setModal({ type: 'edit', project })}
          onDelete={(project) => setModal({ type: 'delete', project })}
          onCreateClick={() => setModal({ type: 'create' })}
        />
      </main>

      {modal.type === 'create' && (
        <CreateProjectModal onClose={() => setModal({ type: 'none' })} />
      )}
      {modal.type === 'edit' && (
        <EditProjectModal project={modal.project} onClose={() => setModal({ type: 'none' })} />
      )}
      {modal.type === 'delete' && (
        <DeleteProjectModal project={modal.project} onClose={() => setModal({ type: 'none' })} />
      )}
    </div>
  )
}
