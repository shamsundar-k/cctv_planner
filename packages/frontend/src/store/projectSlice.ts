/*
 * FILE SUMMARY — src/store/projectSlice.ts
 *
 * Zustand store for project list UI state (sort and search). This
 * state is NOT persisted — it resets on page reload.
 *
 * useProjectStore — The exported Zustand store hook. Holds the following state
 *   and actions:
 *
 *   State:
 *     sortBy       — SortBy enum (e.g. "modified_desc", "name_asc"). Controls
 *                    the sort order of the project list. Defaults to
 *                    "modified_desc".
 *     searchQuery  — string. The current search string used to filter projects
 *                    by name. Defaults to "".
 *
 *   Actions:
 *     setSortBy(sort)       — Updates the active sort key.
 *     setSearchQuery(query) — Updates the search string.
 *
 * Consumed by DashboardPage/Header for sorting and searching.
 */
import { create } from 'zustand'

export type SortBy =
  | 'modified_desc'
  | 'modified_asc'
  | 'name_asc'
  | 'name_desc'

interface ProjectSlice {
  sortBy: SortBy
  searchQuery: string
  setSortBy: (sort: SortBy) => void
  setSearchQuery: (query: string) => void
}

export const useProjectStore = create<ProjectSlice>((set) => ({
  sortBy: 'modified_desc',
  searchQuery: '',
  setSortBy: (sortBy) => set({ sortBy }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}))
