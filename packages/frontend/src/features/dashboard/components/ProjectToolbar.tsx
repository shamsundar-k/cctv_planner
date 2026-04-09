/*
 * FILE SUMMARY — src/features/dashboard/components/ProjectToolbar.tsx
 *
 * Toolbar rendered above the project list on the DashboardPage. Provides
 * project creation, search, filter, sort, and refresh controls.
 *
 * ProjectToolbar({ pageTitle, filteredCount, isAdmin, onCreateClick,
 *   onRefresh, isFetching, dataUpdatedAt }) — Renders:
 *   - Page title heading (e.g. "All Projects" or "My Projects").
 *   - "+ Create Project" button (also triggered by Ctrl+N / Cmd+N keyboard
 *     shortcut) — calls `onCreateClick`.
 *   - A local debounced search input (300 ms) that syncs with the Zustand
 *     `searchQuery` store. Includes a clear (✕) button when non-empty.
 *     Syncs from the Navbar search input via a store subscription.
 *   - Filter dropdown — shows "All Projects", "Only Mine" (admin only), and
 *     "Archived". Updates `filterType` in the project store.
 *   - Sort dropdown — lists all six SortBy options with their human-readable
 *     labels. Updates `sortBy` in the project store.
 *   - Refresh button — calls `onRefresh` and animates the icon for 600 ms.
 *     Also spins while `isFetching` is true.
 *   - Metadata line showing the filtered project count and last-updated time.
 *
 * formatUpdatedAt(ts) — Internal helper; converts a timestamp to a relative
 *   time string (e.g. "just now", "5 minutes ago") for the metadata line.
 *
 * handleSearchChange(value) — Internal handler; updates the local search state
 *   immediately for instant UI feedback and debounces the store update.
 *
 * handleRefresh() — Internal handler; calls `onRefresh` and triggers a brief
 *   spinner animation on the refresh button icon.
 */
import { useEffect, useRef, useState } from 'react'
import { useProjectStore } from '../../../store/projectSlice'
import type { FilterType, SortBy } from '../../../store/projectSlice'

const SORT_LABELS: Record<SortBy, string> = {
  modified_desc: 'Last Modified (Newest)',
  modified_asc: 'Last Modified (Oldest)',
  name_asc: 'Name (A–Z)',
  name_desc: 'Name (Z–A)',
  created_desc: 'Created (Newest)',
  created_asc: 'Created (Oldest)',
}

interface FilterOption {
  value: FilterType
  label: string
}

interface ProjectToolbarProps {
  pageTitle: string
  filteredCount: number
  isAdmin: boolean
  onCreateClick: () => void
  onRefresh: () => void
  isFetching: boolean
  dataUpdatedAt?: number
}

function formatUpdatedAt(ts: number): string {
  const diffMs = Date.now() - ts
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} minute${mins !== 1 ? 's' : ''} ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  return 'over a day ago'
}

