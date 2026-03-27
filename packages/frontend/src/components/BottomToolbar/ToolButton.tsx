import { toolIcons } from './toolIcons'
import type { ActiveTool } from '../../store/mapViewSlice'

interface ToolButtonProps {
  label: string
  icon: ActiveTool
  isActive: boolean
  onClick: () => void
}

export function ToolButton({ label, icon, isActive, onClick }: ToolButtonProps) {
  const Icon = toolIcons[icon]
  return (
    <button
      title={label}
      aria-label={label}
      aria-pressed={isActive}
      onClick={onClick}
      className={`flex items-center gap-1.5 h-8 px-2.5 rounded-md border-none cursor-pointer text-xs font-medium transition-colors whitespace-nowrap ${
        isActive ? 'bg-blue-600 text-white' : 'bg-transparent text-slate-400 hover:bg-slate-700 hover:text-slate-100'
      }`}
    >
      <Icon size={16} />
      <span>{label}</span>
    </button>
  )
}
