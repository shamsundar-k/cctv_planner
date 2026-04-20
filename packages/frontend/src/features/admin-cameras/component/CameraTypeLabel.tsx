import type { CameraModel } from '../../../types/cameramodel.types'

const map: Record<CameraModel['camera_type'], string> = {
  fixed_dome: 'Fixed Dome',
  ptz: 'PTZ',
  bullet: 'Bullet',
}

export default function CameraTypeLabel({ type }: { type: CameraModel['camera_type'] }) {
  return <span>{map[type] ?? type}</span>
}
