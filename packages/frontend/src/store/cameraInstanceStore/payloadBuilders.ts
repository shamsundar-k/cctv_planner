import type { CameraInstance, CameraInstanceCreatePayload, CameraInstanceUpdatePayload } from '../../api/cameraInstances.types'

export function buildCreatePayload(camera: CameraInstance): CameraInstanceCreatePayload {
  return {
    client_id: camera.client_id,
    camera_model_id: camera.camera_model_id,
    label: camera.label,
    lat: camera.lat,
    lng: camera.lng,
    bearing: camera.bearing,
    camera_height: camera.camera_height,
    tilt_angle: camera.tilt_angle,
    focal_length_chosen: camera.focal_length_chosen,
    colour: camera.colour,
    visible: camera.visible,
    fov_visible_geojson: camera.fov_visible_geojson,
    fov_ir_geojson: camera.fov_ir_geojson,
    target_distance: camera.target_distance,
    target_height: camera.target_height,
  }
}

export function buildUpdatePayload(camera: CameraInstance): CameraInstanceUpdatePayload {
  return {
    label: camera.label,
    lat: camera.lat,
    lng: camera.lng,
    bearing: camera.bearing,
    camera_height: camera.camera_height,
    tilt_angle: camera.tilt_angle,
    focal_length_chosen: camera.focal_length_chosen,
    colour: camera.colour,
    visible: camera.visible,
    fov_visible_geojson: camera.fov_visible_geojson,
    fov_ir_geojson: camera.fov_ir_geojson,
    target_distance: camera.target_distance,
    target_height: camera.target_height,
  }
}

export function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : 'Unknown error'
}
