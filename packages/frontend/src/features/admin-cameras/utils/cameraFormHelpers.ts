import type { CameraModelCreate } from '../../../types/cameramodel.types'

export function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

export function calcMegapixels(h: number, v: number): string {
  if (!h || !v) return '—'
  const mp = (h * v) / 1_000_000
  return mp < 1 ? mp.toFixed(2) : mp.toFixed(1)
}

export function calcAspectRatio(h: number, v: number): string {
  if (!h || !v) return '—'
  const g = gcd(h, v)
  return `${h / g}:${v / g}`
}

export const emptyForm: CameraModelCreate = {
  name: '',
  manufacturer: '',
  model_number: '',
  camera_type: 'bullet',
  location: '',
  notes: '',
  focal_length_min: 4,
  focal_length_max: 4,
  h_fov_min: 90,
  h_fov_max: 90,
  v_fov_min: 55,
  v_fov_max: 55,
  lens_type: 'fixed',
  ir_cut_filter: true,
  ir_range: 0,
  resolution_h: 1920,
  resolution_v: 1080,
  sensor_size: null,
  sensor_type: 'cmos',
  min_illumination: 0,
  wdr: false,
  wdr_db: null,
}
