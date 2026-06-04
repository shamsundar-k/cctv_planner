export interface GeoLocation {
  latitude: number
  longitude: number
}

export interface CoverageArea {
  points: GeoLocation[]
}

export interface TargetData {
  distance: number
  height: number
}

export interface CameraPlacement {
  uid: string
  camera_spec_id: string
  location: GeoLocation
  height: number
  bearing: number
  label: string
  color: string
  coverage_area?: CoverageArea | null
  target_data: TargetData
  created_at?: string | null
  updated_at?: string | null
}

export interface CameraPlacementUpdate {
  camera_spec_id?: string | null
  location?: GeoLocation | null
  height?: number | null
  bearing?: number | null
  label?: string | null
  color?: string | null
  coverage_area?: CoverageArea | null
  target_data?: TargetData | null
}

export type CameraPlacementResponse = CameraPlacement
