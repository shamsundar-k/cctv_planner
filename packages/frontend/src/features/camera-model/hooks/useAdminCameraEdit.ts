import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useCameraSpec, useUpdateCameraSpec } from '@/hooks/useCameraSpecs'
import { useToast } from '@/components/ui/Toast'
import { toCameraSpecPayload } from '../components/CameraForm/cameraFormHelpers'
import { useCameraFormState } from './useCameraFormState'
import { useCameraImageInput } from './useCameraImageInput'
import {
  useRemoveCameraSpecImage,
  useReplaceCameraSpecImage,
} from './useCameraSpecImageMutations'

function apiErrorMessage(error: unknown, fallback: string): string {
  const detail = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail
  return typeof detail === 'string' ? detail : fallback
}

export function useAdminCameraEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const showToast = useToast()

  const { data: existing, isLoading } = useCameraSpec(id!)
  const updateCamera = useUpdateCameraSpec()
  const replaceImage = useReplaceCameraSpecImage()
  const removeImage = useRemoveCameraSpecImage()
  const formState = useCameraFormState()
  const { initFrom } = formState
  const image = useCameraImageInput()

  useEffect(() => {
    if (existing) initFrom(existing)
  }, [existing, initFrom])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formState.validate()) return

    const payload = toCameraSpecPayload(formState.form)

    try {
      await updateCamera.mutateAsync({ id: id!, body: payload })

      try {
        if (image.file) {
          await replaceImage.mutateAsync({ id: id!, image: image.file })
        } else if (image.removeRequested) {
          await removeImage.mutateAsync(id!)
        }
      } catch (error: unknown) {
        showToast(
          apiErrorMessage(error, 'Camera specification was updated, but its image change failed'),
          'error',
        )
        return
      }

      showToast('Camera specification updated', 'success')
      navigate('/admin/manage/camera_specs')
    } catch (error: unknown) {
      showToast(apiErrorMessage(error, 'Failed to update camera specification'), 'error')
    }
  }

  return {
    ...formState,
    camera: existing,
    image,
    isLoading,
    handleSubmit,
    isPending: updateCamera.isPending || replaceImage.isPending || removeImage.isPending,
  }
}
