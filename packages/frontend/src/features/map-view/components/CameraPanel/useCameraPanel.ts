import { useEffect, useState } from 'react'
import { useImportedCameras } from '@/api/projects'
import { useCameraStore } from '@/store/cameraStore'
import { useCameraLayerStore } from '@/store/cameraLayerSlice'
import type { Camera } from '@/types/camera.types'
import type { CameraModel } from '@/types/cameramodel.types'
import type { fov_input_params } from '@/lib/fovCalculations'
import { computeFovCartesian, computeFovGeoCorners } from '@/lib/fovCalculations'
import type { FormValues } from './types'

function recomputeFov(form: FormValues, camera: Camera, cameraModel: CameraModel | null) {
  if (!cameraModel || form.target_distance === '' || form.target_distance <= 0) return null

  const params: fov_input_params = {
    camera_height: form.camera_height,
    target_distance: form.target_distance,
    target_height: form.target_height,
    focal_length_min: cameraModel.focal_length_min,
    focal_length_max: cameraModel.focal_length_max,
    h_fov_wide: cameraModel.h_fov_max,
    h_fov_tele: cameraModel.h_fov_min,
    v_fov_wide: cameraModel.v_fov_max,
    v_fov_tele: cameraModel.v_fov_min,
    focal_length_chosen: form.focal_length_chosen !== '' ? form.focal_length_chosen : cameraModel.focal_length_min,
  }

  const result = computeFovCartesian(params)
  const geo_fov = computeFovGeoCorners(result, camera.lat, camera.lng, form.bearing)

  let ir_geo_fov = camera.fov_ir_geojson
  if (cameraModel.ir_range > 0) {
    const ir_result = computeFovCartesian({ ...params, target_distance: cameraModel.ir_range })
    ir_geo_fov = computeFovGeoCorners(ir_result, camera.lat, camera.lng, form.bearing)
  }

  return { result, geo_fov, ir_geo_fov }
}

export function useCameraPanel(projectId: string) {
  const selectedCameraId = useCameraLayerStore((s) => s.selectedCameraId)
  const clearSelection = useCameraLayerStore((s) => s.clearSelection)

  const camera = useCameraStore((s) =>
    selectedCameraId ? s.cameraRecords[selectedCameraId]?.camera ?? null : null,
  )
  const uids = useCameraStore((s) => s.uids)
  const updateCamera = useCameraStore((s) => s.updateCamera)
  const removeCamera = useCameraStore((s) => s.removeCamera)
  const saveStatus = useCameraStore((s) =>
    selectedCameraId ? s.cameraRecords[selectedCameraId]?.tracking.status ?? null : null,
  )

  const { data: importedItems } = useImportedCameras(projectId)
  const cameraModel =
    importedItems?.find((item) => item.camera_model.id === camera?.camera_model_id)
      ?.camera_model ?? null

  const [form, setForm] = useState<FormValues | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!camera) { setForm(null); return }
    setForm({
      label: camera.label,
      colour: camera.colour,
      camera_height: camera.camera_height,
      bearing: camera.bearing,
      target_distance: camera.target_distance ?? '',
      target_height: camera.target_height,
      focal_length_chosen: camera.focal_length_chosen ?? '',
    })
    setConfirmDelete(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera?.uid])

  useEffect(() => {
    if (selectedCameraId && !uids.includes(selectedCameraId)) clearSelection()
  }, [uids, selectedCameraId, clearSelection])

  useEffect(() => {
    if (!selectedCameraId) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') clearSelection() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selectedCameraId, clearSelection])

  function setField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    if (!form || !camera || !selectedCameraId) return
    const next = { ...form, [key]: value }
    setForm(next)

    const patch: Partial<Camera> = { [key]: value }

    const fovFields: (keyof FormValues)[] = ['camera_height', 'target_distance', 'target_height', 'focal_length_chosen', 'bearing']
    if (fovFields.includes(key)) {
      const fovResult = recomputeFov(next, camera, cameraModel)
      if (fovResult) {
        patch.fov_visible_geojson = fovResult.geo_fov
        patch.tilt_angle = fovResult.result.tilt_angle
        patch.fov_ir_geojson = fovResult.ir_geo_fov
      }
    }

    updateCamera(selectedCameraId, patch)
  }

  function handleDelete() {
    if (!selectedCameraId) return
    removeCamera(selectedCameraId)
    clearSelection()
  }

  function parseNullableNumber(raw: string): number | '' {
    if (raw === '') return ''
    const n = parseFloat(raw)
    return isNaN(n) ? '' : n
  }

  return {
    selectedCameraId,
    clearSelection,
    camera,
    cameraModel,
    saveStatus,
    form,
    confirmDelete,
    setConfirmDelete,
    setField,
    handleDelete,
    parseNullableNumber,
  }
}
