import { ToolButton } from './ToolButton'
import type { ActiveTool } from '../../store/mapViewSlice'
import type { Tool } from './toolbarConfig'

interface ToolGroupProps {
  tools: Tool[]
  activeTool: ActiveTool
  onToolChange: (tool: ActiveTool) => void
  showSeparator?: boolean
}

export function ToolGroup({ tools, activeTool, onToolChange, showSeparator = false }: ToolGroupProps) {
  return (
    <div className="flex items-center gap-1">
      {showSeparator && <div className="w-px h-6 bg-slate-600 mx-1" />}
      {tools.map((tool) => (
        <ToolButton
          key={tool.id}
          label={tool.label}
          icon={tool.id}
          isActive={activeTool === tool.id}
          onClick={() => onToolChange(tool.id)}
        />
      ))}
    </div>
  )
}
