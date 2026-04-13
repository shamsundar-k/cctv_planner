import { useAuthStore } from '../../../store/authSlice'
import { useUserMenu } from '../hooks/useUserMenu'
import UserMenu from './UserMenu'

export default function NavUserAvatar() {
  const user = useAuthStore((s) => s.user)
  const { menuOpen, toggleMenu, closeMenu, avatarContainerRef } = useUserMenu()

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
    <div ref={avatarContainerRef} className="relative">
      <button
        onClick={toggleMenu}
        aria-label="User menu"
        className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer p-0"
      >
        <div
          className="w-8 h-8 rounded-full text-[13px] font-bold flex items-center justify-center select-none ring-2 ring-white/10 bg-accent text-on-accent"
        >
          {initials}
        </div>
        <svg
          width="12" height="12" viewBox="0 0 12 12"
          fill="none" xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M2 4l4 4 4-4"
            className="stroke-muted"
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      </button>
      {menuOpen && <UserMenu onClose={closeMenu} />}
    </div>
  )
}
