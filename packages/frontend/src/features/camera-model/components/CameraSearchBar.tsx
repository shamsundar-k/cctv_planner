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
        className="h-9 px-3 text-sm rounded-md bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500 transition-colors w-72"
      />
      <span className="text-sm text-slate-500">
        {isLoading ? '…' : `${count} model${count !== 1 ? 's' : ''}`}
      </span>
    </div>
  )
}
