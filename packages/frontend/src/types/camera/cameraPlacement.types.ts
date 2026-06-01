export interface GeoLocation {
  latitude: number
  longitude: number
}

export interface CameraPlacement {
  uid: string
  camera_spec_id: string
  location: GeoLocation
  height: number
  bearing: number
  label: string
  color: string
  created_at?: string | null
  updated_at?: string | null
}

export type CameraPlacementUpdate = Partial<
  Omit<CameraPlacement, 'uid' | 'created_at' | 'updated_at'>
>
