import type { CameraSpecRecord } from '@/types/camera'

interface Props {
  camera: CameraSpecRecord
}

const map: Record<CameraSpecRecord['camera_type'], string> = {
  dome: 'Dome',
  ptz: 'PTZ',
  bullet: 'Bullet',
}

function CameraTypeLabel({ type }: { type: CameraSpecRecord['camera_type'] }) {
  return <span>{map[type] ?? type}</span>
}

function CameraSpecType({ camera }: Props) {
  return (
    <>
      <span className="text-text-muted">Type</span>
      <span className="text-text-primary">
        <CameraTypeLabel type={camera.camera_type} />
      </span>
    </>
  )
}

function CameraSpecResolution({ camera }: Props) {
  return (
    <>
      <span className="text-text-muted">Resolution</span>
      <span className="text-text-primary">
        {camera.sensor_spec.resolution.horizontal}×{camera.sensor_spec.resolution.vertical}
        {camera.sensor_spec.megapixel ? ` (${camera.sensor_spec.megapixel}MP)` : ''}
      </span>
    </>
  )
}

function CameraSpecHorizontalFOV({ camera }: Props) {
  return (
    <>
      <span className="text-text-muted">H-FOV</span>
      <span className="text-text-primary">
        {camera.lens_spec.h_fov.min === camera.lens_spec.h_fov.max
          ? `${camera.lens_spec.h_fov.min}°`
          : `${camera.lens_spec.h_fov.min}°–${camera.lens_spec.h_fov.max}°`}
      </span>
    </>
  )
}

function CameraSpecFocalLength({ camera }: Props) {
  return (
    <>
      <span className="text-text-muted">Focal length</span>
      <span className="text-text-primary">
        {camera.lens_spec.focal_length.min === camera.lens_spec.focal_length.max
          ? `${camera.lens_spec.focal_length.min} mm`
          : `${camera.lens_spec.focal_length.min}–${camera.lens_spec.focal_length.max} mm`}
      </span>
    </>
  )
}

function CameraSpecIRRange({ camera }: Props) {
  return (
    <>
      <span className="text-text-muted">IR range</span>
      <span className="text-text-primary">{camera.ir_range > 0 ? `${camera.ir_range} m` : 'N/A'}</span>
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
