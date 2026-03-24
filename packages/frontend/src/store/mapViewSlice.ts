import { create } from 'zustand'
import type { CameraInstance } from '../api/cameraInstances.types'

export type BasemapStyle = 'alidade_smooth' | 'alidade_smooth_dark' | 'stamen_toner'
export type ActiveTool = 'pan' | 'select' | 'place-camera' | 'draw-polygon' | 'draw-line' | 'measure' | 'delete'

interface MapViewState {
  // Save / dirty state
  isDirty: boolean
  lastSavedAt: Date | null

  // Active tool
  activeTool: ActiveTool

  // Selection
  selectedCameraId: string | null
  selectedModelId: string | null

  // Layer visibility
  showFovPolygons: boolean
  showZonePolygons: boolean
  showCameraLabels: boolean

  // Basemap
  basemapStyle: BasemapStyle

  // Per-camera visibility overrides (set of hidden IDs)
  hiddenCameraIds: string[]

  // ── Camera working-copy store ─────────────────────────────────────────────
  // Populated by useSyncCameraInstancesToStore; used by CameraMarker / FovPolygon
  cameraIds: string[]
  cameraInstances: Record<string, CameraInstance>
  // IDs that have been edited locally but not yet saved to the server
  dirtyIds: Set<string>

  // Actions
  markDirty: () => void
  markSaved: () => void
  setActiveTool: (tool: ActiveTool) => void
  setLeafletMap: (map: LeafletMap | null) => void
  setSelectedCamera: (id: string | null) => void
  selectCameraAfterPlacement: (id: string) => void
  setSelectedModel: (id: string | null) => void
  setShowFovPolygons: (show: boolean) => void
  setShowZonePolygons: (show: boolean) => void
  setShowCameraLabels: (show: boolean) => void
  setBasemapStyle: (style: BasemapStyle) => void
  toggleCameraVisibility: (cameraId: string) => void

  // Camera store actions
  hydrateCameras: (cameras: CameraInstance[]) => void
  addCamera: (camera: CameraInstance) => void
  removeCamera: (id: string) => void
  updateCamera: (id: string, patch: Partial<CameraInstance>) => void
  clearDirty: (id: string) => void
}

// Leaflet Map type — imported lazily so we keep this file framework-agnostic
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LeafletMap = any

export const useMapViewStore = create<MapViewState>((set) => ({
  isDirty: false,
  lastSavedAt: null,

  activeTool: 'pan',

  leafletMap: null,

  selectedCameraId: null,
  selectedModelId: null,

  showFovPolygons: true,
  showZonePolygons: true,
  showCameraLabels: true,

  basemapStyle: 'alidade_smooth',

  hiddenCameraIds: [],

  // Camera working-copy store
  cameraIds: [],
  cameraInstances: {},
  dirtyIds: new Set<string>(),

  markDirty: () => set({ isDirty: true }),
  markSaved: () => set({ isDirty: false, lastSavedAt: new Date() }),

  setActiveTool: (tool) => set({ activeTool: tool }),
  setLeafletMap: (map) => set({ leafletMap: map }),

  setSelectedCamera: (id) => set({ selectedCameraId: id }),
  selectCameraAfterPlacement: (id) => set({ selectedCameraId: id, activeTool: 'select' }),
  setSelectedModel: (id) => set({ selectedModelId: id }),

  setShowFovPolygons: (show) => set({ showFovPolygons: show }),
  setShowZonePolygons: (show) => set({ showZonePolygons: show }),
  setShowCameraLabels: (show) => set({ showCameraLabels: show }),

  setBasemapStyle: (style) => set({ basemapStyle: style }),

  toggleCameraVisibility: (cameraId) =>
    set((state) => ({
      hiddenCameraIds: state.hiddenCameraIds.includes(cameraId)
        ? state.hiddenCameraIds.filter((id) => id !== cameraId)
        : [...state.hiddenCameraIds, cameraId],
    })),

  // ── Camera store actions ──────────────────────────────────────────────────

  hydrateCameras: (cameras) =>
    set({
      cameraIds: cameras.map((c) => c.id),
      cameraInstances: Object.fromEntries(cameras.map((c) => [c.id, c])),
      dirtyIds: new Set<string>(),
    }),

  addCamera: (camera) =>
    set((s) => ({
      cameraIds: [...s.cameraIds, camera.id],
      cameraInstances: { ...s.cameraInstances, [camera.id]: camera },
    })),

  removeCamera: (id) =>
    set((s) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [id]: _removed, ...rest } = s.cameraInstances
      const dirty = new Set(s.dirtyIds)
      dirty.delete(id)
      return {
        cameraIds: s.cameraIds.filter((i) => i !== id),
        cameraInstances: rest,
        dirtyIds: dirty,
      }
    }),

  updateCamera: (id, patch) =>
    set((s) => {
      if (!s.cameraInstances[id]) return s
      const dirty = new Set(s.dirtyIds)
      dirty.add(id)
      return {
        cameraInstances: { ...s.cameraInstances, [id]: { ...s.cameraInstances[id], ...patch } },
        dirtyIds: dirty,
      }
    }),

  clearDirty: (id) =>
    set((s) => {
      const dirty = new Set(s.dirtyIds)
      dirty.delete(id)
      return { dirtyIds: dirty }
    }),
}))
