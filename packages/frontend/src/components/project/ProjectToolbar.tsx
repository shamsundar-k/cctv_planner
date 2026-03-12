import { useEffect, useRef, useState } from 'react'
import { useProjectStore } from '../../store/projectSlice'
import type { FilterType, SortBy } from '../../store/projectSlice'

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

  const btnBase: React.CSSProperties = {
    height: 36,
    padding: '0 14px',
    border: '1px solid #d0d0d0',
    borderRadius: 6,
    fontSize: 14,
    background: '#ffffff',
    color: '#1a1a1a',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    whiteSpace: 'nowrap',
  }

  const dropdownMenu: React.CSSProperties = {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    background: '#ffffff',
    border: '1px solid #e0e0e0',
    borderRadius: 6,
    boxShadow: '0 10px 15px rgba(0,0,0,0.15)',
    minWidth: 200,
    zIndex: 50,
  }

  const menuItem = (active: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    textAlign: 'left',
    background: 'none',
    border: 'none',
    padding: '10px 14px',
    fontSize: 14,
    color: '#1a1a1a',
    cursor: 'pointer',
    fontWeight: active ? 600 : 400,
  })

  return (
    <div style={{ marginBottom: 32 }}>
      {/* Title row */}
      <h1 style={{ fontSize: 32, fontWeight: 700, color: '#1a1a1a', marginBottom: 20 }}>
        {pageTitle}
      </h1>

      {/* Controls row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        {/* Create button */}
        <button
          onClick={onCreateClick}
          style={{
            height: 36,
            padding: '0 16px',
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
          title="Create Project (Ctrl+N)"
        >
          + Create Project
        </button>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={localSearch}
            placeholder="Search projects..."
            onChange={(e) => handleSearchChange(e.target.value)}
            style={{
              height: 36,
              width: 260,
              padding: '0 32px 0 12px',
              border: '1px solid #d0d0d0',
              borderRadius: 6,
              fontSize: 14,
              background: '#f9f9f9',
              color: '#1a1a1a',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#0066cc'
              e.currentTarget.style.background = '#ffffff'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#d0d0d0'
              e.currentTarget.style.background = '#f9f9f9'
            }}
          />
          {localSearch && (
            <button
              onClick={() => handleSearchChange('')}
              aria-label="Clear search"
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#999',
                fontSize: 16,
                lineHeight: 1,
                padding: 0,
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter dropdown */}
        <div ref={filterRef} style={{ position: 'relative' }}>
          <button
            style={btnBase}
            onClick={() => { setFilterOpen((o) => !o); setSortOpen(false) }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#f5f5f5')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = '#ffffff')}
          >
            Filter: {filterOptions.find((o) => o.value === filterType)?.label ?? 'All Projects'}
            <span style={{ fontSize: 10, marginLeft: 2 }}>▼</span>
          </button>
          {filterOpen && (
            <div style={dropdownMenu}>
              {filterOptions.map((opt) => (
                <button
                  key={opt.value}
                  style={menuItem(filterType === opt.value)}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#f5f5f5')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'none')}
                  onClick={() => { setFilterType(opt.value); setFilterOpen(false) }}
                >
                  <span style={{ width: 16, color: '#0066cc' }}>{filterType === opt.value ? '✓' : ''}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sort dropdown */}
        <div ref={sortRef} style={{ position: 'relative' }}>
          <button
            style={btnBase}
            onClick={() => { setSortOpen((o) => !o); setFilterOpen(false) }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#f5f5f5')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = '#ffffff')}
          >
            Sort: {SORT_LABELS[sortBy]}
            <span style={{ fontSize: 10, marginLeft: 2 }}>▼</span>
          </button>
          {sortOpen && (
            <div style={dropdownMenu}>
              {(Object.entries(SORT_LABELS) as [SortBy, string][]).map(([value, label]) => (
                <button
                  key={value}
                  style={menuItem(sortBy === value)}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#f5f5f5')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'none')}
                  onClick={() => { setSortBy(value); setSortOpen(false) }}
                >
                  <span style={{ width: 16, color: '#0066cc' }}>{sortBy === value ? '✓' : ''}</span>
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
          style={{
            width: 36,
            height: 36,
            background: 'transparent',
            border: '1px solid #d0d0d0',
            borderRadius: 6,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.background = '#f5f5f5'
            el.style.color = '#0066cc'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.background = 'transparent'
            el.style.color = '#666'
          }}
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
      <p style={{ fontSize: 14, color: '#666666', marginTop: 12 }}>
        {filteredCount} project{filteredCount !== 1 ? 's' : ''}
        {dataUpdatedAt ? ` · Updated ${formatUpdatedAt(dataUpdatedAt)}` : ''}
      </p>
    </div>
  )
}
