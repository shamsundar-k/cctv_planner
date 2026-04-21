import { useState } from 'react'

export function useFieldSearch<T extends object>(
  items: T[],
  keys: (keyof T)[],
) {
  const [search, setSearch] = useState('')

  const filtered = items.filter((item) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return keys.some((k) => String(item[k]).toLowerCase().includes(q))
  })

  return { search, setSearch, filtered }
}
