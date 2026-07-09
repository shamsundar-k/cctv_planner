import { useState, type ComponentType } from 'react'
import { BarChart3, Camera, Eye, Folder, Layers, PanelLeftClose, PanelLeftOpen, Settings } from 'lucide-react'
import { useNavigate } from 'react-router'

type NavigationItemId = 'project' | 'floor-plans' | 'cameras' | 'views' | 'reports' | 'settings'

interface NavigationItem {
  id: NavigationItemId
  label: string
  icon: ComponentType<{ size?: number; strokeWidth?: number; 'aria-hidden'?: boolean }>
  path?: string
  disabled?: boolean
}

interface CollapsibleSidebarProps {
  projectId: string
}

const SIDEBAR_WIDTH = {
  collapsed: 72,
  expanded: 240,
}

function SidebarLogo({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <div className="flex h-16 items-center gap-3 px-4">
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <Camera size={22} strokeWidth={2.25} aria-hidden />
      </div>
      <div
        className={`min-w-0 overflow-hidden transition-[opacity,width] duration-150 ${
          isCollapsed ? 'w-0 opacity-0' : 'w-36 opacity-100'
        }`}
        aria-hidden={isCollapsed}
      >
        <div className="whitespace-nowrap text-base font-extrabold uppercase leading-5 tracking-tight text-panel-foreground">
          CCTV
        </div>
        <div className="whitespace-nowrap text-xs font-bold uppercase tracking-wide text-text-secondary">
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
      disabled={item.disabled}
      aria-current={isActive ? 'page' : undefined}
      aria-label={item.label}
      title={isCollapsed ? item.label : undefined}
      onClick={onClick}
      className={`group relative flex h-12 w-full items-center gap-3 rounded-xl border border-transparent px-4 text-left text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:text-text-disabled ${
        isActive
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'bg-transparent text-text-secondary hover:bg-divider/60 hover:text-text-primary'
      } ${isCollapsed ? 'justify-center px-0' : ''}`}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-primary-foreground" aria-hidden />
      )}
      <Icon size={22} strokeWidth={2} aria-hidden />
      <span
        className={`overflow-hidden whitespace-nowrap transition-[opacity,width] duration-150 ${
          isCollapsed ? 'w-0 opacity-0' : 'w-36 opacity-100'
        }`}
        aria-hidden={isCollapsed}
      >
        {item.label}
      </span>
      {isCollapsed && <CollapsedTooltip label={item.label} />}
    </button>
  )
}

export default function CollapsibleSidebar({ projectId }: CollapsibleSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [activeItem, setActiveItem] = useState<NavigationItemId>('project')
  const navigate = useNavigate()

  const navigationItems: NavigationItem[] = [
    { id: 'project', label: 'Project', icon: Folder, path: `/project/manage/${projectId}` },
    { id: 'floor-plans', label: 'Floor Plans', icon: Layers },
    { id: 'cameras', label: 'Cameras', icon: Camera },
    { id: 'views', label: 'Views', icon: Eye },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  const sidebarWidth = isCollapsed ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded
  const toggleLabel = isCollapsed ? 'Expand navigation sidebar' : 'Collapse navigation sidebar'
  const ToggleIcon = isCollapsed ? PanelLeftOpen : PanelLeftClose

  return (
    <aside
      className="absolute inset-y-0 left-0 z-[2500] flex flex-col border-r border-panel-border bg-panel text-panel-foreground shadow-sm transition-[width] duration-200 ease-out"
      style={{ width: sidebarWidth }}
      aria-label="Primary navigation"
    >
      <SidebarLogo isCollapsed={isCollapsed} />

      <nav className="flex flex-1 flex-col gap-2 px-3 py-4" aria-label="Project sections">
        {navigationItems.map((item) => (
          <NavigationButton
            key={item.id}
            item={item}
            isActive={activeItem === item.id}
            isCollapsed={isCollapsed}
            onClick={() => {
              setActiveItem(item.id)
              if (item.path) navigate(item.path)
            }}
          />
        ))}
      </nav>

      <div className="mx-4 border-t border-divider py-4">
        <button
          type="button"
          aria-label={toggleLabel}
          title={isCollapsed ? toggleLabel : undefined}
          aria-expanded={!isCollapsed}
          onClick={() => setIsCollapsed((current) => !current)}
          className={`group relative flex h-11 w-full items-center gap-3 rounded-xl px-4 text-sm font-semibold text-text-secondary transition-colors hover:bg-divider/60 hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
        >
          <ToggleIcon size={21} strokeWidth={2} aria-hidden />
          <span
            className={`overflow-hidden whitespace-nowrap transition-[opacity,width] duration-150 ${
              isCollapsed ? 'w-0 opacity-0' : 'w-36 opacity-100'
            }`}
            aria-hidden={isCollapsed}
          >
            Collapse
          </span>
          {isCollapsed && <CollapsedTooltip label="Expand" />}
        </button>
      </div>
    </aside>
  )
}
