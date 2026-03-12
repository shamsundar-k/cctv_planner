import { create } from 'zustand'

export type FilterType = 'all' | 'mine' | 'archived'

export type SortBy =
  | 'modified_desc'
  | 'modified_asc'
  | 'name_asc'
  | 'name_desc'
  | 'created_desc'
  | 'created_asc'

interface ProjectSlice {
  filterType: FilterType
  sortBy: SortBy
  searchQuery: string
  setFilterType: (filter: FilterType) => void
  setSortBy: (sort: SortBy) => void
  setSearchQuery: (query: string) => void
}

export const useProjectStore = create<ProjectSlice>((set) => ({
  filterType: 'all',
  sortBy: 'modified_desc',
  searchQuery: '',
  setFilterType: (filterType) => set({ filterType }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}))
