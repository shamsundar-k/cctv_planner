import type { CameraPlacement, CameraPlacementUpdate } from '@/types/camera'

export function buildCreatePayload(camera: CameraPlacement): CameraPlacement {
  return {
    uid: camera.uid,
    camera_spec_id: camera.camera_spec_id,
    location: camera.location,
    height: camera.height,
    bearing: camera.bearing,
    label: camera.label,
    color: camera.color,
    coverage_area: camera.coverage_area,
    target_data: camera.target_data,
  }
}

export function buildUpdatePayload(camera: CameraPlacement): CameraPlacementUpdate {
  return {
    camera_spec_id: camera.camera_spec_id,
    location: camera.location,
    height: camera.height,
    bearing: camera.bearing,
    label: camera.label,
    color: camera.color,
    coverage_area: camera.coverage_area,
    target_data: camera.target_data,
  }
}

export function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : 'Unknown error'
}
