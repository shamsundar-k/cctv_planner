import { create } from 'zustand'

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

  // Actions
  markDirty: () => void
  markSaved: () => void
  setActiveTool: (tool: ActiveTool) => void
  setSelectedCamera: (id: string | null) => void
  selectCameraAfterPlacement: (id: string) => void
  setSelectedModel: (id: string | null) => void
  setShowFovPolygons: (show: boolean) => void
  setShowZonePolygons: (show: boolean) => void
  setShowCameraLabels: (show: boolean) => void
  setBasemapStyle: (style: BasemapStyle) => void
  toggleCameraVisibility: (cameraId: string) => void
}

export const useMapViewStore = create<MapViewState>((set) => ({
  isDirty: false,
  lastSavedAt: null,

  activeTool: 'pan',

  selectedCameraId: null,
  selectedModelId: null,

  showFovPolygons: true,
  showZonePolygons: true,
  showCameraLabels: true,

  basemapStyle: 'alidade_smooth',

  hiddenCameraIds: [],

  markDirty: () => set({ isDirty: true }),
  markSaved: () => set({ isDirty: false, lastSavedAt: new Date() }),

  setActiveTool: (tool) => set({ activeTool: tool }),

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
}))
