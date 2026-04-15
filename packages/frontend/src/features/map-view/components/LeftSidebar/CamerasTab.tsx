import { useCameraInstances } from '../../../../api/cameraInstances'
import { useCameraLayerStore } from '../../../../store/cameraLayerSlice'

interface CamerasTabProps {
  projectId: string
}

export default function CamerasTab({ projectId }: CamerasTabProps) {
  const { data: cameras, isLoading } = useCameraInstances(projectId)
  const { selectedCameraId, hiddenCameraIds, selectCamera, toggleCameraVisibility } = useCameraLayerStore()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-1.5 pt-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-8 rounded animate-pulse"
            style={{ background: 'color-mix(in srgb, var(--theme-surface) 20%, transparent)' }}
          />
        ))}
      </div>
    )
  }

  if (!cameras || cameras.length === 0) {
    return (
      <p className="text-xs italic px-1 pt-2 leading-relaxed" style={{ color: 'color-mix(in srgb, var(--theme-text-secondary) 60%, transparent)' }}>
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
              className="flex items-center gap-2 h-8 px-1 rounded cursor-pointer group transition-colors"
              style={{
                background: isSelected ? 'color-mix(in srgb, var(--theme-accent) 20%, transparent)' : 'transparent',
                color: isSelected ? 'var(--theme-text-primary)' : 'color-mix(in srgb, var(--theme-text-primary) 70%, transparent)',
              }}
              onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.background = 'color-mix(in srgb, var(--theme-surface) 15%, transparent)'; e.currentTarget.style.color = 'var(--theme-text-primary)' } }}
              onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'color-mix(in srgb, var(--theme-text-primary) 70%, transparent)' } }}
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
                  ? 'opacity-0 group-hover:opacity-100'
                  : 'opacity-100'
                }`}
                style={{ color: isVisible ? 'color-mix(in srgb, var(--theme-text-secondary) 60%, transparent)' : 'var(--theme-text-secondary)' }}
              >

              </button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
