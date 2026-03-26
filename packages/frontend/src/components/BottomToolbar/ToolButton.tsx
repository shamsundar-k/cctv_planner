import { getIcon } from './toolIcons'
import type { ActiveTool } from '../../store/mapViewSlice'
import { useMemo } from 'react'

interface ToolButtonProps {
  label: string
  icon: ActiveTool
  isActive: boolean
  onClick: () => void
}

export function ToolButton({ label, icon, isActive, onClick }: ToolButtonProps) {
  const IconComponent = useMemo(() => getIcon(icon), [icon])
  return (
    <button
      title={label}
      onClick={onClick}
      className={[
        'flex items-center gap-1.5 h-8 px-2.5 rounded-md border-none cursor-pointer text-xs font-medium transition-colors whitespace-nowrap',
        isActive ? 'bg-blue-600 text-white' : 'bg-transparent text-slate-400 hover:bg-slate-700 hover:text-slate-100',
      ].join(' ')}
    >
      <IconComponent size={16} />
      <span>{label}</span>
    </button>
  )
}
