/*
 * FILE SUMMARY — src/components/project/manage/ImportedCamerasTab.tsx
 *
 * "Imported Cameras" tab in the Project Settings page. Dual-pane interface
 * for managing which camera models are associated with a project.
 *
 * ImportedCamerasTab({ projectId }) — Renders two sections:
 *   1. "Project Cameras" — lists camera models already imported into this
 *      project, each showing name, manufacturer, type badge, resolution/FOV
 *      specs, placed count, an info button, and a remove button (disabled when
 *      placed_count > 0 because placed cameras cannot be removed).
 *   2. "Browse Camera Models" — shows the global catalogue with a search
 *      input. Each model card has an info button and an "Add to Project" /
 *      "Added" indicator. Only models not yet imported show the add button.
 *
 * handleAdd(model) — Calls useAddCameraToProject. Shows success, info (409
 *   already-added), or error toast.
 *
 * handleRemove(modelId, modelName, placedCount) — Guards against removing a
 *   model that has placed instances. Calls useRemoveCameraFromProject. Shows
 *   success or error toast. Clears the detail modal if the removed model was
 *   open.
 *
 * CameraDetailModal({ model, onClose }) — Internal modal displaying all
 *   camera specs (manufacturer, resolution, FOV range, IR, WDR, sensor, etc.)
 *   in a two-column label/value grid.
 *
 * TypeBadge({ type }) — Internal badge component mapping camera type strings
 *   to colour-coded pill labels (Fixed Dome / PTZ / Bullet).
 *
 * hfovLabel(min, max) — Internal helper; returns "X°" for fixed FOV or
 *   "X°–Y°" range for varifocal.
 *
 * InfoIcon / TrashIcon / PlusIcon / CheckIcon — Minimal SVG icon components
 *   used within card action buttons.
 */
import { useState } from 'react'
import type { CameraModel } from '../../../api/cameras'
import { useAllCameras } from '../../../api/cameras'
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

// ── helpers ──────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  fixed_dome: 'Fixed Dome',
  ptz: 'PTZ',
  bullet: 'Bullet',
}

const TYPE_COLORS: Record<string, string> = {
  fixed_dome: 'bg-slate-700 text-slate-300',
  ptz: 'bg-purple-900/60 text-purple-300',
  bullet: 'bg-amber-900/60 text-amber-300',
}

