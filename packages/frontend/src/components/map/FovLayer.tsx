/**
 * FovLayer (FovPolygonLayer) — orchestrates per-camera FOV polygons.
 *
 * Subscribes only to `cameraIds` from the Zustand store, so it re-renders
 * only when a camera is added or removed — never when a camera's properties
 * change.  Each <FovPolygon> manages its own polygon and subscribes to its
 * own slice of the store.
 */
import { useCameraInstanceStore } from '../../store/cameraInstanceStore'
import FovPolygon from './FovPolygon'

interface FovLayerProps {
  projectId: string
}

export default function FovLayer({ projectId }: FovLayerProps) {
  const cameraIds = useCameraInstanceStore((s) => s.cameraIds)

  return (
    <>
      {cameraIds.map((id) => (
        <FovPolygon key={id} cameraId={id} projectId={projectId} />
      ))}
    </>
  )
}
