export type CameraType = 'dome' | 'bullet' | 'ptz'
export type SpecLensType = 'fixed' | 'varifocal'

export interface FocalLengthSpec {
  min: number
  max: number
}

export interface FovSpec {
  min: number
  max: number
}

export interface CameraLensSpec {
  lens_type: SpecLensType
  focal_length: FocalLengthSpec
  h_fov: FovSpec
  v_fov: FovSpec
}

export interface CameraResolutionSpec {
  horizontal: number
  vertical: number
}

export interface CameraSensorSpec {
  resolution: CameraResolutionSpec
  megapixel: number | null
  sensor_size: string | null
}

export interface CameraSpec {
  name: string
  manufacturer: string
  model: string
  camera_type: CameraType
  lens_spec: CameraLensSpec
  sensor_spec: CameraSensorSpec
  ir_range: number
}

export type CameraSpecUpdate = Partial<{
  name: string | null
  manufacturer: string | null
  model: string | null
  camera_type: CameraType | null
  lens_spec: CameraLensSpec | null
  sensor_spec: CameraSensorSpec | null
  ir_range: number | null
}>

export interface CameraSpecResponse extends CameraSpec {
  id: string
  created_at: string
  updated_at: string
}

export interface CameraSpecForm {
  name: string
  manufacturer: string
  model: string
  camera_type: CameraType
  lens_type: SpecLensType
  focal_length_min: number | ''
  focal_length_max: number | ''
  h_fov_min: number | ''
  h_fov_max: number | ''
  v_fov_min: number | ''
  v_fov_max: number | ''
  resolution_h: number | ''
  resolution_v: number | ''
  sensor_size: string | null
  ir_range: number | ''
}