function TypeBadge({ type }: { type: string }) {
  const label = TYPE_LABELS[type] ?? type
  const color = TYPE_COLORS[type] ?? 'bg-slate-700 text-slate-300'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${color}`}>
      {label}
    </span>
  )
}

function hfovLabel(min: number, max: number) {
  return min === max ? `${min}°` : `${min}°–${max}°`
}

// ── Camera Detail Modal ───────────────────────────────────────────────────────

function CameraDetailModal({ model, onClose }: { model: CameraModel; onClose: () => void }) {
  const rows: [string, string][] = [
    ['Manufacturer', model.manufacturer || '—'],
    ['Model number', model.model_number || '—'],
    ['Type', TYPE_LABELS[model.camera_type] ?? model.camera_type],
    ['Lens', { fixed: 'Fixed', varifocal: 'Varifocal' }[model.lens_type] ?? model.lens_type],
    ['Resolution', `${model.resolution_h}×${model.resolution_v} (${model.megapixels}MP)`],
    ['H-FOV', hfovLabel(model.h_fov_min, model.h_fov_max)],
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      tabIndex={-1}
    >
      <div
        className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-[480px] mx-4 flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-5 border-b border-slate-700">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-slate-100 m-0 leading-snug">{model.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5 m-0">
              {[model.manufacturer, model.model_number].filter(Boolean).join(' · ') || '—'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors border-none bg-transparent cursor-pointer"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-5 flex-1">
          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
            {rows.map(([label, value]) => (
              <>
                <span key={`l-${label}`} className="text-slate-500 whitespace-nowrap">{label}</span>
                <span key={`v-${label}`} className="text-slate-300">{value}</span>
              </>
            ))}
          </div>
          {model.notes && (
            <p className="text-xs text-slate-500 italic mt-4 m-0">{model.notes}</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg border-none cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Icon buttons ──────────────────────────────────────────────────────────────

function InfoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ImportedCamerasTab({ projectId }: ImportedCamerasTabProps) {
  const showToast = useToast()
  const { data: importedItems = [], isLoading: importedLoading } = useImportedCameras(projectId)
  const { data: allCameras = [], isLoading: allLoading } = useAllCameras()
  const addCamera = useAddCameraToProject()
  const removeCamera = useRemoveCameraFromProject()

  const [detailModel, setDetailModel] = useState<CameraModel | null>(null)
  const [search, setSearch] = useState('')

  const importedIds = new Set(importedItems.map((i) => i.camera_model.id))

  const filteredAll = allCameras.filter((c) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return c.name.toLowerCase().includes(q) || c.manufacturer.toLowerCase().includes(q)
  })

  async function handleAdd(model: CameraModel) {
    if (importedIds.has(model.id)) return
    try {
      await addCamera.mutateAsync({ projectId, modelId: model.id })
      showToast(`"${model.name}" added to project`, 'success')
    } catch (err) {
      const axiosErr = err as AxiosError<{ detail: string }>
      if (axiosErr.response?.status === 409) {
        showToast(`"${model.name}" is already in this project`, 'info')
      } else {
        showToast('Failed to add camera model', 'error')
      }
    }
  }

  async function handleRemove(modelId: string, modelName: string, placedCount: number) {
    if (placedCount > 0) return
    try {
      await removeCamera.mutateAsync({ projectId, modelId })
      showToast(`"${modelName}" removed from project`, 'success')
      if (detailModel?.id === modelId) setDetailModel(null)
    } catch {
      showToast('Failed to remove camera model', 'error')
    }
  }

  return (
    <>
      {detailModel && (
        <CameraDetailModal model={detailModel} onClose={() => setDetailModel(null)} />
      )}

      <div className="flex flex-col gap-6">

        {/* ── Section 1: Project Cameras ── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-semibold text-slate-200 m-0">Project Cameras</h2>
            <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-slate-700 text-slate-300 text-xs font-semibold">
              {importedItems.length}
            </span>
          </div>

          {importedLoading ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-slate-700/50 rounded-lg border border-slate-700 p-4 animate-pulse h-32" />
              ))}
            </div>
          ) : importedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-slate-600">
              <p className="text-sm m-0">No cameras imported yet</p>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-slate-700 mt-1">
                <path d="M12 5v14M19 12l-7 7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
              {importedItems.map(({ camera_model: cm, placed_count }) => (
                <div
                  key={cm.id}
                  className="bg-slate-800 border border-slate-700 rounded-lg p-3.5 flex flex-col gap-2 hover:border-slate-600 transition-colors"
                >
                  {/* Name + manufacturer */}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-100 m-0 truncate">{cm.name}</p>
                    <p className="text-xs text-slate-500 m-0 mt-0.5 truncate">
                      {[cm.manufacturer, cm.model_number].filter(Boolean).join(' · ') || '—'}
                    </p>
                  </div>

                  {/* Type badge */}
                  <TypeBadge type={cm.camera_type} />

                  {/* Specs line */}
                  <p className="text-xs text-slate-500 m-0">
                    {cm.resolution_h}×{cm.resolution_v} · {hfovLabel(cm.h_fov_min, cm.h_fov_max)} H-FOV
                  </p>

                  {/* Bottom row: placed badge + action buttons */}
                  <div className="flex items-center justify-between mt-auto pt-1">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${placed_count > 0 ? 'bg-blue-900/60 text-blue-300' : 'bg-slate-700 text-slate-500'}`}>
                      {placed_count} placed
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setDetailModel(cm)}
                        title="View details"
                        className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors border-none bg-transparent cursor-pointer"
                      >
                        <InfoIcon />
                      </button>
                      <button
                        onClick={() => handleRemove(cm.id, cm.name, placed_count)}
                        disabled={placed_count > 0 || removeCamera.isPending}
                        title={placed_count > 0 ? `Cannot remove — ${placed_count} instance(s) placed on map` : 'Remove from project'}
                        className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors border-none bg-transparent cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-slate-400 disabled:hover:bg-transparent"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Section 2: Browse & Add Camera Models ── */}
        <section>
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="text-sm font-semibold text-slate-200 m-0">Browse Camera Models</h2>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or manufacturer…"
              className="h-8 px-3 text-xs rounded-md bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500 transition-colors w-56"
            />
          </div>

          {allLoading ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-slate-700/50 rounded-lg border border-slate-700 p-4 animate-pulse h-32" />
              ))}
            </div>
          ) : filteredAll.length === 0 ? (
            <div className="text-center py-10 text-slate-600 text-sm">
              {search ? 'No models match your search.' : 'No camera models available.'}
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
              {filteredAll.map((camera) => {
                const already = importedIds.has(camera.id)
                return (
                  <div
                    key={camera.id}
                    className="bg-slate-800 border border-slate-700 rounded-lg p-3.5 flex flex-col gap-2 hover:border-slate-600 transition-colors"
                  >
                    {/* Name + manufacturer */}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-100 m-0 truncate">{camera.name}</p>
                      <p className="text-xs text-slate-500 m-0 mt-0.5 truncate">
                        {[camera.manufacturer, camera.model_number].filter(Boolean).join(' · ') || '—'}
                      </p>
                    </div>

                    {/* Type badge */}
                    <TypeBadge type={camera.camera_type} />

                    {/* Specs line */}
                    <p className="text-xs text-slate-500 m-0">
                      {camera.resolution_h}×{camera.resolution_v} · {hfovLabel(camera.h_fov_min, camera.h_fov_max)} H-FOV
                    </p>

                    {/* Bottom row: info + add/added */}
                    <div className="flex items-center justify-between mt-auto pt-1">
                      <button
                        onClick={() => setDetailModel(camera)}
                        title="View details"
                        className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors border-none bg-transparent cursor-pointer"
                      >
                        <InfoIcon />
                      </button>

                      {already ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-400 px-2 py-1 rounded-md bg-green-900/30">
                          <CheckIcon />
                          Added
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAdd(camera)}
                          disabled={addCamera.isPending}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-md border-none cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <PlusIcon />
                          Add to Project
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

      </div>
    </>
  )
}
