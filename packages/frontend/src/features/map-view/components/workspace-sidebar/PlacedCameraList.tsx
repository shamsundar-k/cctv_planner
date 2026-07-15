import { Camera, Eye, EyeOff } from 'lucide-react'
import { useCameraLayerStore } from '@/store/cameraLayerSlice'
import { useCameraStore } from '@/store/cameraStore'

export default function PlacedCameraList() {
  const uids = useCameraStore((state) => state.uids)
  const cameraRecords = useCameraStore((state) => state.cameraRecords)
  const isLoading = useCameraStore((state) => state.isLoading)
  const selectedCameraId = useCameraLayerStore((state) => state.selectedCameraId)
  const hiddenCameraIds = useCameraLayerStore((state) => state.hiddenCameraIds)
  const selectCamera = useCameraLayerStore((state) => state.selectCamera)
  const toggleCameraVisibility = useCameraLayerStore((state) => state.toggleCameraVisibility)
  const cameras = uids.map((id) => cameraRecords[id]?.camera).filter(Boolean)

  if (isLoading) {
    return (
      <div className="grid gap-2 p-4" aria-label="Loading placed cameras">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-11 animate-pulse rounded-lg border border-panel-border bg-background" />
        ))}
      </div>
    )
  }

  if (cameras.length === 0) {
    return (
      <div className="grid min-h-56 place-items-center px-6 text-center">
        <div>
          <Camera size={28} className="mx-auto text-text-muted" aria-hidden />
          <p className="mt-3 text-sm font-semibold text-text-primary">No cameras placed</p>
          <p className="mt-1 text-xs leading-5 text-text-muted">Select a model from the catalog, then use Place Camera on the map.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-3">
      <p className="mb-2 px-1 text-xs font-medium text-text-muted">
        {cameras.length} {cameras.length === 1 ? 'camera' : 'cameras'}
      </p>
      <ul className="grid gap-1">
        {cameras.map((camera) => {
          const isSelected = camera.uid === selectedCameraId
          const isVisible = !hiddenCameraIds.includes(camera.uid)
          return (
            <li key={camera.uid}>
              <div
                className={`flex min-h-11 items-center gap-2 rounded-lg border px-2 transition-colors ${
                  isSelected
                    ? 'border-primary/50 bg-primary/10 text-text-primary'
                    : 'border-transparent text-text-secondary hover:border-panel-border hover:bg-background hover:text-text-primary'
                }`}
              >
                <button
                  type="button"
                  onClick={() => selectCamera(isSelected ? null : camera.uid)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  aria-pressed={isSelected}
                >
                  <span className="size-2.5 shrink-0 rounded-full ring-1 ring-panel-border" style={{ backgroundColor: camera.color }} />
                  <span className="truncate text-xs font-semibold">{camera.label || 'Untitled Camera'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleCameraVisibility(camera.uid)}
                  className="grid size-8 shrink-0 place-items-center rounded-md border border-transparent text-text-muted transition-colors hover:border-panel-border hover:bg-panel hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  aria-label={`${isVisible ? 'Hide' : 'Show'} ${camera.label || 'camera'}`}
                  aria-pressed={!isVisible}
                >
                  {isVisible ? <Eye size={16} aria-hidden /> : <EyeOff size={16} aria-hidden />}
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
