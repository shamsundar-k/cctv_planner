import client from '../../api/client'
import type { CameraSpecCreate, CameraSpecRecord, CameraSpecUpdate } from '../../types/camera'

export async function fetchAllCameraSpecs(): Promise<CameraSpecRecord[]> {
  const res = await client.get<CameraSpecRecord[]>('/camera-specs')
  return res.data
}

export async function fetchCameraSpec(id: string): Promise<CameraSpecRecord> {
  const res = await client.get<CameraSpecRecord>(`/camera-specs/${id}`)
  return res.data
}

export async function createCameraSpec(body: CameraSpecCreate): Promise<CameraSpecRecord> {
  const res = await client.post<CameraSpecRecord>('/camera-specs', body)
  return res.data
}

export async function updateCameraSpec(id: string, body: CameraSpecUpdate): Promise<CameraSpecRecord> {
  const res = await client.put<CameraSpecRecord>(`/camera-specs/${id}`, body)
  return res.data
}

export async function deleteCameraSpec(id: string): Promise<void> {
  await client.delete(`/camera-specs/${id}`)
}
