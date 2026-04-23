import { Bell, CircleHelp } from 'lucide-react'
import AppUserAvatar from '../../../components/AppUserAvatar'

export default function NavActions() {
  return (
    <div className="flex items-center gap-5 ml-auto shrink-0">
      {/* Bell — placeholder, not yet functional */}
      <Bell size={18} aria-hidden="true" className="cursor-pointer transition-colors text-muted" />

      <AppUserAvatar />

      {/* Help */}
      <a
        href="#"
        aria-label="Help"
        className="flex items-center transition-colors text-muted"
      >
        <CircleHelp size={18} />
      </a>
    </div>
  )
}
