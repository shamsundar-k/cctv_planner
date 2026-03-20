import { useState } from 'react'
import type { CameraModel } from '../../../api/cameras'
import { useAdminCameras } from '../../../api/cameras'
import {
  useImportedCameras,
  useAddCameraToProject,
  useRemoveCameraFromProject,
} from '../../../api/projects'
import { useToast } from '../../ui/Toast'
import type { AxiosError } from 'axios'

interface ImportedCamerasTabProps {
  projectId: string
}

type RightPaneMode = { kind: 'idle' } | { kind: 'detail'; model: CameraModel } | { kind: 'import' }

function CameraDetail({ model }: { model: CameraModel }) {
  const rows: [string, string][] = [
    ['Manufacturer', model.manufacturer || '—'],
    ['Model number', model.model_number || '—'],
    ['Type', { fixed_dome: 'Fixed Dome', ptz: 'PTZ', bullet: 'Bullet' }[model.camera_type] ?? model.camera_type],
    ['Lens', { fixed: 'Fixed', varifocal: 'Varifocal' }[model.lens_type] ?? model.lens_type],
    ['Resolution', `${model.resolution_h}×${model.resolution_v} (${model.megapixels}MP)`],
    ['H-FOV', model.h_fov_min === model.h_fov_max ? `${model.h_fov_min}°` : `${model.h_fov_min}°–${model.h_fov_max}°`],
    ['V-FOV', model.v_fov_min === model.v_fov_max ? `${model.v_fov_min}°` : `${model.v_fov_min}°–${model.v_fov_max}°`],
    ['Focal length', model.focal_length_min === model.focal_length_max ? `${model.focal_length_min} mm` : `${model.focal_length_min}–${model.focal_length_max} mm`],
    ['IR range', model.ir_range > 0 ? `${model.ir_range} m` : 'None'],
    ['Min illumination', `${model.min_illumination} lux`],
    ['WDR', model.wdr ? (model.wdr_db ? `Yes (${model.wdr_db} dB)` : 'Yes') : 'No'],
    ['Sensor type', model.sensor_type.toUpperCase()],
    ['Sensor size', model.sensor_size || '—'],
    ['Location', model.location || '—'],
  ]

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto h-full">
      <div>
        <h3 className="text-base font-semibold text-slate-100 m-0">{model.name}</h3>
        <p className="text-xs text-slate-500 mt-0.5 m-0">{[model.manufacturer, model.model_number].filter(Boolean).join(' · ') || '—'}</p>
      </div>
      <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
        {rows.map(([label, value]) => (
          <>
            <span key={`l-${label}`} className="text-slate-500 whitespace-nowrap">{label}</span>
            <span key={`v-${label}`} className="text-slate-300">{value}</span>
          </>
        ))}
      </div>
      {model.notes && (
        <p className="text-xs text-slate-500 italic m-0">{model.notes}</p>
      )}
    </div>
  )
}

