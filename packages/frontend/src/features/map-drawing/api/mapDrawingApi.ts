import client from '@/api/client'
import type {
  MapDrawingCreate,
  MapDrawingResponse,
  MapDrawingUpdate,
} from '../types'

function drawingsPath(projectId: string): string {
  return `/projects/${encodeURIComponent(projectId)}/drawings`
}

export async function listMapDrawings(
  projectId: string,
): Promise<MapDrawingResponse[]> {
  const response = await client.get<MapDrawingResponse[]>(drawingsPath(projectId))
  return response.data
}

export async function createMapDrawing(
  projectId: string,
  drawing: MapDrawingCreate,
): Promise<MapDrawingResponse> {
  const response = await client.post<MapDrawingResponse>(drawingsPath(projectId), drawing)
  return response.data
}

export async function updateMapDrawing(
  projectId: string,
  uid: string,
  update: MapDrawingUpdate,
): Promise<MapDrawingResponse> {
  const response = await client.patch<MapDrawingResponse>(
    `${drawingsPath(projectId)}/${encodeURIComponent(uid)}`,
    update,
  )
  return response.data
}

export async function deleteMapDrawing(projectId: string, uid: string): Promise<void> {
  await client.delete(`${drawingsPath(projectId)}/${encodeURIComponent(uid)}`)
}
