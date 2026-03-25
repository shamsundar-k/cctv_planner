import { useCallback } from 'react'
import { useMapViewStore } from '../../store/mapViewSlice'
import { ToolGroup } from './ToolGroup'
import { TOOL_GROUPS } from './toolbarConfig'
import { useToolbarKeyboard } from '../../hooks/useToolbarKeyboard'

export default function BottomToolbar() {
  const activeTool = useMapViewStore((s) => s.activeTool)
  const setActiveTool = useMapViewStore((s) => s.setActiveTool)

  const resetTool = useCallback(() => setActiveTool('pan'), [setActiveTool])
  useToolbarKeyboard(resetTool)

  return (
    <div className="h-12 shrink-0 bg-slate-800 border-t border-slate-700 flex items-center px-4 gap-1 z-[100]">
      {TOOL_GROUPS.map((group, gi) => (
        <ToolGroup
          key={gi}
          tools={group.tools}
          activeTool={activeTool}
          onToolChange={setActiveTool}
          showSeparator={gi > 0}
        />
      ))}
    </div>
  )
}
