import type { Project } from '../../../api/projects.types'
import { formatCoord } from '../utils/projectCardFormat'

interface ProjectCardMetaProps {
  cameraCount: number
  zoneCount: number
  centerLat: Project['center_lat']
  centerLng: Project['center_lng']
}

export default function ProjectCardMeta({ cameraCount, zoneCount, centerLat, centerLng }: ProjectCardMetaProps) {
  const hasLocation = centerLat !== null && centerLng !== null

  return (
    <>
      <div className="flex items-center gap-3 text-[13px] text-muted/80">
        <span>📷 {cameraCount} camera{cameraCount !== 1 ? 's' : ''}</span>
        <span className="text-surface/40">|</span>
        <span>📝 {zoneCount} zone{zoneCount !== 1 ? 's' : ''}</span>
      </div>

      {hasLocation && (
        <div className="text-[13px] text-muted/70">
          📍 {formatCoord(centerLat!, 'lat')}, {formatCoord(centerLng!, 'lng')}
        </div>
      )}
    </>
  )
}
