export interface Project {
  name: string
  description: string
  center_lat: number | null
  center_lng: number | null
  default_zoom: number | null
}

export interface ProjectUpdate {
  name?: string
  description?: string
  center_lat?: number | null
  center_lng?: number | null
  default_zoom?: number | null
}

export interface CameraSummary {
  id: string
  client_id: string
  label: string
  lat: number
  lng: number
  bearing: number
  camera_height: number
  tilt_angle: number
  focal_length_chosen: number | null
  colour: string
  visible: boolean
  fov_visible_geojson: Record<string, unknown> | null
  fov_ir_geojson: Record<string, unknown> | null
  target_distance: number | null
  target_height: number
  camera_model_id: string
  created_at: string
  updated_at: string
}

export interface ProjectRecord extends Project {
  id: string
  created_by_id: string
  camera_count: number
  created_at: string
  updated_at: string
}

export interface ProjectDetailRecord extends ProjectRecord {
  cameras: CameraSummary[]
}
