import { useNavbarSearch } from '../hooks/useNavbarSearch'

export default function NavSearchBar() {
  const { searchRef, searchQuery, searchFocused, setSearchFocused, handleSearchChange } = useNavbarSearch()

  return (
    <div className="flex-none w-[400px] mx-auto">
      <input
        ref={searchRef}
        type="text"
        value={searchQuery}
        placeholder="Search projects… (Ctrl+K)"
        onChange={(e) => handleSearchChange(e.target.value)}
        onFocus={() => setSearchFocused(true)}
        onBlur={() => setSearchFocused(false)}
        className={`w-full h-9 px-4 text-sm rounded-lg outline-none transition-all border ${searchFocused ? 'ring-1' : ''}`}
        style={{
          background: searchFocused
            ? 'color-mix(in srgb, var(--theme-surface) 25%, transparent)'
            : 'color-mix(in srgb, var(--theme-surface) 15%, transparent)',
          borderColor: searchFocused
            ? 'color-mix(in srgb, var(--theme-text-primary) 50%, transparent)'
            : 'color-mix(in srgb, var(--theme-surface) 25%, transparent)',
          color: 'var(--theme-text-primary)',
        }}
      />
    </div>
  )
}
