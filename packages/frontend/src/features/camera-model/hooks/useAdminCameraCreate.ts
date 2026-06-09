import { useNavigate } from 'react-router'
import { useCreateCameraSpec } from '@/hooks/useCameraSpecs'
import { useToast } from '@/components/ui/Toast'
import { toCameraSpecPayload } from '../components/CameraForm/cameraFormHelpers'
import { useCameraFormState } from './useCameraFormState'

export function useAdminCameraCreate() {
  const navigate = useNavigate()
  const showToast = useToast()
  const createCamera = useCreateCameraSpec()
  const formState = useCameraFormState()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formState.validate()) return

    const payload = toCameraSpecPayload(formState.form)

    try {
      await createCamera.mutateAsync(payload)
      showToast('Camera specification created', 'success')
      navigate('/admin/manage/camera_specs')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Failed to create camera specification'
      showToast(typeof msg === 'string' ? msg : 'Failed to create camera specification', 'error')
    }
  }

  return { ...formState, handleSubmit, isPending: createCamera.isPending }
}
