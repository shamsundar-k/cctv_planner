import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { useAuthStore } from '../../store/authSlice'

interface UserMenuProps {
  onClose: () => void
}

export default function UserMenu({ onClose }: UserMenuProps) {
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

  const menuStyle: React.CSSProperties = {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    background: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: 6,
    boxShadow: '0 20px 25px rgba(0,0,0,0.2)',
    minWidth: 200,
    zIndex: 200,
  }

  const headerStyle: React.CSSProperties = {
    padding: '12px 16px 8px',
  }

  const nameStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 600,
    color: '#1a1a1a',
  }

  const emailStyle: React.CSSProperties = {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  }

  const separatorStyle: React.CSSProperties = {
    borderTop: '1px solid #e0e0e0',
    margin: 0,
  }

  const itemStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    background: 'none',
    border: 'none',
    padding: '10px 16px',
    fontSize: 14,
    color: '#1a1a1a',
    cursor: 'pointer',
  }

  const logoutStyle: React.CSSProperties = {
    ...itemStyle,
    color: '#dd0000',
  }

  return (
    <div ref={menuRef} style={menuStyle}>
      <div style={headerStyle}>
        <div style={nameStyle}>{user?.fullName}</div>
        <div style={emailStyle}>{user?.email}</div>
      </div>
      <hr style={separatorStyle} />
      <button
        style={itemStyle}
        onMouseEnter={(e) => ((e.target as HTMLElement).style.background = '#f5f5f5')}
        onMouseLeave={(e) => ((e.target as HTMLElement).style.background = 'none')}
        onClick={() => { navigate('/profile'); onClose() }}
      >
        My Profile
      </button>
      <button
        style={itemStyle}
        onMouseEnter={(e) => ((e.target as HTMLElement).style.background = '#f5f5f5')}
        onMouseLeave={(e) => ((e.target as HTMLElement).style.background = 'none')}
        onClick={() => { navigate('/settings'); onClose() }}
      >
        Settings
      </button>
      {isAdmin && (
        <button
          style={itemStyle}
          onMouseEnter={(e) => ((e.target as HTMLElement).style.background = '#f5f5f5')}
          onMouseLeave={(e) => ((e.target as HTMLElement).style.background = 'none')}
          onClick={() => { navigate('/admin/manage'); onClose() }}
        >
          Manage Users
        </button>
      )}
      <button
        style={itemStyle}
        onMouseEnter={(e) => ((e.target as HTMLElement).style.background = '#f5f5f5')}
        onMouseLeave={(e) => ((e.target as HTMLElement).style.background = 'none')}
        onClick={() => { navigate('/docs'); onClose() }}
      >
        Help &amp; Documentation
      </button>
      <hr style={separatorStyle} />
      <button
        style={logoutStyle}
        onMouseEnter={(e) => ((e.target as HTMLElement).style.background = '#f5f5f5')}
        onMouseLeave={(e) => ((e.target as HTMLElement).style.background = 'none')}
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  )
}
