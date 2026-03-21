/*
 * FILE SUMMARY — src/components/layout/UserMenu.tsx
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
import { useAuthStore } from '../../store/authSlice'

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

  const itemCls = 'block w-full text-left bg-transparent border-none px-4 py-2.5 text-sm text-slate-300 cursor-pointer hover:bg-slate-700 transition-colors'

  return (
    <div
      ref={menuRef}
      className="absolute top-[calc(100%+8px)] right-0 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl min-w-[200px] z-[1000]"
    >
      <div className="px-4 pt-3 pb-2">
        <div className="text-sm font-semibold text-slate-100">{user?.fullName}</div>
        <div className="text-xs text-slate-500 mt-0.5">{user?.email}</div>
      </div>
      <hr className="border-slate-700 mx-0 my-0" />
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
          Manage Users
        </button>
      )}
      <button className={itemCls} onClick={() => { navigate('/docs'); onClose() }}>
        Help &amp; Documentation
      </button>
      <hr className="border-slate-700 mx-0 my-0" />
      <button
        className="block w-full text-left bg-transparent border-none px-4 py-2.5 text-sm text-red-400 cursor-pointer hover:bg-slate-700 transition-colors"
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  )
}
