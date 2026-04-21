import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useCameraModel, useCreateCameraModel, useUpdateCameraModel } from '../../../api/camerasModels'
import { useToast } from '../../../components/ui/Toast'
import { isStandardSensorFormat } from '../../../constants/sensorFormats'
import type { CameraModelCreate } from '../../../types/cameramodel.types'
import { emptyForm } from '../../admin-cameras/utils/cameraFormHelpers'

export function useAdminCameraEdit() {
  const { id } = useParams<{ id: string }>()
  const isNew = id === 'new'
  const navigate = useNavigate()
  const showToast = useToast()

  const { data: existing, isLoading } = useCameraModel(id ?? '')
  const createCamera = useCreateCameraModel()
  const updateCamera = useUpdateCameraModel()

  const [form, setForm] = useState<CameraModelCreate>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sensorIsCustom, setSensorIsCustom] = useState(false)

  useEffect(() => {
    if (existing) {
      const existingSensorSize = existing.sensor_size ?? null
      const isCustom = !!existingSensorSize && !isStandardSensorFormat(existingSensorSize)
      setSensorIsCustom(isCustom)
      setForm({
        name: existing.name,
        manufacturer: existing.manufacturer,
        model_number: existing.model_number,
        camera_type: existing.camera_type,
        location: existing.location,
        notes: existing.notes ?? '',
        focal_length_min: existing.focal_length_min,
        focal_length_max: existing.focal_length_max,
        h_fov_min: existing.h_fov_min,
        h_fov_max: existing.h_fov_max,
        v_fov_min: existing.v_fov_min,
        v_fov_max: existing.v_fov_max,
        lens_type: existing.lens_type,
        ir_cut_filter: existing.ir_cut_filter,
        ir_range: existing.ir_range,
        resolution_h: existing.resolution_h,
        resolution_v: existing.resolution_v,
        sensor_size: existingSensorSize,
        sensor_type: existing.sensor_type,
        min_illumination: existing.min_illumination,
        wdr: existing.wdr,
        wdr_db: existing.wdr_db ?? null,
      })
    }
  }, [existing])

  function set<K extends keyof CameraModelCreate>(key: K, value: CameraModelCreate[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  function handleLensTypeChange(lt: CameraModelCreate['lens_type']) {
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
    if (form.focal_length_min <= 0) e.focal_length_min = 'Must be > 0'
    if (form.focal_length_max < form.focal_length_min) e.focal_length_max = 'Must be ≥ min focal length'
    if (form.h_fov_min <= 0 || form.h_fov_min >= 360) e.h_fov_min = 'Must be 0–360°'
    if (form.h_fov_max < form.h_fov_min) e.h_fov_max = 'Must be ≥ min H-FOV'
    if (form.v_fov_min <= 0 || form.v_fov_min >= 180) e.v_fov_min = 'Must be 0–180°'
    if (form.v_fov_max < form.v_fov_min) e.v_fov_max = 'Must be ≥ min V-FOV'
    if (form.resolution_h <= 0) e.resolution_h = 'Must be > 0'
    if (form.resolution_v <= 0) e.resolution_v = 'Must be > 0'
    if (form.lens_type === 'fixed') {
      if (form.focal_length_max !== form.focal_length_min) e.focal_length_max = 'Fixed lens: max must equal min'
      if (form.h_fov_max !== form.h_fov_min) e.h_fov_max = 'Fixed lens: max must equal min'
      if (form.v_fov_max !== form.v_fov_min) e.v_fov_max = 'Fixed lens: max must equal min'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    const payload: CameraModelCreate = {
      ...form,
      notes: form.notes || null,
      sensor_size: form.sensor_size || null,
      wdr_db: form.wdr ? form.wdr_db : null,
    }

    try {
      if (isNew) {
        await createCamera.mutateAsync(payload)
        showToast('Camera model created', 'success')
      } else {
        await updateCamera.mutateAsync({ id: id!, body: payload })
        showToast('Camera model updated', 'success')
      }
      navigate('/admin/manage/cameras')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Failed to save camera model'
      showToast(typeof msg === 'string' ? msg : 'Failed to save camera model', 'error')
    }
  }

  return {
    isNew,
    isLoading,
    form,
    setForm,
    errors,
    sensorIsCustom,
    setSensorIsCustom,
    set,
    handleLensTypeChange,
    handleSubmit,
    isPending: createCamera.isPending || updateCamera.isPending,
    isFixed: form.lens_type === 'fixed',
  }
}
