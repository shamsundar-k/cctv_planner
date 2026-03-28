export interface CameraInstance {
  id: string
  label: string
  lat: number
  lng: number
  bearing: number
  height: number
  tilt_angle: number
  focal_length_chosen: number | null
  colour: string
  fov_visible_geojson: object | null
  fov_ir_geojson: object | null
  target_distance: number | null
  target_height: number
  camera_model_id: string
  project_id: string
  created_at: string
  updated_at: string
}

export interface CameraInstanceCreatePayload {
  camera_model_id: string
  label?: string
  lat: number
  lng: number
  bearing?: number
  height?: number
  tilt_angle?: number
  focal_length_chosen?: number | null
  colour?: string
  visible?: boolean
  fov_visible_geojson?: object | null
  fov_ir_geojson?: object | null
  target_distance?: number | null
  target_height?: number
}

export interface CameraInstanceUpdatePayload {
  label?: string
  lat?: number
  lng?: number
  bearing?: number
  height?: number
  tilt_angle?: number
  focal_length_chosen?: number | null
  colour?: string
  visible?: boolean
  fov_visible_geojson?: object | null
  fov_ir_geojson?: object | null
  target_distance?: number | null
  target_height?: number
}
