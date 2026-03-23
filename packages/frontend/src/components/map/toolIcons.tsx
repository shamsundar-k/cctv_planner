import { Hand, MousePointer, Camera, Hexagon, Slash, Ruler, Trash2 } from 'lucide-react'
import type { ActiveTool } from '../../store/mapViewSlice'

type IconComponent = React.ComponentType<{ size?: number }>

const iconMap: Record<ActiveTool, IconComponent> = {
  pan: Hand,
  select: MousePointer,
  'place-camera': Camera,
  'draw-polygon': Hexagon,
  'draw-line': Slash,
  measure: Ruler,
  delete: Trash2,
}

export function getIcon(name: ActiveTool): IconComponent {
  return iconMap[name]
}
