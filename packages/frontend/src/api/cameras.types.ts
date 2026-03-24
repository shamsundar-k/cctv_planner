export type CameraType = 'fixed_dome' | 'ptz' | 'bullet'
export type LensType = 'fixed' | 'varifocal'
export type SensorType = 'cmos'

export interface CameraModel {
  id: string
  name: string
  manufacturer: string
  model_number: string
  camera_type: CameraType
  location: string
  notes: string | null

  focal_length_min: number
  focal_length_max: number
  h_fov_min: number
  h_fov_max: number
  v_fov_min: number
  v_fov_max: number
  lens_type: LensType
  ir_cut_filter: boolean
  ir_range: number

  resolution_h: number
  resolution_v: number
  megapixels: number
  aspect_ratio: string
  sensor_size: string | null
  sensor_type: SensorType
  min_illumination: number
  wdr: boolean
  wdr_db: number | null

  created_by: string
  created_at: string
  updated_at: string
}

export type CameraModelCreate = Omit<CameraModel, 'id' | 'megapixels' | 'aspect_ratio' | 'created_by' | 'created_at' | 'updated_at' | 'notes' | 'sensor_size'> & {
  megapixels?: number
  aspect_ratio?: string
  notes: string | null
  sensor_size: string | null
}

export type CameraModelUpdate = Partial<CameraModelCreate>
