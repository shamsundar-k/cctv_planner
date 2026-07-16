import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useAuthStore } from '../features/auth'
import UserMenu from './UserMenu'

interface AppUserAvatarProps {
  exitProjectPath?: string
  menuPlacement?: 'bottom-end' | 'right-end'
  showDetails?: boolean
}

export default function AppUserAvatar({
  exitProjectPath,
  menuPlacement = 'bottom-end',
  showDetails = false,
}: AppUserAvatarProps) {
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
    <div ref={containerRef} className={`relative ${showDetails ? 'w-full' : ''}`}>
      <button
        type="button"
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="User menu"
        aria-expanded={menuOpen}
        className={`flex items-center text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
          showDetails
            ? 'min-h-14 w-full gap-3 rounded-lg border border-panel-border bg-background px-3 py-2 hover:border-primary/40 hover:bg-divider/40'
            : 'gap-1.5 border-none bg-transparent p-0'
        }`}
      >
        <div
          className="flex size-8 shrink-0 select-none items-center justify-center rounded-full bg-primary text-[13px] font-bold text-primary-foreground ring-2 ring-panel-border"
        >
          {initials}
        </div>
        {showDetails && (
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-text-primary">
              {user?.fullName || 'My account'}
            </span>
            <span className="block truncate text-xs text-text-muted">{user?.email}</span>
          </span>
        )}
        <ChevronDown
          size={showDetails ? 16 : 12}
          aria-hidden="true"
          className={`shrink-0 text-text-muted transition-transform ${menuOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {menuOpen && (
        <UserMenu
          onClose={() => setMenuOpen(false)}
          exitProjectPath={exitProjectPath}
          placement={menuPlacement}
        />
      )}
    </div>
  )
}
