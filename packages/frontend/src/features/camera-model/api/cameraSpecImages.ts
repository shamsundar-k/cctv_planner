import client from '@/api/client'
import type { CameraSpecRecord } from '@/types/camera'

export function cameraSpecImageUrl(cameraSpecId: string, imageVersion = 0): string {
  const baseUrl = (client.defaults.baseURL ?? '/api/v1').replace(/\/$/, '')
  return `${baseUrl}/camera-specs/${encodeURIComponent(cameraSpecId)}/image?v=${imageVersion}`
}

export async function replaceCameraSpecImage(
  cameraSpecId: string,
  image: File,
): Promise<CameraSpecRecord> {
  const formData = new FormData()
  formData.append('image', image)

  const response = await client.put<CameraSpecRecord>(
    `/camera-specs/${encodeURIComponent(cameraSpecId)}/image`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return response.data
}

export async function removeCameraSpecImage(cameraSpecId: string): Promise<CameraSpecRecord> {
  const response = await client.delete<CameraSpecRecord>(
    `/camera-specs/${encodeURIComponent(cameraSpecId)}/image`,
  )
  return response.data
}
