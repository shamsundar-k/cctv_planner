import type { CameraSpec, CameraSpecForm } from '@/types/camera'

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

export function calcMegapixelNumber(h: number, v: number): number | null {
  if (!h || !v) return null
  return Number(((h * v) / 1_000_000).toFixed(2))
}

export function toCameraSpecPayload(form: CameraSpecForm): CameraSpec {
  return {
    name: form.name.trim(),
    manufacturer: form.manufacturer.trim(),
    model: form.model.trim(),
    camera_type: form.camera_type,
    lens_spec: {
      lens_type: form.lens_type,
      focal_length: {
        min: form.focal_length_min,
        max: form.focal_length_max,
      },
      h_fov: {
        min: form.h_fov_min,
        max: form.h_fov_max,
      },
      v_fov: {
        min: form.v_fov_min,
        max: form.v_fov_max,
      },
    },
    sensor_spec: {
      resolution: {
        horizontal: form.resolution_h,
        vertical: form.resolution_v,
      },
      megapixel: calcMegapixelNumber(form.resolution_h, form.resolution_v),
      sensor_size: form.sensor_size ? form.sensor_size.trim() : null,
    },
    ir_range: form.ir_range,
  }
}

export const emptyForm: CameraSpecForm = {
  name: '',
  manufacturer: '',
  model: '',
  camera_type: 'bullet',
  focal_length_min: 4,
  focal_length_max: 4,
  h_fov_min: 90,
  h_fov_max: 90,
  v_fov_min: 55,
  v_fov_max: 55,
  lens_type: 'fixed',
  ir_range: 0,
  resolution_h: 1920,
  resolution_v: 1080,
  sensor_size: null,
}
