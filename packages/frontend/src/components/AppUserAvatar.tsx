import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useAuthStore } from '../store/authSlice'
import UserMenu from './UserMenu'

interface AppUserAvatarProps {
  exitProjectPath?: string
}

export default function AppUserAvatar({ exitProjectPath }: AppUserAvatarProps) {
  const user = useAuthStore((s) => s.user)
  const [menuOpen, setMenuOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  let initials = '??'
  if (user?.fullName) {
    initials = user.fullName
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  } else if (user?.email) {
    initials = user.email
      .split('@')[0]
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .slice(0, 1)
      .toUpperCase()
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="User menu"
        className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer p-0"
      >
        <div
          className="w-8 h-8 rounded-full text-[13px] font-bold flex items-center justify-center select-none ring-2 ring-white/10"
          style={{ background: 'var(--theme-accent)', color: 'var(--theme-accent-text)' }}
        >
          {initials}
        </div>
        <ChevronDown size={12} aria-hidden="true" style={{ color: 'var(--theme-text-secondary)' }} />
      </button>
      {menuOpen && (
        <UserMenu onClose={() => setMenuOpen(false)} exitProjectPath={exitProjectPath} />
      )}
    </div>
  )
}
