import { Bell, CircleHelp } from 'lucide-react'
import AppUserAvatar from '../../../components/AppUserAvatar'
import ThemeSelector from './ThemeSelector'

export default function NavActions() {
  return (
    <div className="flex items-center gap-5 ml-auto shrink-0">
      <ThemeSelector />

      {/* Bell — placeholder, not yet functional */}
      <Bell size={18} aria-hidden="true" className="cursor-pointer transition-colors text-text-muted hover:text-text-primary" />

      <AppUserAvatar />

      {/* Help */}
      <a
        href="#"
        aria-label="Help"
        className="flex items-center transition-colors text-text-muted hover:text-text-primary"
      >
        <CircleHelp size={18} />
      </a>
    </div>
  )
}
