interface Props {
  search: string
  onSearch: (value: string) => void
  count: number
  isLoading: boolean
}

export default function CameraSearchBar({ search, onSearch, count, isLoading }: Props) {
  return (
    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <label htmlFor="camera-spec-search" className="sr-only">
        Search camera specifications
      </label>
      <input
        id="camera-spec-search"
        type="text"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search by name, manufacturer, model…"
        className="h-10 w-full rounded-lg border border-panel-border bg-panel px-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-subtle hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 sm:w-80"
      />
      <span className="text-sm text-text-muted" aria-live="polite">
        {isLoading ? '…' : `${count} spec${count !== 1 ? 's' : ''}`}
      </span>
    </div>
  )
}
