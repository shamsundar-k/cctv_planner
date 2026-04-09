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
    <div className="relative max-w-[360px] w-full">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base pointer-events-none opacity-50" style={{ color: 'var(--theme-text-secondary)' }}>
        🔍
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pl-10 pr-3 text-sm rounded-xl outline-none box-border transition-all"
        style={{
          background: 'color-mix(in srgb, var(--theme-surface) 10%, transparent)',
          border: '1px solid color-mix(in srgb, var(--theme-surface) 30%, transparent)',
          color: 'var(--theme-text-primary)',
        }}
        onFocus={e => {
          e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--theme-text-primary) 50%, transparent)'
          e.currentTarget.style.background = 'color-mix(in srgb, var(--theme-surface) 18%, transparent)'
        }}
        onBlur={e => {
          e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--theme-surface) 30%, transparent)'
          e.currentTarget.style.background = 'color-mix(in srgb, var(--theme-surface) 10%, transparent)'
        }}
      />
    </div>
  )
}