function ImportGrid({
  projectId,
  importedIds,
  onImported,
}: {
  projectId: string
  importedIds: Set<string>
  onImported: () => void
}) {
  const showToast = useToast()
  const { data: allCameras = [], isLoading } = useAdminCameras()
  const addCamera = useAddCameraToProject()
  const [search, setSearch] = useState('')

  const filtered = allCameras.filter((c) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return c.name.toLowerCase().includes(q) || c.manufacturer.toLowerCase().includes(q)
  })

  async function handleAdd(model: CameraModel) {
    if (importedIds.has(model.id)) return
    try {
      await addCamera.mutateAsync({ projectId, modelId: model.id })
      showToast(`"${model.name}" imported`, 'success')
      onImported()
    } catch (err) {
      const axiosErr = err as AxiosError<{ detail: string }>
      if (axiosErr.response?.status === 409) {
        showToast(`"${model.name}" is already imported`, 'info')
      } else {
        showToast('Failed to import camera model', 'error')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-slate-700/50 rounded-lg border border-slate-700 p-4 animate-pulse h-28" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 p-4 overflow-y-auto h-full">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or manufacturer…"
        className="h-9 px-3 text-sm rounded-md bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
      />
      {filtered.length === 0 ? (
        <div className="text-center py-10 text-slate-600 text-sm">
          {search ? 'No models match your search.' : 'No camera models available.'}
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
          {filtered.map((camera) => {
            const already = importedIds.has(camera.id)
            return (
              <div
                key={camera.id}
                className="bg-slate-700/50 border border-slate-700 rounded-lg p-3.5 flex flex-col gap-2 hover:border-slate-600 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-100 m-0 truncate">{camera.name}</p>
                  <p className="text-xs text-slate-500 m-0 mt-0.5 truncate">
                    {[camera.manufacturer, camera.model_number].filter(Boolean).join(' · ') || '—'}
                  </p>
                </div>
                <div className="text-xs text-slate-500">
                  {camera.resolution_h}×{camera.resolution_v} · {camera.h_fov_min === camera.h_fov_max ? `${camera.h_fov_min}°` : `${camera.h_fov_min}°–${camera.h_fov_max}°`} H-FOV
                </div>
                {already ? (
                  <div className="flex items-center gap-1.5 text-xs text-green-400 font-medium mt-auto">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Already imported
                  </div>
                ) : (
                  <button
                    onClick={() => handleAdd(camera)}
                    disabled={addCamera.isPending}
                    className="mt-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-md border-none cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                    Import
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function ImportedCamerasTab({ projectId }: ImportedCamerasTabProps) {
  const showToast = useToast()
  const { data: importedItems = [], isLoading } = useImportedCameras(projectId)
  const removeCamera = useRemoveCameraFromProject()

  const [rightPane, setRightPane] = useState<RightPaneMode>({ kind: 'idle' })

  const importedIds = new Set(importedItems.map((i) => i.camera_model.id))

  async function handleRemove(modelId: string, modelName: string, placedCount: number) {
    if (placedCount > 0) return
    try {
      await removeCamera.mutateAsync({ projectId, modelId })
      showToast(`"${modelName}" removed`, 'success')
      setRightPane((prev) => {
        if (prev.kind === 'detail' && prev.model.id === modelId) return { kind: 'idle' }
        return prev
      })
    } catch {
      showToast('Failed to remove camera model', 'error')
    }
  }

  return (
    <div className="flex gap-0 h-[calc(100vh-280px)] min-h-[400px] border border-slate-700 rounded-lg overflow-hidden">
      {/* Left pane */}
      <div className="w-72 shrink-0 border-r border-slate-700 flex flex-col bg-slate-800/50">
        <div className="p-3 border-b border-slate-700">
          <button
            onClick={() => setRightPane({ kind: 'import' })}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg border-none cursor-pointer transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            Import Cameras
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col gap-1 p-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-10 bg-slate-700/50 rounded animate-pulse" />
              ))}
            </div>
          ) : importedItems.length === 0 ? (
            <p className="text-xs text-slate-600 text-center py-8 px-4">
              No cameras imported yet. Click "Import Cameras" to add models.
            </p>
          ) : (
            <ul className="list-none m-0 p-0">
              {importedItems.map(({ camera_model: cm, placed_count }) => {
                const isSelected = rightPane.kind === 'detail' && rightPane.model.id === cm.id
                return (
                  <li
                    key={cm.id}
                    onClick={() => setRightPane({ kind: 'detail', model: cm })}
                    className={`flex items-center justify-between gap-2 px-3 py-2.5 cursor-pointer transition-colors border-b border-slate-700/50 last:border-b-0 ${
                      isSelected ? 'bg-slate-700' : 'hover:bg-slate-700/50'
                    }`}
                  >
                    <span className="text-sm text-slate-200 truncate flex-1">{cm.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemove(cm.id, cm.name, placed_count)
                      }}
                      disabled={placed_count > 0 || removeCamera.isPending}
                      title={placed_count > 0 ? `Cannot remove — ${placed_count} instance(s) placed` : 'Remove'}
                      className="shrink-0 w-6 h-6 flex items-center justify-center rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors border-none bg-transparent cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-slate-500 disabled:hover:bg-transparent"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Right pane */}
      <div className="flex-1 overflow-hidden">
        {rightPane.kind === 'idle' && (
          <div className="flex items-center justify-center h-full text-slate-600 text-sm">
            Select a camera from the list, or click "Import Cameras" to add new ones.
          </div>
        )}
        {rightPane.kind === 'detail' && (
          <CameraDetail model={rightPane.model} />
        )}
        {rightPane.kind === 'import' && (
          <ImportGrid
            projectId={projectId}
            importedIds={importedIds}
            onImported={() => {/* list auto-refreshes via query invalidation */}}
          />
        )}
      </div>
    </div>
  )
}
