import { Link } from 'react-router'
import { useImportedCameras } from '../../api/projects'
import { useMapViewStore } from '../../store/mapViewSlice'
import { useCameraLayerStore } from '../../store/cameraLayerSlice'
import type { ModelsTabProps } from './types'

const CAMERA_TYPE_LABELS: Record<string, string> = {
  fixed_dome: 'Dome',
  ptz: 'PTZ',
  bullet: 'Bullet',
}

export default function ModelsTab({ projectId }: ModelsTabProps) {
  const { data: importedItems, isLoading } = useImportedCameras(projectId)
  console.log("Camera models list", importedItems)
  const { selectedModelId, setSelectedModel } = useCameraLayerStore()
  const activeTool = useMapViewStore((s) => s.activeTool)
  const isPlacing = activeTool === 'place-camera'

  if (isLoading) {
    return (
      <div className="flex flex-col gap-1.5 pt-1">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-10 rounded animate-pulse"
            style={{ background: 'color-mix(in srgb, var(--theme-surface) 20%, transparent)' }}
          />
        ))}
      </div>
    )
  }

  if (!importedItems || importedItems.length === 0) {
    return (
      <div className="pt-2 px-1">
        <p className="text-xs italic leading-relaxed mb-2" style={{ color: 'color-mix(in srgb, var(--theme-text-secondary) 60%, transparent)' }}>
          No camera models imported for this project.
        </p>
        <Link
          to={`/project/manage/${projectId}`}
          className="text-xs underline transition-colors"
          style={{ color: 'var(--theme-accent)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--theme-accent-hover)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--theme-accent)')}
        >
          Manage imported cameras →
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {isPlacing && (
        <div
          className="rounded-md px-2.5 py-2 text-xs leading-snug"
          style={{ background: 'color-mix(in srgb, var(--theme-accent) 15%, transparent)', border: '1px solid color-mix(in srgb, var(--theme-accent) 30%, transparent)', color: 'var(--theme-text-primary)' }}
        >
          {selectedModelId
            ? 'Click on the map to place a camera'
            : 'Select a model below to start placing'}
        </div>
      )}
      <ul className="flex flex-col gap-0.5">
        {importedItems.map(({ camera_model }) => {
          const isSelected = camera_model.id === selectedModelId
          const typeLabel = CAMERA_TYPE_LABELS[camera_model.camera_type] ?? camera_model.camera_type

            return (
            <li key={camera_model.id}>
              <button
                onClick={() => setSelectedModel(isSelected ? null : camera_model.id)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded border-none cursor-pointer text-left transition-all"
                style={{
                  background: isSelected ? 'color-mix(in srgb, var(--theme-accent) 20%, transparent)' : 'transparent',
                  color: isSelected ? 'var(--theme-text-primary)' : 'color-mix(in srgb, var(--theme-text-primary) 70%, transparent)',
                }}
                onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.background = 'color-mix(in srgb, var(--theme-surface) 15%, transparent)'; e.currentTarget.style.color = 'var(--theme-text-primary)' } }}
                onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'color-mix(in srgb, var(--theme-text-primary) 70%, transparent)' } }}
              >
                {/* Armed indicator */}
                <span
                  className="shrink-0 w-3.5 h-3.5 rounded-full border-2 transition-colors"
                  style={{
                    borderColor: isSelected ? 'var(--theme-accent)' : 'color-mix(in srgb, var(--theme-surface) 50%, transparent)',
                    background: isSelected ? 'var(--theme-accent)' : 'transparent',
                  }}
                />
                <span className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-xs font-medium truncate leading-tight">
                    {camera_model.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] truncate leading-tight" style={{ color: 'var(--theme-text-secondary)' }}>
                      {camera_model.manufacturer}
                    </span>
                    <span
                      className="text-[10px] px-1 py-px rounded shrink-0"
                      style={{ background: 'color-mix(in srgb, var(--theme-surface) 25%, transparent)', color: 'var(--theme-text-secondary)' }}
                    >
                      {typeLabel}
                    </span>
                  </div>
                </span>
              </button>
            </li>
            )
        })}
      </ul>
    </div>
  )
}
