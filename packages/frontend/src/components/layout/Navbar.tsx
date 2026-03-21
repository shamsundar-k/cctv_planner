/*
 * FILE SUMMARY — src/components/layout/Navbar.tsx
 *
 * Top navigation bar rendered on every authenticated page.
 *
 * Navbar() — Sticky header component that renders:
 *   - App logo (SVG camera icon) and "CCTV Planner" brand name on the left.
 *   - A centred search bar (400 px wide) bound to the `searchQuery` field in
 *     the Zustand project store. Supports Ctrl+K (or Cmd+K) to focus the
 *     input and Escape to clear and blur it. Changes propagate immediately to
 *     the project list via setSearchQuery().
 *   - A notification bell icon placeholder on the right (not yet functional).
 *   - A user avatar button showing the user's initials (derived from
 *     `fullName` or the first character of their email if no name is set).
 *     Clicking the avatar toggles the <UserMenu> dropdown.
 *   - A help icon link on the far right.
 *
 * Internal behaviour:
 *   - Keyboard event listener for Ctrl+K and Escape is added on mount and
 *     cleaned up on unmount.
 *   - Avatar initials are computed inline from the auth store's user object.
 */
import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '../../store/authSlice'
import { useProjectStore } from '../../store/projectSlice'
import UserMenu from './UserMenu'

export default function Navbar() {
  const user = useAuthStore((s) => s.user)
  const setSearchQuery = useProjectStore((s) => s.setSearchQuery)
  const searchQuery = useProjectStore((s) => s.searchQuery)

  const [searchFocused, setSearchFocused] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const avatarContainerRef = useRef<HTMLDivElement>(null)

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

  //get initial from full name. If full name not present use the first letter of email address
  let initials = "??"
  if (user?.fullName) {
    initials = user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
  } else if (user?.email) {
    initials = user.email.split('@')[0].split(' ').map((n) => n[0]).join('').slice(0, 1).toUpperCase()
  }

  return (
    <header className="sticky top-0 z-[100] h-16 bg-slate-800 border-b border-slate-700 shadow-md flex items-center px-10 gap-6">
      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect x="2" y="7" width="14" height="10" rx="2" fill="#60a5fa" />
          <path d="M16 10l5-3v10l-5-3V10z" fill="#60a5fa" />
          <circle cx="9" cy="12" r="2" fill="#ffffff" />
        </svg>
        <span className="text-lg font-bold text-slate-100 whitespace-nowrap">
          CCTV Planner
        </span>
      </div>

      {/* Search bar */}
      <div className="flex-none w-[400px] mx-auto">
        <input
          ref={searchRef}
          type="text"
          value={searchQuery}
          placeholder="Open projects... (Ctrl+K)"
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className={`w-full h-9 px-3 text-sm rounded-md outline-none bg-slate-700 text-slate-100 placeholder-slate-400 transition-colors border ${searchFocused ? 'border-blue-500' : 'border-slate-600'
            }`}
        />
      </div>

      {/* Right icons */}
      <div className="flex items-center gap-6 ml-auto shrink-0">
        {/* Bell (placeholder) */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="text-slate-500"
        >
          <path d="M12 2a7 7 0 0 0-7 7v4l-2 2v1h18v-1l-2-2V9a7 7 0 0 0-7-7z" fill="currentColor" />
          <path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>

        {/* User avatar + dropdown */}
        <div ref={avatarContainerRef} className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="User menu"
            className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer p-0"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-[13px] font-semibold flex items-center justify-center select-none">
              {initials}
            </div>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M2 4l4 4 4-4" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {menuOpen && <UserMenu onClose={() => setMenuOpen(false)} />}
        </div>

        {/* Help */}
        <a
          href="#"
          aria-label="Help"
          className="text-slate-500 hover:text-slate-300 flex items-center transition-colors"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="12" cy="17" r="0.75" fill="currentColor" />
          </svg>
        </a>
      </div>
    </header>
  )
}
