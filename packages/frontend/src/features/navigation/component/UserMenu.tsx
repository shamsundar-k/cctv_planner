/*
 * FILE SUMMARY — src/features/navigation/component/UserMenu.tsx
 *
 * Dropdown menu that appears when the user clicks their avatar in the Navbar.
 *
 * UserMenu({ onClose }) — Renders an absolute-positioned dropdown panel
 *   anchored below the avatar button. Contains:
 *   - A profile header showing the user's full name and email address.
 *   - Navigation items: "My Profile", "Settings", "Help & Documentation"
 *     (all navigate to their respective routes).
 *   - "Manage Users" link, shown only when the logged-in user has role
 *     "admin". Navigates to /admin/manage.
 *   - A "Logout" button that calls clearAuth() to wipe the auth store and
 *     redirects the user to /login.
 *
 * handleLogout() — Clears the Zustand auth state and navigates to /login.
 *
 * Internal behaviour:
 *   - A mousedown listener closes the menu when the user clicks outside it.
 *   - An Escape keydown listener also closes the menu.
 *   - Both listeners are registered on mount and cleaned up on unmount.
 *   - `onClose` prop must be called by the parent (Navbar) to hide the menu.
 */
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { useAuthStore } from '../../../store/authSlice'

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

  const itemCls = 'block w-full text-left bg-transparent border-none px-4 py-2.5 text-sm cursor-pointer transition-colors'

  return (
    <div
      ref={menuRef}
      className="absolute top-[calc(100%+8px)] right-0 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] min-w-[220px] z-[1000] overflow-hidden"
      style={{ background: 'var(--theme-bg-card)', border: '1px solid color-mix(in srgb, var(--theme-surface) 30%, transparent)' }}
    >
      <div className="px-4 pt-4 pb-3 border-b" style={{ borderColor: 'color-mix(in srgb, var(--theme-surface) 20%, transparent)', background: 'color-mix(in srgb, var(--theme-surface) 10%, transparent)' }}>
        <div className="text-sm font-bold" style={{ color: 'var(--theme-text-primary)' }}>{user?.fullName}</div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--theme-text-secondary)' }}>{user?.email}</div>
      </div>
      <div className="py-1">
        <button className={itemCls} style={{ color: 'var(--theme-text-primary)' }} onMouseEnter={e => (e.currentTarget.style.background = 'color-mix(in srgb, var(--theme-surface) 20%, transparent)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')} onClick={() => { navigate('/profile'); onClose() }}>
          My Profile
        </button>
        {exitProjectPath && (
          <button className={itemCls} style={{ color: 'var(--theme-text-primary)' }} onMouseEnter={e => (e.currentTarget.style.background = 'color-mix(in srgb, var(--theme-surface) 20%, transparent)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')} onClick={() => { navigate(exitProjectPath); onClose() }}>
            Exit Project
          </button>
        )}
        <button className={itemCls} style={{ color: 'var(--theme-text-primary)' }} onMouseEnter={e => (e.currentTarget.style.background = 'color-mix(in srgb, var(--theme-surface) 20%, transparent)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')} onClick={() => { navigate('/settings'); onClose() }}>
          Settings
        </button>
        {isAdmin && (
          <button className={itemCls} style={{ color: 'var(--theme-text-primary)' }} onMouseEnter={e => (e.currentTarget.style.background = 'color-mix(in srgb, var(--theme-surface) 20%, transparent)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')} onClick={() => { navigate('/admin/manage'); onClose() }}>
            Manage Users
          </button>
        )}
        <button className={itemCls} style={{ color: 'var(--theme-text-primary)' }} onMouseEnter={e => (e.currentTarget.style.background = 'color-mix(in srgb, var(--theme-surface) 20%, transparent)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')} onClick={() => { navigate('/docs'); onClose() }}>
          Help &amp; Documentation
        </button>
      </div>
      <div className="border-t" style={{ borderColor: 'color-mix(in srgb, var(--theme-surface) 20%, transparent)' }}>
        <button
          className={itemCls}
          style={{ color: 'var(--theme-accent)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'color-mix(in srgb, var(--theme-accent) 10%, transparent)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  )
}
