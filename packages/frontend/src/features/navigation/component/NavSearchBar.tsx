import { useNavbarSearch } from '../hooks/useNavbarSearch'

export default function NavSearchBar() {
  const { searchRef, searchQuery, searchFocused, setSearchFocused, handleSearchChange } = useNavbarSearch()

  return (
    <div className="flex-none w-100 mx-auto">
      <input
        ref={searchRef}
        type="text"
        value={searchQuery}
        placeholder="Search projects… (Ctrl+K)"
        onChange={(e) => handleSearchChange(e.target.value)}
        onFocus={() => setSearchFocused(true)}
        onBlur={() => setSearchFocused(false)}
        className={`w-full h-9 px-4 text-sm rounded-lg outline-none transition-all border text-primary ${searchFocused ? 'ring-1 bg-surface/25 border-primary/50' : 'bg-surface/15 border-surface/25'}`}
      />
    </div>
  )
}
