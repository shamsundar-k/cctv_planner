import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useCameraSpec, useUpdateCameraSpec } from '@/hooks/useCameraSpecs'
import { useToast } from '../../../components/ui/Toast'
import { toCameraSpecPayload } from '../components/CameraForm/cameraFormHelpers'
import { useCameraFormState } from './useCameraFormState'

export function useAdminCameraEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const showToast = useToast()

  const { data: existing, isLoading } = useCameraSpec(id!)
  const updateCamera = useUpdateCameraSpec()
  const formState = useCameraFormState()

  useEffect(() => {
    if (existing) formState.initFrom(existing)
  }, [existing])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formState.validate()) return

    const payload = toCameraSpecPayload(formState.form)

    try {
      await updateCamera.mutateAsync({ id: id!, body: payload })
      showToast('Camera specification updated', 'success')
      navigate('/admin/manage/camera_specs')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Failed to update camera specification'
      showToast(typeof msg === 'string' ? msg : 'Failed to update camera specification', 'error')
    }
  }

  return { ...formState, isLoading, handleSubmit, isPending: updateCamera.isPending }
}
