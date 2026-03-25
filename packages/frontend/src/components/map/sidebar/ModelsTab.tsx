import { Link } from 'react-router'
import { useImportedCameras } from '../../../api/projects'
import { useMapViewStore } from '../../../store/mapViewSlice'
import { useCameraLayerStore } from '../../../store/cameraLayerSlice'
import type { ModelsTabProps } from './types'

const CAMERA_TYPE_LABELS: Record<string, string> = {
  fixed_dome: 'Dome',
  ptz: 'PTZ',
  bullet: 'Bullet',
}

export default function ModelsTab({ projectId }: ModelsTabProps) {
  const { data: importedItems, isLoading } = useImportedCameras(projectId)
  const { selectedModelId, setSelectedModel } = useCameraLayerStore()
  const activeTool = useMapViewStore((s) => s.activeTool)
  const isPlacing = activeTool === 'place-camera'

  if (isLoading) {
    return (
      <div className="flex flex-col gap-1.5 pt-1">
        {[1, 2].map((i) => (
          <div key={i} className="h-10 rounded bg-slate-700/50 animate-pulse" />
        ))}
      </div>
    )
  }

  if (!importedItems || importedItems.length === 0) {
    return (
      <div className="pt-2 px-1">
        <p className="text-xs text-slate-500 italic leading-relaxed mb-2">
          No camera models imported for this project.
        </p>
        <Link
          to={`/project/manage/${projectId}`}
          className="text-xs text-blue-400 hover:text-blue-300 underline"
        >
          Manage imported cameras →
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {isPlacing && (
        <div className="rounded-md bg-blue-900/40 border border-blue-700/50 px-2.5 py-2 text-xs text-blue-300 leading-snug">
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
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded border-none cursor-pointer text-left transition-colors ${
                  isSelected
                    ? 'bg-blue-600/30 text-slate-100'
                    : 'bg-transparent text-slate-300 hover:bg-slate-700/50 hover:text-slate-100'
                }`}
              >
                {/* Armed indicator */}
                <span className={`shrink-0 w-3.5 h-3.5 rounded-full border-2 transition-colors ${
                  isSelected ? 'border-blue-400 bg-blue-500' : 'border-slate-600'
                }`} />
                <span className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-xs font-medium truncate leading-tight">
                    {camera_model.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 truncate leading-tight">
                      {camera_model.manufacturer}
                    </span>
                    <span className="text-[10px] px-1 py-px rounded bg-slate-700 text-slate-400 shrink-0">
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
