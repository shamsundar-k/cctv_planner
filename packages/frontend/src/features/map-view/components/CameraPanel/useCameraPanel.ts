import { useEffect, useMemo, useState } from 'react'
import { useAllCameraSpecs } from '@/hooks/useCameraSpecs'
import { useCameraStore } from '@/store/cameraStore'
import { useCameraLayerStore } from '@/store/cameraLayerSlice'
import type { CameraPlacement, CameraSpecRecord, CoverageArea } from '@/types/camera'
import type { fov_input_params, FovCartesian } from '@/lib/fovCalculations'
import { computeFovCartesian, computeFovGeoCorners } from '@/lib/fovCalculations'
import type { FormValues } from './types'

function recomputeCoverageArea(
  form: FormValues,
  camera: CameraPlacement,
  cameraModel: CameraSpecRecord | null,
): { result: FovCartesian, coverage_area: CoverageArea | null } | null {
  if (!cameraModel || form.target_distance === '' || form.target_distance <= 0) return null

  const params: fov_input_params = {
    camera_height: form.height,
    target_distance: form.target_distance,
    target_height: form.target_height,
    focal_length_min: cameraModel.lens_spec.focal_length.min,
    focal_length_max: cameraModel.lens_spec.focal_length.max,
    h_fov_wide: cameraModel.lens_spec.h_fov.max,
    h_fov_tele: cameraModel.lens_spec.h_fov.min,
    v_fov_wide: cameraModel.lens_spec.v_fov.max,
    v_fov_tele: cameraModel.lens_spec.v_fov.min,
    focal_length_chosen: cameraModel.lens_spec.focal_length.min,
  }

  const result = computeFovCartesian(params)
  const corners = computeFovGeoCorners(
    result,
    camera.location.latitude,
    camera.location.longitude,
    form.bearing,
  )

  return {
    result,
    coverage_area: corners
      ? {
          points: corners.map((corner) => ({
            latitude: corner.lat,
            longitude: corner.lng,
          })),
        }
      : null,
  }
}

export function useCameraPanel(projectId: string) {
  void projectId
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

  const { data: allCameraModels } = useAllCameraSpecs()
  const cameraModel = allCameraModels?.find((cm) => cm.id === camera?.camera_spec_id) ?? null

  const [form, setForm] = useState<FormValues | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const fovMetrics = useMemo<FovCartesian | null>(() => {
    if (!form || !cameraModel || form.target_distance === '' || form.target_distance <= 0) return null
    const params: fov_input_params = {
      camera_height: form.height,
      target_distance: form.target_distance,
      target_height: form.target_height,
      focal_length_min: cameraModel.lens_spec.focal_length.min,
      focal_length_max: cameraModel.lens_spec.focal_length.max,
      h_fov_wide: cameraModel.lens_spec.h_fov.max,
      h_fov_tele: cameraModel.lens_spec.h_fov.min,
      v_fov_wide: cameraModel.lens_spec.v_fov.max,
      v_fov_tele: cameraModel.lens_spec.v_fov.min,
      focal_length_chosen: cameraModel.lens_spec.focal_length.min,
    }
    return computeFovCartesian(params)
  }, [form, cameraModel])

  useEffect(() => {
    if (!camera) { setForm(null); return }
    setForm({
      label: camera.label,
      color: camera.color,
      height: camera.height,
      bearing: camera.bearing,
      target_distance: camera.target_data.distance,
      target_height: camera.target_data.height,
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

    const patch: Partial<CameraPlacement> = {}

    if (key === 'target_distance' || key === 'target_height') {
      patch.target_data = {
        ...camera.target_data,
        distance: next.target_distance === '' ? camera.target_data.distance : next.target_distance,
        height: next.target_height,
      }
    } else {
      Object.assign(patch, { [key]: value })
    }

    const fovFields: (keyof FormValues)[] = ['height', 'target_distance', 'target_height', 'bearing']
    if (fovFields.includes(key)) {
      const fovResult = recomputeCoverageArea(next, camera, cameraModel)
      if (fovResult) {
        patch.coverage_area = fovResult.coverage_area
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
    fovMetrics,
    confirmDelete,
    setConfirmDelete,
    setField,
    handleDelete,
    parseNullableNumber,
  }
}
