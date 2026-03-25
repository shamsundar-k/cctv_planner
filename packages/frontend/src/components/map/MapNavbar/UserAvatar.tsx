import { useState } from 'react'
import UserMenu from '../../layout/UserMenu'

interface UserAvatarProps {
  initials: string
}

export function UserAvatar({ initials }: UserAvatarProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="User menu"
        className="w-8 h-8 rounded-full bg-blue-600 text-white text-[13px] font-semibold flex items-center justify-center cursor-pointer border-none select-none"
      >
        {initials}
      </button>
      {menuOpen && (
        <UserMenu
          onClose={() => setMenuOpen(false)}
          exitProjectPath="/"
        />
      )}
    </div>
  )
}
