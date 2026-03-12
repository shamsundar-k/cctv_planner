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

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '??'

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: 64,
        background: '#ffffff',
        borderBottom: '1px solid #e0e0e0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 40px',
        gap: 24,
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect x="2" y="7" width="14" height="10" rx="2" fill="#0066cc" />
          <path d="M16 10l5-3v10l-5-3V10z" fill="#0066cc" />
          <circle cx="9" cy="12" r="2" fill="#ffffff" />
        </svg>
        <span style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', whiteSpace: 'nowrap' }}>
          CCTV Planner
        </span>
      </div>

      {/* Search bar */}
      <div style={{ flex: '0 0 400px', margin: '0 auto' }}>
        <input
          ref={searchRef}
          type="text"
          value={searchQuery}
          placeholder="Open projects... (Ctrl+K)"
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          style={{
            width: '100%',
            height: 36,
            padding: '0 12px',
            fontSize: 14,
            border: `1px solid ${searchFocused ? '#0066cc' : '#d0d0d0'}`,
            borderRadius: 6,
            outline: 'none',
            background: searchFocused ? '#ffffff' : '#f9f9f9',
            color: '#1a1a1a',
            transition: 'border-color 0.15s, background 0.15s',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Right icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginLeft: 'auto', flexShrink: 0 }}>
        {/* Bell (placeholder) */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          style={{ color: '#aaaaaa' }}
        >
          <path
            d="M12 2a7 7 0 0 0-7 7v4l-2 2v1h18v-1l-2-2V9a7 7 0 0 0-7-7z"
            fill="#aaaaaa"
          />
          <path
            d="M10 19a2 2 0 0 0 4 0"
            stroke="#aaaaaa"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>

        {/* User avatar + dropdown */}
        <div ref={avatarContainerRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="User menu"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#0066cc',
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                userSelect: 'none',
              }}
            >
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
              <path d="M2 4l4 4 4-4" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {menuOpen && <UserMenu onClose={() => setMenuOpen(false)} />}
        </div>

        {/* Help */}
        <a
          href="#"
          aria-label="Help"
          style={{ color: '#666', display: 'flex', alignItems: 'center' }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="10" stroke="#666" strokeWidth="1.5" />
            <path
              d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 4"
              stroke="#666"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="12" cy="17" r="0.75" fill="#666" />
          </svg>
        </a>
      </div>
    </header>
  )
}
