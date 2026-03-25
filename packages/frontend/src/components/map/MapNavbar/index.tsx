import { useAuthStore } from '../../../store/authSlice'
import { useProjectName } from './useProjectName'
import { useSaveAction } from './useSaveAction'
import { ProjectNameEditor } from './ProjectNameEditor'
import { SaveButton } from './SaveButton'
import { UserAvatar } from './UserAvatar'

interface MapNavbarProps {
  projectId: string
  projectName: string
  onSave?: () => Promise<void>
}

export default function MapNavbar({ projectId, projectName, onSave }: MapNavbarProps) {
  const user = useAuthStore((s) => s.user)

  const projectNameProps = useProjectName(projectId, projectName)
  const saveAction = useSaveAction(onSave)

  let initials = '??'
  if (user?.fullName) {
    initials = user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
  } else if (user?.email) {
    initials = user.email[0].toUpperCase()
  }

  return (
    <header className="h-12 shrink-0 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-3 relative z-[2000]">
      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="2" y="7" width="14" height="10" rx="2" fill="#60a5fa" />
          <path d="M16 10l5-3v10l-5-3V10z" fill="#60a5fa" />
          <circle cx="9" cy="12" r="2" fill="#ffffff" />
        </svg>
        <span className="text-sm font-bold text-slate-100 whitespace-nowrap">CCTV Planner</span>
      </div>

      <div className="w-px h-5 bg-slate-600 shrink-0" />

      <ProjectNameEditor
        displayName={projectNameProps.displayName}
        draftName={projectNameProps.draftName}
        isEditing={projectNameProps.isEditing}
        inputRef={projectNameProps.inputRef}
        onStartEditing={projectNameProps.startEditing}
        onDraftChange={projectNameProps.setDraftName}
        onBlur={projectNameProps.commitEdit}
        onKeyDown={projectNameProps.handleInputKeyDown}
      />

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
