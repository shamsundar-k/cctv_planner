interface Props {
  search: string
  onSearch: (value: string) => void
  count: number
  isLoading: boolean
}

export default function CameraSearchBar({ search, onSearch, count, isLoading }: Props) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <input
        type="text"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search by name, manufacturer, model…"
        className="h-9 px-3 text-sm rounded-md bg-surface/30 border border-border text-primary placeholder:text-muted/70 outline-none focus:border-accent transition-colors w-72"
      />
      <span className="text-sm text-muted">
        {isLoading ? '…' : `${count} spec${count !== 1 ? 's' : ''}`}
      </span>
    </div>
  )
}
