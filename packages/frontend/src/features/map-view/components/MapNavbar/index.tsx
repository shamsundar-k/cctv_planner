import { useAuthStore } from '../../../../store/authSlice'
import { useSaveAction } from './useSaveAction'
import { ProjectTitle } from './ProjectTitle'
import { SaveButton } from './SaveButton'
import { UserAvatar } from './UserAvatar'
import NavLogo from '../../../../components/NavLogo'

interface MapNavbarProps {
  projectId: string
  projectName: string
  onSave?: () => Promise<void>
}

export default function MapNavbar({ projectId, projectName, onSave }: MapNavbarProps) {
  const user = useAuthStore((s) => s.user)
  const saveAction = useSaveAction(projectId, onSave)

  let initials = '??'
  if (user?.fullName) {
    initials = user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
  } else if (user?.email) {
    initials = user.email[0].toUpperCase()
  }

  return (
    <header
      className="h-12 shrink-0 flex items-center px-4 gap-3 relative z-[2000]"
      style={{ background: 'var(--theme-bg-card)', borderBottom: '1px solid color-mix(in srgb, var(--theme-surface) 20%, transparent)' }}
    >
      <NavLogo />

      <div className="w-px h-5 shrink-0" style={{ background: 'color-mix(in srgb, var(--theme-surface) 30%, transparent)' }} />

      <ProjectTitle name={projectName} />

      <div className="flex items-center gap-3 ml-auto shrink-0">
        <SaveButton
          isSaving={saveAction.isSaving}
          isDirty={saveAction.isDirty}
          lastSavedAt={saveAction.lastSavedAt}
          onClick={saveAction.handleSave}
        />
        <UserAvatar initials={initials} />
      </div>
    </header>
  )
}
