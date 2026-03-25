import { create } from 'zustand'
import { useMapViewStore } from './mapViewSlice'

interface CameraLayerState {
  // Selection (single camera at a time)
  selectedCameraId: string | null

  // Active camera model for placement
  selectedModelId: string | null

  // Per-camera visibility overrides (set of hidden IDs)
  hiddenCameraIds: string[]

  // Camera visualization
  showCameraLabels: boolean

  // Actions
  selectCamera: (id: string | null, zoomLevel?: number) => void
  clearSelection: () => void
  setSelectedModel: (id: string | null) => void
  toggleCameraVisibility: (cameraId: string) => void
  setShowCameraLabels: (show: boolean) => void
}

export const useCameraLayerStore = create<CameraLayerState>((set) => ({
  selectedCameraId: null,
  selectedModelId: null,
  hiddenCameraIds: [],
  showCameraLabels: true,

  selectCamera: (id, zoomLevel) => {
    set({ selectedCameraId: id })
    if (id !== null && zoomLevel !== undefined) {
      useMapViewStore.getState().leafletMap?.setZoom(zoomLevel)
    }
  },

  clearSelection: () => set({ selectedCameraId: null }),

  setSelectedModel: (id) => set({ selectedModelId: id }),

  toggleCameraVisibility: (cameraId) =>
    set((state) => ({
      hiddenCameraIds: state.hiddenCameraIds.includes(cameraId)
        ? state.hiddenCameraIds.filter((id) => id !== cameraId)
        : [...state.hiddenCameraIds, cameraId],
    })),

  setShowCameraLabels: (show) => set({ showCameraLabels: show }),
}))
