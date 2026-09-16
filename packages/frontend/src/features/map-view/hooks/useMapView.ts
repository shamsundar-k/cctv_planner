import { useEffect } from 'react'
import { useParams } from 'react-router'
import { useProject } from '@/hooks/useProjects'
import { useMapDrawingStore } from '@/features/map-drawing'
import { useCameraStore } from '../../../store/cameraStore'

export function useMapView() {
  const { id = '' } = useParams<{ id: string }>()
  const loadCameras = useCameraStore((s) => s.loadCameras)
  const loadDrawings = useMapDrawingStore((state) => state.loadDrawings)

  useEffect(() => {
    if (!id) return
    void loadCameras(id)
    void loadDrawings(id)
  }, [id, loadCameras, loadDrawings])

  const { data: project, isLoading, isError } = useProject(id)

  const centerLat = project?.center_lat ?? 51.5
  const centerLng = project?.center_lng ?? -0.09
  const defaultZoom = project?.default_zoom ?? 13

  return {
    id,
    project,
    isLoading,
    isError,
    center: [centerLat, centerLng] as [number, number],
    defaultZoom,
  }
}
