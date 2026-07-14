export default function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <div className="relative w-full max-w-[360px]">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base text-text-muted" aria-hidden="true">
        🔍
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="box-border h-10 w-full rounded-xl border border-panel-border bg-panel pl-10 pr-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-subtle hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  )
}
