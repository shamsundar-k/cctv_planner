export interface Camera {
  uid: string                 // stable client-generated ID, persisted on server
  camera_model_id: string
  label: string
  lat: number
  lng: number
  bearing: number
  camera_height: number
  tilt_angle: number
  focal_length_chosen: number | null
  colour: string
  visible: boolean
  fov_visible_geojson: object | null
  fov_ir_geojson: object | null
  target_distance: number | null
  target_height: number
}

export interface CameraCreatePayload {
  uid: string                   // required — server persists and routes by this
  camera_model_id: string
  label?: string
  lat: number
  lng: number
  bearing?: number
  camera_height?: number
  tilt_angle?: number
  focal_length_chosen?: number | null
  colour?: string
  visible?: boolean
  fov_visible_geojson?: object | null
  fov_ir_geojson?: object | null
  target_distance?: number | null
  target_height?: number
}

export interface CameraUpdatePayload {
  label?: string
  lat?: number
  lng?: number
  bearing?: number
  camera_height?: number
  tilt_angle?: number
  focal_length_chosen?: number | null
  colour?: string
  visible?: boolean
  fov_visible_geojson?: object | null
  fov_ir_geojson?: object | null
  target_distance?: number | null
  target_height?: number
}
