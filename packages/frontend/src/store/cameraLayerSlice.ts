import { create } from 'zustand'
import { useMapViewStore } from './mapViewSlice'
import type { CameraModel } from '../api/cameramodel.types'

interface CameraLayerState {
  // Selection (single camera at a time)
  selectedCameraId: string | null

  // Active camera model for placement
  selectedModel: CameraModel | null

  // Actions
  selectCamera: (id: string | null, zoomLevel?: number) => void
  clearSelection: () => void
  setSelectedModel: (model: CameraModel | null) => void
}

export const useCameraLayerStore = create<CameraLayerState>((set) => ({
  selectedCameraId: null,
  selectedModel: null,
  hiddenCameraIds: [],
  showCameraLabels: true,

  selectCamera: (id, zoomLevel) => {
    set({ selectedCameraId: id })
    if (id !== null && zoomLevel !== undefined) {
      useMapViewStore.getState().leafletMap?.setZoom(zoomLevel)
    }
  },

  clearSelection: () => set({ selectedCameraId: null }),

  setSelectedModel: (model) => set({ selectedModel: model }),
}))
