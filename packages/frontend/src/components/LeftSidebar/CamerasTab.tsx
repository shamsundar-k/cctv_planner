import { useCameraInstances } from '../../api/cameraInstances'
import { useCameraLayerStore } from '../../store/cameraLayerSlice'
import EyeIcon from './EyeIcon'
import type { CamerasTabProps } from './types'

export default function CamerasTab({ projectId }: CamerasTabProps) {
  const { data: cameras, isLoading } = useCameraInstances(projectId)
  const { selectedCameraId, hiddenCameraIds, selectCamera, toggleCameraVisibility } = useCameraLayerStore()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-1.5 pt-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 rounded bg-slate-700/50 animate-pulse" />
        ))}
      </div>
    )
  }

  if (!cameras || cameras.length === 0) {
    return (
      <p className="text-xs text-slate-500 italic px-1 pt-2 leading-relaxed">
        No cameras placed yet. Use the toolbar to place a camera.
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-0.5">
      {cameras.map((cam) => {
        const isSelected = cam.id === selectedCameraId
        const isVisible = !hiddenCameraIds.includes(cam.id)
        const displayLabel = cam.label || 'Untitled Camera'

        return (
          <li key={cam.id}>
            <div
              className={`flex items-center gap-2 h-8 px-1 rounded cursor-pointer group transition-colors ${isSelected
                ? 'bg-blue-600/30 text-slate-100'
                : 'text-slate-300 hover:bg-slate-700/50 hover:text-slate-100'
                }`}
              onClick={() => selectCamera(isSelected ? null : cam.id)}
            >
              {/* Colour dot */}
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: cam.colour }}
              />

              {/* Label */}
              <span className="flex-1 text-xs truncate select-none">{displayLabel}</span>

              {/* Visibility toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleCameraVisibility(cam.id)
                }}
                title={isVisible ? 'Hide camera' : 'Show camera'}
                className={`shrink-0 p-0.5 rounded border-none bg-transparent cursor-pointer transition-colors ${isVisible
                  ? 'text-slate-500 hover:text-slate-100 opacity-0 group-hover:opacity-100'
                  : 'text-slate-400 opacity-100'
                  }`}
              >

              </button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
