import { create } from 'zustand'
import type { CameraModel } from '../types/cameramodel.types'

interface CameraLayerState {
  selectedCameraId: string | null
  selectedModel: CameraModel | null
  hiddenCameraIds: string[]
  selectCamera: (id: string | null) => void
  clearSelection: () => void
  setSelectedModel: (model: CameraModel | null) => void
  toggleCameraVisibility: (id: string) => void
}

export const useCameraLayerStore = create<CameraLayerState>((set) => ({
  selectedCameraId: null,
  selectedModel: null,
  hiddenCameraIds: [],

  selectCamera: (id) => set({ selectedCameraId: id }),

  clearSelection: () => set({ selectedCameraId: null }),

  setSelectedModel: (model) => set({ selectedModel: model }),

  toggleCameraVisibility: (id) =>
    set((s) => ({
      hiddenCameraIds: s.hiddenCameraIds.includes(id)
        ? s.hiddenCameraIds.filter((x) => x !== id)
        : [...s.hiddenCameraIds, id],
    })),
}))
