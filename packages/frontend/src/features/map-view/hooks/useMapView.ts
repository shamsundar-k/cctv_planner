import { useEffect } from 'react'
import { useParams } from 'react-router'
import { useProject } from '../../../api/projects'
import { useCameraInstanceStore } from '../../../store/cameraInstanceStore'

export function useMapView() {
  const { id = '' } = useParams<{ id: string }>()
  const loadCameras = useCameraInstanceStore((s) => s.loadCameras)

  useEffect(() => {
    if (id) loadCameras(id)
  }, [id, loadCameras])

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
