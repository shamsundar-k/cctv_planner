import type { LucideIcon } from 'lucide-react'

export type TabId = 'cameras' | 'models'

export interface TabButtonProps {
  id: TabId
  label: string
  icon: LucideIcon
  active: boolean
  onClick: (id: TabId) => void
}

export interface LeftSidebarProps {
  projectId: string
}

export interface CamerasTabProps {
  projectId: string
}

export interface ModelsTabProps {
  projectId: string
}

export interface ToggleRowProps {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}

export interface EyeIconProps {
  visible: boolean
}
