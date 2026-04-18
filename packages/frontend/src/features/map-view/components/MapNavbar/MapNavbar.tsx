import { useSaveAction } from '../../hooks/useSaveAction'
import { ProjectTitle } from './ProjectTitle'
import { SaveButton } from './SaveButton'
import NavLogo from '../../../../components/NavLogo'
import AppUserAvatar from '../../../../components/AppUserAvatar'

interface MapNavbarProps {
  projectId: string
  projectName: string
  onSave?: () => Promise<void>
}

export default function MapNavbar({ projectId, projectName, onSave }: MapNavbarProps) {
  const saveAction = useSaveAction(projectId, onSave)

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
        <AppUserAvatar exitProjectPath="/" />
      </div>
    </header>
  )
}
