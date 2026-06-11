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

export interface ProjectRecord extends Project {
  id: string
  created_by_id: string
  camera_count: number
  created_at: string
  updated_at: string
}
