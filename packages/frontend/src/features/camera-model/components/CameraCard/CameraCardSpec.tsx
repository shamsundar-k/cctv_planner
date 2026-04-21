import type { CameraModel } from '@/types/cameramodel.types'

interface Props {
  camera: CameraModel
}

const map: Record<CameraModel['camera_type'], string> = {
  fixed_dome: 'Fixed Dome',
  ptz: 'PTZ',
  bullet: 'Bullet',
}

function CameraTypeLabel({ type }: { type: CameraModel['camera_type'] }) {
  return <span>{map[type] ?? type}</span>
}

function CameraSpecType({ camera }: Props) {
  return (
    <>
      <span className="text-muted">Type</span>
      <span className="text-primary">
        <CameraTypeLabel type={camera.camera_type} />
      </span>
    </>
  )
}

function CameraSpecResolution({ camera }: Props) {
  return (
    <>
      <span className="text-muted">Resolution</span>
      <span className="text-primary">
        {camera.resolution_h}×{camera.resolution_v} ({camera.megapixels}MP)
      </span>
    </>
  )
}

function CameraSpecHorizontalFOV({ camera }: Props) {
  return (
    <>
      <span className="text-muted">H-FOV</span>
      <span className="text-primary">
        {camera.h_fov_min === camera.h_fov_max
          ? `${camera.h_fov_min}°`
          : `${camera.h_fov_min}°–${camera.h_fov_max}°`}
      </span>
    </>
  )
}

function CameraSpecFocalLength({ camera }: Props) {
  return (
    <>
      <span className="text-muted">Focal length</span>
      <span className="text-primary">
        {camera.focal_length_min === camera.focal_length_max
          ? `${camera.focal_length_min} mm`
          : `${camera.focal_length_min}–${camera.focal_length_max} mm`}
      </span>
    </>
  )
}

function CameraSpecIRRange({ camera }: Props) {
  return (
    <>
      <span className="text-muted">IR range</span>
      <span className="text-primary">{camera.ir_range > 0 ? `${camera.ir_range} m` : 'N/A'}</span>
    </>
  )
}

export const CameraCardSpec = {
  Type: CameraSpecType,
  Resolution: CameraSpecResolution,
  HorizontalFOV: CameraSpecHorizontalFOV,
  FocalLength: CameraSpecFocalLength,
  IRRange: CameraSpecIRRange,
}

export default CameraCardSpec
