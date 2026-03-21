/*
 * FILE SUMMARY — src/store/projectSlice.ts
 *
 * Zustand store for project list UI state (filter, sort, and search). This
 * state is NOT persisted — it resets on page reload.
 *
 * useProjectStore — The exported Zustand store hook. Holds the following state
 *   and actions:
 *
 *   State:
 *     filterType   — FilterType ("all" | "mine" | "archived"). Controls which
 *                    subset of projects is shown. Defaults to "all".
 *     sortBy       — SortBy enum (e.g. "modified_desc", "name_asc"). Controls
 *                    the sort order of the project list. Defaults to
 *                    "modified_desc".
 *     searchQuery  — string. The current search string used to filter projects
 *                    by name. Defaults to "".
 *
 *   Actions:
 *     setFilterType(filter) — Updates the active filter type.
 *     setSortBy(sort)       — Updates the active sort key.
 *     setSearchQuery(query) — Updates the search string.
 *
 * Consumed by DashboardPage (for filtering/sorting logic) and ProjectToolbar
 * (for reading and writing filter/sort/search state).
 */
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
