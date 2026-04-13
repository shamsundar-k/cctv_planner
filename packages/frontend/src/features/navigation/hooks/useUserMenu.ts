import { useEffect, useRef, useState } from 'react'

export function useUserMenu() {
  const [menuOpen, setMenuOpen] = useState(false)
  const avatarContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuOpen && !avatarContainerRef.current?.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  return {
    menuOpen,
    toggleMenu: () => setMenuOpen((o) => !o),
    closeMenu: () => setMenuOpen(false),
    avatarContainerRef,
  }
}
