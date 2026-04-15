import { useState } from 'react'
import UserMenu from '../../../../features/navigation/component/UserMenu'

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
        className="w-8 h-8 rounded-full text-[13px] font-bold flex items-center justify-center cursor-pointer border-none select-none ring-2 ring-white/10"
        style={{ background: 'var(--theme-accent)', color: 'var(--theme-accent-text)' }}
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
