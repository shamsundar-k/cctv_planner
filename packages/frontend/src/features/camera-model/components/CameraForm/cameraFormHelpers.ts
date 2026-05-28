import type { CameraSpec, CameraSpecForm } from '@/types/camera'

export function calcMegapixels(h: number | '', v: number | ''): string {
  if (!h || !v) return '-'
  const mp = (h * v) / 1_000_000
  return mp < 1 ? mp.toFixed(2) : mp.toFixed(1)
}

export function calcMegapixelNumber(h: number, v: number): number | null {
  if (!h || !v) return null
  return Number(((h * v) / 1_000_000).toFixed(2))
}

export function parseNumberInput(value: string): number | '' {
  if (value === '') return ''
  const parsed = Number(value)
  return Number.isNaN(parsed) ? '' : parsed
}

export function parseIntegerInput(value: string): number | '' {
  if (value === '') return ''
  const parsed = parseInt(value, 10)
  return Number.isNaN(parsed) ? '' : parsed
}

function requireNumber(value: number | ''): number {
  if (value === '') {
    throw new Error('Camera form has empty numeric values')
  }
  return value
}

export function toCameraSpecPayload(form: CameraSpecForm): CameraSpec {
  const focalLengthMin = requireNumber(form.focal_length_min)
  const focalLengthMax = requireNumber(form.focal_length_max)
  const hFovMin = requireNumber(form.h_fov_min)
  const hFovMax = requireNumber(form.h_fov_max)
  const vFovMin = requireNumber(form.v_fov_min)
  const vFovMax = requireNumber(form.v_fov_max)
  const resolutionH = requireNumber(form.resolution_h)
  const resolutionV = requireNumber(form.resolution_v)
  const irRange = requireNumber(form.ir_range)

  return {
    name: form.name.trim(),
    manufacturer: form.manufacturer.trim(),
    model: form.model.trim(),
    camera_type: form.camera_type,
    lens_spec: {
      lens_type: form.lens_type,
      focal_length: {
        min: focalLengthMin,
        max: focalLengthMax,
      },
      h_fov: {
        min: hFovMin,
        max: hFovMax,
      },
      v_fov: {
        min: vFovMin,
        max: vFovMax,
      },
    },
    sensor_spec: {
      resolution: {
        horizontal: resolutionH,
        vertical: resolutionV,
      },
      megapixel: calcMegapixelNumber(resolutionH, resolutionV),
      sensor_size: form.sensor_size ? form.sensor_size.trim() : null,
    },
    ir_range: irRange,
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
