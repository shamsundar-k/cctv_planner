import { useMemo, useState } from 'react'
import { useAuthStore } from '../../auth'
import { useProjectStore } from '../../../store/projectSlice'
import { useProjects } from '@/hooks/useProjects'
import type { ProjectRecord } from '../../../types/projects.types'

export type ModalState =
  | { type: 'none' }
  | { type: 'create' }
  | { type: 'delete'; project: ProjectRecord }

function applyFiltersAndSort(
  projects: ProjectRecord[],
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
): ProjectRecord[] {
  let result = [...projects]

  // Search filter
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase()
    result = result.filter((p) => p.name.toLowerCase().includes(q))
  }

  // Filter type (only 'mine' needs processing; 'archived' requires backend support)
  if (filterType === 'mine') {
    result = result.filter((p) => p.created_by_id === currentUserId)
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

export function useDashboard() {
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

  return { filtered, isLoading, isError, isFetching, refetch, dataUpdatedAt, modal, setModal, isAdmin, pageTitle }
}
