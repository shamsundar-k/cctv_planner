import { useEffect, useRef, useState } from 'react'
import { useProjectStore } from '../../../store/projectSlice'

export function useNavbarSearch() {
  const searchQuery = useProjectStore((s) => s.searchQuery)
  const setSearchQuery = useProjectStore((s) => s.setSearchQuery)

  const [searchFocused, setSearchFocused] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
      }
      if (e.key === 'Escape' && searchFocused) {
        searchRef.current?.blur()
        setSearchQuery('')
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [searchFocused, setSearchQuery])

  function handleSearchChange(value: string) {
    setSearchQuery(value)
  }

  return { searchRef, searchQuery, searchFocused, setSearchFocused, handleSearchChange }
}
