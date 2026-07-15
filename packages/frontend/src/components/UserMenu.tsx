import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { useAuthStore } from '../features/auth'

interface UserMenuProps {
  onClose: () => void
  /** If provided, an "Exit Project" item is shown that navigates to this path. */
  exitProjectPath?: string
  placement?: 'bottom-end' | 'right-end'
}

export default function UserMenu({ onClose, exitProjectPath, placement = 'bottom-end' }: UserMenuProps) {
  const navigate = useNavigate()
  const menuRef = useRef<HTMLDivElement>(null)
  const user = useAuthStore((s) => s.user)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  function handleLogout() {
    clearAuth()
    navigate('/login')
  }

  const itemCls = 'block w-full text-left bg-transparent border-none px-4 py-2.5 text-sm cursor-pointer transition-colors text-text-primary hover:bg-background'

  return (
    <div
      ref={menuRef}
      className={`absolute z-[3200] min-w-[220px] overflow-hidden rounded-lg border border-panel-border bg-panel shadow-[0_8px_32px_rgba(15,23,42,0.18)] ${
        placement === 'right-end' ? 'bottom-0 left-[calc(100%+12px)]' : 'right-0 top-[calc(100%+8px)]'
      }`}
    >
      <div className="px-4 pt-4 pb-3 border-b border-panel-border bg-background">
        <div className="text-sm font-bold text-text-primary">{user?.fullName}</div>
        <div className="text-xs mt-0.5 text-text-muted">{user?.email}</div>
      </div>
      <div className="py-1">
        {exitProjectPath && (
          <button className={itemCls} onClick={() => { navigate(exitProjectPath); onClose() }}>
            Exit Project
          </button>
        )}
        {isAdmin && (
          <button className={itemCls} onClick={() => { navigate('/admin/manage'); onClose() }}>
            Manage App
          </button>
        )}
      </div>
      <div className="border-t border-panel-border">
        <button
          className="block w-full text-left bg-transparent border-none px-4 py-2.5 text-sm cursor-pointer transition-colors text-primary hover:bg-background"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  )
}
