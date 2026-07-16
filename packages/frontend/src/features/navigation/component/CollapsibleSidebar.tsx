import { useState, type ComponentType, type ReactNode } from 'react'
import {
  Camera,
  ChevronRight,
  FolderOpen,
  ListVideo,
  Loader2,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Save,
  Search,
  Settings,
  X,
} from 'lucide-react'
import { useNavigate } from 'react-router'
import AppUserAvatar from '@/components/AppUserAvatar'
import ModelSelectorPanel from '@/features/camera-selector/component/ModelSelectorPanel'
import { useSaveAction } from '@/features/map-view/hooks/useSaveAction'
import PlacedCameraList from '@/features/map-view/components/workspace-sidebar/PlacedCameraList'
import { COLLAPSED_SIDEBAR_WIDTH } from '@/features/navigation/sidebarLayout'
import { themeOptions, type Theme } from '@/styles/theme'
import { useTheme } from '@/styles/useTheme'

type WorkspacePanelId = 'catalog' | 'cameras' | 'settings' | 'project'

interface NavigationItem {
  id: WorkspacePanelId
  label: string
  icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string; 'aria-hidden'?: boolean }>
}

interface CollapsibleSidebarProps {
  projectId: string
  projectName: string
}

const SIDEBAR_WIDTH = {
  collapsed: COLLAPSED_SIDEBAR_WIDTH,
  expanded: 240,
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  { id: 'catalog', label: 'Camera Catalog', icon: Search },
  { id: 'cameras', label: 'Placed Cameras', icon: ListVideo },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'project', label: 'Project', icon: FolderOpen },
]

function SidebarLogo({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <div className="flex h-16 items-center gap-3 px-4">
      <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <Camera size={22} strokeWidth={2.25} aria-hidden />
      </div>
      <div
        className={`min-w-0 overflow-hidden transition-[opacity,width] duration-150 ${
          isCollapsed ? 'w-0 opacity-0' : 'w-36 opacity-100'
        }`}
        aria-hidden={isCollapsed}
      >
        <div className="whitespace-nowrap text-base font-extrabold uppercase leading-5 text-panel-foreground">
          CCTV
        </div>
        <div className="whitespace-nowrap text-xs font-bold uppercase text-text-secondary">
          Planner
        </div>
      </div>
    </div>
  )
}

function CollapsedTooltip({ label }: { label: string }) {
  return (
    <span className="pointer-events-none absolute left-[calc(100%+0.75rem)] top-1/2 z-[3000] -translate-y-1/2 whitespace-nowrap rounded-md border border-panel-border bg-panel px-2.5 py-1.5 text-xs font-semibold text-panel-foreground opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
      {label}
    </span>
  )
}

function NavigationButton({
  item,
  isActive,
  isCollapsed,
  onClick,
}: {
  item: NavigationItem
  isActive: boolean
  isCollapsed: boolean
  onClick: () => void
}) {
  const Icon = item.icon

  return (
    <button
      type="button"
      aria-expanded={isActive}
      aria-controls={`workspace-panel-${item.id}`}
      aria-label={item.label}
      onClick={onClick}
      className={`group relative flex h-11 w-full items-center gap-3 rounded-lg border px-3 text-left text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
        isActive
          ? 'border-primary/40 bg-primary/12 text-primary'
          : 'border-transparent bg-transparent text-text-secondary hover:border-panel-border hover:bg-background hover:text-text-primary'
      } ${isCollapsed ? 'justify-center px-0' : ''}`}
    >
      {isActive && <span className="absolute left-0 top-2 h-7 w-1 rounded-r-full bg-primary" aria-hidden />}
      <Icon className="size-6 shrink-0" size={24} strokeWidth={2.25} aria-hidden />
      <span
        className={`overflow-hidden whitespace-nowrap transition-[opacity,width] duration-150 ${
          isCollapsed ? 'w-0 opacity-0' : 'w-40 opacity-100'
        }`}
        aria-hidden={isCollapsed}
      >
        {item.label}
      </span>
      {!isCollapsed && <ChevronRight size={16} className="ml-auto shrink-0" aria-hidden />}
      {isCollapsed && <CollapsedTooltip label={item.label} />}
    </button>
  )
}

