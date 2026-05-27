import { useState } from 'react'
import { isStandardSensorFormat } from '../../../constants/sensorFormats'
import type { CameraSpecForm, CameraSpecResponse } from '@/types/camera'
import { emptyForm } from '../components/CameraForm/cameraFormHelpers'

export function useCameraFormState() {
  const [form, setForm] = useState<CameraSpecForm>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sensorIsCustom, setSensorIsCustom] = useState(false)

  function set<K extends keyof CameraSpecForm>(key: K, value: CameraSpecForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  function handleLensTypeChange(lt: CameraSpecForm['lens_type']) {
    set('lens_type', lt)
    if (lt === 'fixed') {
      setForm((prev) => ({
        ...prev,
        lens_type: lt,
        focal_length_max: prev.focal_length_min,
        h_fov_max: prev.h_fov_min,
        v_fov_max: prev.v_fov_min,
      }))
    }
  }

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.manufacturer.trim()) e.manufacturer = 'Manufacturer is required'
    if (!form.model.trim()) e.model = 'Model is required'
    if (form.focal_length_min <= 0) e.focal_length_min = 'Must be > 0'
    if (form.focal_length_max < form.focal_length_min) e.focal_length_max = 'Must be ≥ min focal length'
    if (form.h_fov_min <= 0 || form.h_fov_min >= 180) e.h_fov_min = 'Must be > 0 and < 180°'
    if (form.h_fov_max < form.h_fov_min) e.h_fov_max = 'Must be ≥ min H-FOV'
    if (form.h_fov_max <= 0 || form.h_fov_max >= 180) e.h_fov_max = 'Must be > 0 and < 180°'
    if (form.v_fov_min <= 0 || form.v_fov_min >= 180) e.v_fov_min = 'Must be > 0 and < 180°'
    if (form.v_fov_max < form.v_fov_min) e.v_fov_max = 'Must be ≥ min V-FOV'
    if (form.v_fov_max <= 0 || form.v_fov_max >= 180) e.v_fov_max = 'Must be > 0 and < 180°'
    if (form.resolution_h <= 0) e.resolution_h = 'Must be > 0'
    if (form.resolution_v <= 0) e.resolution_v = 'Must be > 0'
    if (form.ir_range < 0) e.ir_range = 'Must be ≥ 0'
    if (form.lens_type === 'fixed') {
      if (form.focal_length_max !== form.focal_length_min) e.focal_length_max = 'Fixed lens: max must equal min'
      if (form.h_fov_max !== form.h_fov_min) e.h_fov_max = 'Fixed lens: max must equal min'
      if (form.v_fov_max !== form.v_fov_min) e.v_fov_max = 'Fixed lens: max must equal min'
    }
    if (form.lens_type === 'varifocal') {
      if (form.focal_length_max === form.focal_length_min) e.focal_length_max = 'Varifocal lens: max must differ from min'
      if (form.h_fov_max === form.h_fov_min) e.h_fov_max = 'Varifocal lens: max must differ from min'
      if (form.v_fov_max === form.v_fov_min) e.v_fov_max = 'Varifocal lens: max must differ from min'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function initFrom(existing: CameraSpecResponse) {
    const sensorSize = existing.sensor_spec.sensor_size ?? null
    setSensorIsCustom(!!sensorSize && !isStandardSensorFormat(sensorSize))
    setForm({
      name: existing.name,
      manufacturer: existing.manufacturer,
      model: existing.model,
      camera_type: existing.camera_type,
      focal_length_min: existing.lens_spec.focal_length.min,
      focal_length_max: existing.lens_spec.focal_length.max,
      h_fov_min: existing.lens_spec.h_fov.min,
      h_fov_max: existing.lens_spec.h_fov.max,
      v_fov_min: existing.lens_spec.v_fov.min,
      v_fov_max: existing.lens_spec.v_fov.max,
      lens_type: existing.lens_spec.lens_type,
      ir_range: existing.ir_range,
      resolution_h: existing.sensor_spec.resolution.horizontal,
      resolution_v: existing.sensor_spec.resolution.vertical,
      sensor_size: sensorSize,
    })
  }

  return {
    form,
    setForm,
    errors,
    sensorIsCustom,
    setSensorIsCustom,
    set,
    handleLensTypeChange,
    validate,
    initFrom,
    isFixed: form.lens_type === 'fixed',
  }
}
