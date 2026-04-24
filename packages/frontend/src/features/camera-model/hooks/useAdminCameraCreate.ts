import { useNavigate } from 'react-router'
import { useCreateCameraModel } from '@/api/camerasModels'
import { useToast } from '@/components/ui/Toast'
import type { CameraModelCreate } from '@/types/cameramodel.types'
import { useCameraFormState } from './useCameraFormState'

export function useAdminCameraCreate() {
  const navigate = useNavigate()
  const showToast = useToast()
  const createCamera = useCreateCameraModel()
  const formState = useCameraFormState()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formState.validate()) return

    const payload: CameraModelCreate = {
      ...formState.form,
      notes: formState.form.notes || null,
      sensor_size: formState.form.sensor_size || null,
      wdr_db: formState.form.wdr ? formState.form.wdr_db : null,
    }

    try {
      await createCamera.mutateAsync(payload)
      showToast('Camera model created', 'success')
      navigate('/admin/manage/cameras')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Failed to create camera model'
      showToast(typeof msg === 'string' ? msg : 'Failed to create camera model', 'error')
    }
  }

  return { ...formState, handleSubmit, isPending: createCamera.isPending }
}
