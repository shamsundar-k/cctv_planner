import { Hand, MousePointer, Camera, Hexagon, Slash, Ruler, Trash2 } from 'lucide-react'
import type { ActiveTool } from '../../store/mapViewSlice'

export type ToolIcon = React.ComponentType<{ size?: number }>

export const toolIcons: Record<ActiveTool, ToolIcon> = {
  pan: Hand,
  select: MousePointer,
  'place-camera': Camera,
  'draw-polygon': Hexagon,
  'draw-line': Slash,
  measure: Ruler,
  delete: Trash2,
}
