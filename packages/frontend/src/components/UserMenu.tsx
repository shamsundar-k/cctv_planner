import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { useAuthStore } from '../store/authSlice'

interface UserMenuProps {
  onClose: () => void
  /** If provided, an "Exit Project" item is shown that navigates to this path. */
  exitProjectPath?: string
}

export default function UserMenu({ onClose, exitProjectPath }: UserMenuProps) {
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

  const itemCls = 'block w-full text-left bg-transparent border-none px-4 py-2.5 text-sm cursor-pointer transition-colors text-primary hover:bg-surface/20'

  return (
    <div
      ref={menuRef}
      className="absolute top-[calc(100%+8px)] right-0 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] min-w-[220px] z-[1000] overflow-hidden bg-card border border-surface/30"
    >
      <div className="px-4 pt-4 pb-3 border-b border-surface/20 bg-surface/10">
        <div className="text-sm font-bold text-primary">{user?.fullName}</div>
        <div className="text-xs mt-0.5 text-muted">{user?.email}</div>
      </div>
      <div className="py-1">
        <button className={itemCls} onClick={() => { navigate('/profile'); onClose() }}>
          My Profile
        </button>
        {exitProjectPath && (
          <button className={itemCls} onClick={() => { navigate(exitProjectPath); onClose() }}>
            Exit Project
          </button>
        )}
        <button className={itemCls} onClick={() => { navigate('/settings'); onClose() }}>
          Settings
        </button>
        {isAdmin && (
          <button className={itemCls} onClick={() => { navigate('/admin/manage'); onClose() }}>
            Manage App
          </button>
        )}
        <button className={itemCls} onClick={() => { navigate('/docs'); onClose() }}>
          Help &amp; Documentation
        </button>
      </div>
      <div className="border-t border-surface/20">
        <button
          className="block w-full text-left bg-transparent border-none px-4 py-2.5 text-sm cursor-pointer transition-colors text-accent hover:bg-accent/10"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  )
}
