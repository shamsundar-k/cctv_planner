import type { CameraModel } from './cameramodel.types'

export interface Collaborator {
  user_id: string
  role: 'editor' | 'viewer'
}

export interface Project {
  id: string
  name: string
  description: string
  owner_id: string
  collaborators: Collaborator[]
  center_lat: number | null
  center_lng: number | null
  default_zoom: number | null
  camera_count: number
  zone_count: number
  imported_camera_model_count: number
  created_at: string
  updated_at: string
}

export interface ImportedCameraItem {
  camera_model: CameraModel
  placed_count: number
}

export interface CreateProjectDTO {
  name: string
  description?: string
  center_lat?: number | null
  center_lng?: number | null
  default_zoom?: number | null
}

export interface UpdateProjectDTO {
  name?: string
  description?: string
  center_lat?: number | null
  center_lng?: number | null
  default_zoom?: number | null
}