export default function ProjectToolbar({
  pageTitle,
  filteredCount,
  isAdmin,
  onCreateClick,
  onRefresh,
  isFetching,
  dataUpdatedAt,
}: ProjectToolbarProps) {
  const { filterType, sortBy, searchQuery, setFilterType, setSortBy, setSearchQuery } =
    useProjectStore()

  const [filterOpen, setFilterOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const [localSearch, setLocalSearch] = useState(searchQuery)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTypingRef = useRef(false)

  // Sync localSearch when searchQuery changes externally (e.g. from Navbar)
  useEffect(() => {
    if (!isTypingRef.current) {
      setLocalSearch(searchQuery)
    }
  }, [searchQuery])
  const filterRef = useRef<HTMLDivElement>(null)
  const sortRef = useRef<HTMLDivElement>(null)

  // Close dropdowns on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false)
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  // Ctrl+N opens create modal
  useEffect(() => {
    function handle(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        onCreateClick()
      }
    }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [onCreateClick])

  function handleSearchChange(value: string) {
    isTypingRef.current = true
    setLocalSearch(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSearchQuery(value)
      isTypingRef.current = false
    }, 300)
  }

  function handleRefresh() {
    setSpinning(true)
    onRefresh()
    setTimeout(() => setSpinning(false), 600)
  }

  const filterOptions: FilterOption[] = isAdmin
    ? [
        { value: 'all', label: 'All Projects' },
        { value: 'mine', label: 'Only Mine' },
        { value: 'archived', label: 'Archived' },
      ]
    : [
        { value: 'all', label: 'All Projects' },
        { value: 'archived', label: 'Archived' },
      ]

  const btnCls = 'h-9 px-3.5 border border-surface/30 rounded-lg text-sm bg-surface/10 text-primary/80 cursor-pointer flex items-center gap-1.5 whitespace-nowrap hover:bg-surface/25 hover:text-primary transition-colors'
  const dropdownCls = 'absolute top-[calc(100%+4px)] left-0 bg-card border border-surface/30 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] min-w-[200px] z-50 py-1 overflow-hidden'
  const menuItemCls = (active: boolean) => `flex items-center gap-2 w-full text-left bg-transparent border-none px-3.5 py-2.5 text-sm text-primary/80 cursor-pointer hover:bg-surface/20 hover:text-primary transition-colors ${active ? 'font-bold' : 'font-normal'}`

  return (
    <div className="mb-8">
      {/* Title row */}
      <h1 className="text-[32px] font-extrabold text-primary mb-5 tracking-tight">{pageTitle}</h1>

      {/* Controls row */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Create button */}
        <button
          onClick={onCreateClick}
          className="h-9 px-4 bg-accent hover:bg-accent-hover hover:text-card text-on-accent border-none rounded-lg text-sm font-bold cursor-pointer transition-all shadow-md shadow-accent/20"
          title="Create Project (Ctrl+N)"
        >
          + Create Project
        </button>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={localSearch}
            placeholder="Search projects..."
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-9 w-64 pl-3 pr-8 border border-surface/30 rounded-lg text-sm bg-surface/10 text-primary placeholder-surface/50 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors"
          />
          {localSearch && (
            <button
              onClick={() => handleSearchChange('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-muted/70 hover:text-primary text-base leading-none p-0"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter dropdown */}
        <div ref={filterRef} className="relative">
          <button
            className={btnCls}
            onClick={() => { setFilterOpen((o) => !o); setSortOpen(false) }}
          >
            Filter: {filterOptions.find((o) => o.value === filterType)?.label ?? 'All Projects'}
            <span className="text-[10px] ml-0.5">▼</span>
          </button>
          {filterOpen && (
            <div className={dropdownCls}>
              {filterOptions.map((opt) => (
                <button
                  key={opt.value}
                  className={menuItemCls(filterType === opt.value)}
                  onClick={() => { setFilterType(opt.value); setFilterOpen(false) }}
                >
                  <span className="w-4 text-muted">{filterType === opt.value ? '✓' : ''}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sort dropdown */}
        <div ref={sortRef} className="relative">
          <button
            className={btnCls}
            onClick={() => { setSortOpen((o) => !o); setFilterOpen(false) }}
          >
            Sort: {SORT_LABELS[sortBy]}
            <span className="text-[10px] ml-0.5">▼</span>
          </button>
          {sortOpen && (
            <div className={dropdownCls}>
              {(Object.entries(SORT_LABELS) as [SortBy, string][]).map(([value, label]) => (
                <button
                  key={value}
                  className={menuItemCls(sortBy === value)}
                  onClick={() => { setSortBy(value); setSortOpen(false) }}
                >
                  <span className="w-4 text-muted">{sortBy === value ? '✓' : ''}</span>
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          aria-label="Refresh projects"
          className="w-9 h-9 bg-transparent border border-surface/30 rounded-lg cursor-pointer flex items-center justify-center text-muted/70 hover:bg-surface/20 hover:text-primary transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              animation: spinning || isFetching ? 'spin 0.6s linear infinite' : 'none',
            }}
          >
            <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
            <path
              d="M4 12a8 8 0 0 1 14.93-4H15m3.93-4l.07 4-4-.07"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Metadata line */}
      <p className="text-sm text-muted/70 mt-3">
        {filteredCount} project{filteredCount !== 1 ? 's' : ''}
        {dataUpdatedAt ? ` · Updated ${formatUpdatedAt(dataUpdatedAt)}` : ''}
      </p>
    </div>
  )
}
