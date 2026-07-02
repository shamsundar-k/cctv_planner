import type { ProjectRecord } from '../../../types/projects.types'
import { formatCoord } from '../utils/projectCardFormat'

interface ProjectCardMetaProps {
  cameraCount: number
  centerLat: ProjectRecord['center_lat']
  centerLng: ProjectRecord['center_lng']
}

export default function ProjectCardMeta({ cameraCount, centerLat, centerLng }: ProjectCardMetaProps) {
  const hasLocation = centerLat !== null && centerLng !== null

  return (
    <>
      <div className="flex items-center gap-3 text-[13px] text-text-muted">
        <span>📷 {cameraCount} camera{cameraCount !== 1 ? 's' : ''}</span>
      </div>

      {hasLocation && (
        <div className="text-[13px] text-text-muted">
          📍 {formatCoord(centerLat!, 'lat')}, {formatCoord(centerLng!, 'lng')}
        </div>
      )}
    </>
  )
}
