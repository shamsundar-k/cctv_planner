import type { ActiveTool } from '../../store/mapActionsSlice'

export interface Tool {
  id: ActiveTool
  label: string
}

export type ToolGroup = {
  tools: Tool[]
}

export const TOOL_GROUPS: ToolGroup[] = [
  {
    tools: [
      { id: 'pan', label: 'Pan' },
      { id: 'select', label: 'Select' },
    ],
  },
  {
    tools: [
      { id: 'place-camera', label: 'Place Camera' },
      { id: 'draw-polygon', label: 'Draw Zone' },
      { id: 'draw-line', label: 'Draw Line' },
    ],
  },
  {
    tools: [
      { id: 'measure', label: 'Measure' },
      { id: 'delete', label: 'Delete' },
    ],
  },
]