function WorkspacePanel({
  id,
  title,
  onClose,
  children,
}: {
  id: WorkspacePanelId
  title: string
  onClose: () => void
  children: ReactNode
}) {
  return (
    <section id={`workspace-panel-${id}`} className="flex h-full min-w-0 flex-col bg-panel" aria-label={title}>
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-panel-border px-4">
        <h2 className="min-w-0 truncate text-sm font-bold text-panel-foreground">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={`Close ${title}`}
          className="grid size-9 shrink-0 place-items-center rounded-md border border-transparent text-text-secondary transition-colors hover:border-panel-border hover:bg-background hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <X size={18} aria-hidden />
        </button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </section>
  )
}

function SettingsPanelContent() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-3 p-4">
      <div>
        <h3 className="text-sm font-semibold text-text-primary">Appearance</h3>
        <p className="mt-1 text-xs leading-5 text-text-muted">Choose the color theme for the workspace.</p>
      </div>
      <div className="grid gap-2" role="radiogroup" aria-label="Workspace theme">
        {themeOptions.map((option) => {
          const isSelected = option.id === theme
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setTheme(option.id as Theme)}
              className={`flex min-h-11 items-center gap-3 rounded-lg border px-3 text-left text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                isSelected
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-panel-border bg-background text-text-secondary hover:border-primary/50 hover:text-text-primary'
              }`}
            >
              <span
                className={`grid size-4 place-items-center rounded-full border ${
                  isSelected ? 'border-primary' : 'border-text-muted'
                }`}
                aria-hidden
              >
                {isSelected && <span className="size-2 rounded-full bg-primary" />}
              </span>
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function formatRelativeTime(date: Date): string {
  const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60_000)
  if (diffMinutes < 1) return 'Saved just now'
  if (diffMinutes === 1) return 'Saved 1 minute ago'
  if (diffMinutes < 60) return `Saved ${diffMinutes} minutes ago`
  const diffHours = Math.floor(diffMinutes / 60)
  return `Saved ${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
}

function ProjectPanelContent({ projectId, projectName }: { projectId: string; projectName: string }) {
  const navigate = useNavigate()
  const saveAction = useSaveAction(projectId)

  const confirmNavigation = (path: string) => {
    if (saveAction.isDirty && !window.confirm('You have unsaved camera changes. Leave this workspace anyway?')) return
    navigate(path)
  }

  return (
    <div className="flex h-full flex-col p-4">
      <div className="rounded-lg border border-panel-border bg-background p-4">
        <p className="text-xs font-semibold uppercase text-text-muted">Current project</p>
        <p className="mt-1 break-words text-base font-bold text-text-primary">{projectName}</p>
        <p className={`mt-2 text-xs font-medium ${saveAction.isDirty ? 'text-warning' : 'text-text-muted'}`}>
          {saveAction.isDirty
            ? 'Unsaved camera changes'
            : saveAction.lastSavedAt
              ? formatRelativeTime(saveAction.lastSavedAt)
              : 'All camera changes are saved'}
        </p>
      </div>

      <div className="mt-4 grid gap-2">
        <button
          type="button"
          disabled={saveAction.isSaving || !saveAction.isDirty}
          onClick={() => void saveAction.handleSave()}
          className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-primary bg-primary px-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:border-disabled disabled:bg-disabled disabled:text-disabled-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {saveAction.isSaving ? <Loader2 size={17} className="animate-spin" aria-hidden /> : <Save size={17} aria-hidden />}
          {saveAction.isSaving ? 'Saving' : 'Save changes'}
        </button>
        <button
          type="button"
          onClick={() => confirmNavigation(`/project/manage/${projectId}`)}
          className="flex min-h-11 items-center justify-between rounded-lg border border-panel-border bg-background px-3 text-sm font-semibold text-text-primary transition-colors hover:border-primary/50 hover:bg-divider/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Manage project
          <ChevronRight size={17} aria-hidden />
        </button>
      </div>

      <div className="mt-auto border-t border-panel-border pt-4">
        <button
          type="button"
          onClick={() => confirmNavigation('/')}
          className="flex min-h-11 w-full items-center gap-2 rounded-lg border border-error/40 bg-error/10 px-3 text-sm font-semibold text-error transition-colors hover:border-error hover:bg-error/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
        >
          <LogOut size={17} aria-hidden />
          Exit project
        </button>
      </div>
    </div>
  )
}

export default function CollapsibleSidebar({ projectId, projectName }: CollapsibleSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [openPanel, setOpenPanel] = useState<WorkspacePanelId | null>(null)

  const sidebarWidth = isCollapsed ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded
  const toggleLabel = isCollapsed ? 'Expand navigation sidebar' : 'Collapse navigation sidebar'
  const ToggleIcon = isCollapsed ? PanelLeftOpen : PanelLeftClose
  const activeItem = NAVIGATION_ITEMS.find((item) => item.id === openPanel)

  return (
    <aside
      className="relative z-[2500] flex h-full shrink-0 flex-col border-r border-panel-border bg-panel text-panel-foreground shadow-sm transition-[width] duration-200 ease-out"
      style={{ width: sidebarWidth }}
      aria-label="Map workspace navigation"
    >
      <SidebarLogo isCollapsed={isCollapsed} />

      <nav className="flex flex-1 flex-col gap-2 px-3 py-3" aria-label="Workspace tools">
        {NAVIGATION_ITEMS.map((item) => (
          <NavigationButton
            key={item.id}
            item={item}
            isActive={openPanel === item.id}
            isCollapsed={isCollapsed}
            onClick={() => {
              if (window.innerWidth < 640) setIsCollapsed(true)
              setOpenPanel((current) => (current === item.id ? null : item.id))
            }}
          />
        ))}
      </nav>

      <div className="border-t border-panel-border px-3 py-3">
        <div className={`mb-2 flex items-center ${isCollapsed ? 'h-11 justify-center' : ''}`}>
          <AppUserAvatar menuPlacement="right-end" showDetails={!isCollapsed} />
        </div>
        <button
          type="button"
          aria-label={toggleLabel}
          aria-expanded={!isCollapsed}
          onClick={() => setIsCollapsed((current) => !current)}
          className={`group relative flex h-11 w-full items-center gap-3 rounded-lg border border-transparent px-3 text-sm font-semibold text-text-secondary transition-colors hover:border-panel-border hover:bg-background hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
        >
          <ToggleIcon className="size-6 shrink-0" size={24} strokeWidth={2.25} aria-hidden />
          <span
            className={`overflow-hidden whitespace-nowrap transition-[opacity,width] duration-150 ${
              isCollapsed ? 'w-0 opacity-0' : 'w-40 opacity-100'
            }`}
            aria-hidden={isCollapsed}
          >
            Collapse sidebar
          </span>
          {isCollapsed && <CollapsedTooltip label="Expand sidebar" />}
        </button>
      </div>

      {openPanel && activeItem && (
        <div
          className="absolute inset-y-0 left-full overflow-hidden border-r border-panel-border bg-panel shadow-xl"
          style={{ width: `min(360px, calc(100vw - ${sidebarWidth}px))` }}
        >
          <WorkspacePanel id={openPanel} title={activeItem.label} onClose={() => setOpenPanel(null)}>
            {openPanel === 'catalog' && <ModelSelectorPanel onClose={() => setOpenPanel(null)} />}
            {openPanel === 'cameras' && <PlacedCameraList />}
            {openPanel === 'settings' && <SettingsPanelContent />}
            {openPanel === 'project' && <ProjectPanelContent projectId={projectId} projectName={projectName} />}
          </WorkspacePanel>
        </div>
      )}
    </aside>
  )
}
