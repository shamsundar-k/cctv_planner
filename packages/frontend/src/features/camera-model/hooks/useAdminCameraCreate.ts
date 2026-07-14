import { useNavigate } from 'react-router'
import { useCreateCameraSpec } from '@/hooks/useCameraSpecs'
import { useToast } from '@/components/ui/Toast'
import { toCameraSpecPayload } from '../components/CameraForm/cameraFormHelpers'
import { useCameraFormState } from './useCameraFormState'
import { useCameraImageInput } from './useCameraImageInput'
import { useReplaceCameraSpecImage } from './useCameraSpecImageMutations'
import { createCameraSpecId } from '../utils/cameraSpecId'

function apiErrorMessage(error: unknown, fallback: string): string {
  const detail = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail
  return typeof detail === 'string' ? detail : fallback
}

export function useAdminCameraCreate() {
  const navigate = useNavigate()
  const showToast = useToast()
  const createCamera = useCreateCameraSpec()
  const replaceImage = useReplaceCameraSpecImage()
  const formState = useCameraFormState()
  const image = useCameraImageInput()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formState.validate()) return

    const payload = toCameraSpecPayload(formState.form)

    try {
      const created = await createCamera.mutateAsync({ id: createCameraSpecId(), ...payload })
      if (image.file) {
        try {
          await replaceImage.mutateAsync({ id: created.id, image: image.file })
        } catch (error: unknown) {
          showToast(
            apiErrorMessage(error, 'Camera specification was created, but its image could not be uploaded'),
            'error',
          )
          navigate(`/admin/manage/camera_specs/${created.id}`)
          return
        }
      }

      showToast('Camera specification created', 'success')
      navigate('/admin/manage/camera_specs')
    } catch (error: unknown) {
      showToast(apiErrorMessage(error, 'Failed to create camera specification'), 'error')
    }
  }

  return {
    ...formState,
    image,
    handleSubmit,
    isPending: createCamera.isPending || replaceImage.isPending,
  }
}
